-- Service categories + price currency (SYP | USD). Clients only ever see SYP: USD prices are converted with the
-- current rate (private.current_usd_rate(), migration 0080) and rounded UP to the nearest 5 new pounds.

-- ---------- categories ----------
create table if not exists public.service_categories (
  key text primary key,
  name text not null,
  short_description text not null default '',
  instructions text not null default '',
  icon text not null default 'sparkle',
  not_for_pregnant boolean not null default false,
  sort integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.service_categories enable row level security;
create policy "categories readable" on public.service_categories for select to anon, authenticated
  using (active or (select private.is_staff()));
create policy "admin manages categories" on public.service_categories for all to authenticated
  using ((select private.has_role('{admin}'))) with check ((select private.has_role('{admin}')));

alter table public.services
  add column if not exists category_id text references public.service_categories(key) on update cascade on delete set null,
  add column if not exists price_currency text not null default 'SYP' check (price_currency in ('SYP','USD'));
create index if not exists services_category_idx on public.services (category_id);

-- ---------- price helpers ----------
-- Ceil to the nearest 5 new pounds (shared rule; products can reuse it).
create or replace function public.syp_ceil5(p_amount numeric) returns integer
language sql immutable set search_path = '' as $$ select (ceil(p_amount / 5.0) * 5)::int $$;

-- Any amount in SYP/USD → SYP (null when USD and no rate exists yet).
create or replace function public.to_syp(p_amount integer, p_currency text) returns integer
language plpgsql stable security definer set search_path = '' as $$
declare r integer;
begin
  if p_amount is null then return null; end if;
  if coalesce(p_currency, 'SYP') <> 'USD' then return p_amount; end if;
  r := private.current_usd_rate();
  if r is null then return null; end if;
  return public.syp_ceil5(p_amount::numeric * r);
end $$;

create or replace function public.service_price_syp(p_key text) returns integer
language sql stable security definer set search_path = '' as $$
  select public.to_syp(s.price, s.price_currency) from public.services s where s.key = p_key;
$$;

-- All active services' client prices (for the catalogue screens).
create or replace function public.service_prices_syp() returns table (key text, price_syp integer)
language sql stable security definer set search_path = '' as $$
  select s.key, public.to_syp(s.price, s.price_currency) from public.services s where s.active or (select private.is_staff());
$$;

-- Strict variant for invoices: refuses to bill a dollar service before a rate exists.
create or replace function private.service_price_syp_strict(p_key text) returns integer
language plpgsql stable security definer set search_path = '' as $$
declare v integer;
begin
  v := public.service_price_syp(p_key);
  if v is null then raise exception 'لم يُحدَّد سعر الصرف بعد — حدّديه من المالية ← سعر الصرف'; end if;
  return v;
end $$;

revoke execute on function public.to_syp(integer, text) from public;
revoke execute on function public.service_price_syp(text) from public;
revoke execute on function public.service_prices_syp() from public;
revoke execute on function private.service_price_syp_strict(text) from public, anon;
grant execute on function public.to_syp(integer, text), public.service_price_syp(text), public.service_prices_syp() to anon, authenticated;
grant execute on function private.service_price_syp_strict(text) to authenticated;

-- ---------- price snapshots use the SYP price (patch only the price expression of the live definitions) ----------
do $$
declare d text; n text;
begin
  d := pg_get_functiondef('public.book_appointment(text,timestamptz,uuid,uuid,uuid,text,text,text,boolean)'::regprocedure);
  n := replace(d, 'svc.minutes, st, svc.price, src', 'svc.minutes, st, coalesce(public.service_price_syp(svc.key), 0), src');
  if n = d and position('service_price_syp' in d) = 0 then raise exception 'book_appointment: price expression not found'; end if;
  execute n;

  d := pg_get_functiondef('public.public_book(text,timestamptz,uuid,text,text,text)'::regprocedure);
  n := replace(d, 'svc.minutes, ''pending'', svc.price,', 'svc.minutes, ''pending'', coalesce(public.service_price_syp(svc.key), 0),');
  if n = d and position('service_price_syp' in d) = 0 then raise exception 'public_book: price expression not found'; end if;
  execute n;

  d := pg_get_functiondef('public.create_invoice(uuid,uuid,jsonb,integer,jsonb,uuid,text,date,text)'::regprocedure);
  n := replace(replace(d, 'coalesce(nullif(appt.price, 0), s.price)', 'coalesce(nullif(appt.price, 0), private.service_price_syp_strict(s.key))'),
               'price := s.price;', 'price := private.service_price_syp_strict(s.key);');
  if n = d and position('service_price_syp' in d) = 0 then raise exception 'create_invoice: price expression not found'; end if;
  execute n;
end $$;

-- Public booking catalogue: price is the SYP price (null = «السعر عند الاستفسار»), plus categories.
create or replace function public.public_booking_info() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'services', coalesce((select jsonb_agg(jsonb_build_object('key', s.key, 'name', s.name, 'short_name', s.short_name,
        'description', s.description, 'price', public.to_syp(s.price, s.price_currency), 'price_from', s.price_from, 'minutes', s.minutes,
        'is_consultation', s.is_consultation, 'category_id', s.category_id) order by c.sort nulls last, s.sort, s.name)
      from public.services s left join public.service_categories c on c.key = s.category_id
      where s.active and s.bookable_online), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(jsonb_build_object('key', c.key, 'name', c.name, 'short_description', c.short_description,
        'instructions', c.instructions, 'icon', c.icon, 'not_for_pregnant', c.not_for_pregnant) order by c.sort, c.name)
      from public.service_categories c where c.active), '[]'::jsonb),
    'specialists', coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url) order by t.created_at)
      from public.staff t where t.active and t.role = 'specialist' and not t.is_consultant), '[]'::jsonb),
    'consultant', (select jsonb_build_object('id', t.id, 'name', t.name, 'title', t.title, 'photo_url', t.photo_url)
      from public.staff t where t.active and t.is_consultant order by t.created_at limit 1),
    'hours', coalesce((select value from public.settings where key = 'hours'), '{"days":[0,1,2,3,4,6],"from":"10:00","to":"18:00","slot":15}'::jsonb),
    'centre', (select jsonb_build_object('phone', value->>'phone', 'whatsapp', value->>'whatsapp') from public.settings where key = 'centre'),
    'horizon_days', 30
  );
$$;

-- ---------- real catalogue (from the centre manager) ----------
insert into public.service_categories (key, name, short_description, instructions, icon, not_for_pregnant, sort) values
  ('consult', 'الاستشارات والمراجعات', 'استشارة أولى أو مراجعة لمتابعة نتائجكِ', '', 'msg', false, 1),
  ('skin', 'العناية بالبشرة — وجه وجسم', 'جلسات تنظيف وتقشير وتغذية لبشرة صحية ومشرقة', '', 'face', false, 2),
  ('algae', 'تقشير الطحالب', 'تقشير طبيعي يجدّد البشرة ويوحّد لونها', E'يجب أن يكون موعد الجلسة قبل المناسبة بـ 15 يوماً على الأقل.\nلا تُطبَّق الجلسة للحامل.\nيُمنع غسل المنطقة بالماء لمدة يومين، ويُمنع البخار والساونا والماء الساخن.\nاستخدمي واقي شمس مخصصاً من المركز كل 3 ساعات، وابتعدي عن الشمس لمدة يومين.\nتجنّبي العطور والكحول ومزيلات العرق القوية والحلاقة وإزالة الشعر.\nيُمنع الفرك والليفة الخشنة والسكراب وكريمات التفتيح أو المقشرات دون استشارة المركز.', 'drop', true, 3),
  ('hair', 'العناية بالشعر', 'جلسات تمنح شعركِ العناية التي يستحقها', '', 'sparkle', false, 4),
  ('lashes', 'العناية بالرموش والحواجب', 'ليفتينغ لرموش وحواجب مرفوعة بشكل طبيعي', '', 'eye', false, 5)
on conflict (key) do nothing;

-- existing hair rows (entered earlier) are updated in place, the rest inserted
update public.services set name = 'هيدرافيشال كيرافيف', short_name = 'كيرافيف',
  description = 'لمعان وانتعاش فوري: تنظيف عميق لفروة الرأس وحمّام كلاسيكي منعش', price = 1500, price_currency = 'SYP',
  minutes = 60, category_id = 'hair', sort = 2, bookable_online = true, active = true, is_consultation = false
  where name = 'هيدرافيشال كيرافيف';
update public.services set name = 'هيدرافيشال كيرافيف كريستال', short_name = 'كيرافيف كريستال',
  description = 'تنظيف عميق وإحياء الجذور: تنظيف فروة الرأس، حمّام كلاسيكي، حمّام زيت مغذٍّ، ومساج مخصص لفروة الرأس لتحفيز الدورة الدموية', price = 2000, price_currency = 'SYP',
  minutes = 60, category_id = 'hair', sort = 3, bookable_online = true, active = true, is_consultation = false
  where name = 'هيدرافيشال كيرافيف كريستال';

insert into public.services (key, name, short_name, description, price, price_from, price_currency, minutes, category_id, sort, bookable_online, active, is_consultation)
select v.* from (values
  ('consultation',       'استشارة', 'استشارة', 'جلسة تقييم لبشرتكِ ووضع خطة العناية المناسبة لكِ', 500, false, 'SYP', 30, 'consult', 1, true, true, true),
  ('follow-up',          'مراجعة', 'مراجعة', 'متابعة نتائجكِ وتعديل خطة العناية عند الحاجة', 250, false, 'SYP', 20, 'consult', 2, true, true, true),
  ('hand-care',          'جلسة العناية بكفوف اليدين', 'كفوف اليدين', '', 1000, false, 'SYP', 45, 'skin', 1, true, true, false),
  ('diamond-knees',      'تقشير ألماسي للركب أو الأكواع', 'ألماسي ركب/أكواع', '', 1000, false, 'SYP', 30, 'skin', 2, true, true, false),
  ('hydrafacial',        'هيدرافيشال / تنظيف بشرة', 'هيدرافيشال', '', 1000, false, 'SYP', 60, 'skin', 3, true, true, false),
  ('diamond-peel',       'تقشير ألماسي', 'تقشير ألماسي', '', 1500, false, 'SYP', 45, 'skin', 4, true, true, false),
  ('hydrafacial-deep',   'هيدرافيشال مع تنظيف عميق وتقشير ألماسي', 'هيدرافيشال عميق', '', 1500, false, 'SYP', 60, 'skin', 5, true, true, false),
  ('dry-skin',           'جلسة تغذية للبشرة الجافة', 'تغذية البشرة', '', 1500, false, 'SYP', 60, 'skin', 6, true, true, false),
  ('bride',              'جلسة العروس', 'العروس', '', 2000, false, 'SYP', 60, 'skin', 7, true, true, false),
  ('brightening',        'جلسة التفتيح', 'التفتيح', '', 3000, false, 'SYP', 60, 'skin', 8, true, true, false),
  ('occasions',          'جلسة المناسبات', 'المناسبات', '', 3000, false, 'SYP', 60, 'skin', 9, true, true, false),
  ('glow',               'جلسة تحفيز النضارة', 'تحفيز النضارة', '', 3000, false, 'SYP', 60, 'skin', 10, true, true, false),
  ('algae-hands',        'تقشير اليدين', 'تقشير اليدين', '', 20, false, 'USD', 30, 'algae', 1, true, true, false),
  ('algae-elbows',       'تقشير الأكواع', 'تقشير الأكواع', '', 20, false, 'USD', 30, 'algae', 2, true, true, false),
  ('algae-knees',        'تقشير الركب', 'تقشير الركب', '', 20, false, 'USD', 30, 'algae', 3, true, true, false),
  ('algae-underarm',     'تقشير الإبط', 'تقشير الإبط', '', 20, false, 'USD', 30, 'algae', 4, true, true, false),
  ('algae-back',         'تقشير الظهر', 'تقشير الظهر', '', 40, false, 'USD', 45, 'algae', 5, true, true, false),
  ('algae-legs',         'تقشير الساقين', 'تقشير الساقين', '', 40, false, 'USD', 45, 'algae', 6, true, true, false),
  ('algae-face',         'تقشير الوجه', 'تقشير الوجه', '', 4000, false, 'SYP', 45, 'algae', 7, true, true, false),
  ('hair-consultation',  'استشارة الشعر', 'استشارة الشعر', 'تقييم حالة الشعر وفروة الرأس واختيار الجلسة الأنسب لكِ', 500, false, 'SYP', 30, 'hair', 1, true, true, false),
  ('hair-revival',       'جلسة الإحياء العميق', 'الإحياء العميق', 'لإعادة بناء الشعر المتعب: تنظيف فروة الرأس، مساج مريح، حمّام زيت مكثف، حمّام كلاسيكي، وماسك الأعشاب الآسيوي المميز', 2500, false, 'SYP', 90, 'hair', 4, true, true, false),
  ('hair-elixir',        'جلسة إكسير الجمال (Mix)', 'إكسير الجمال', 'تنظيف فروة الرأس، حمّام كلاسيكي، حمّام زيت، مساج لفروة الرأس، ماسك الأعشاب الآسيوي، وجلسة تنظيف عميق للبشرة لتوهّج متكامل', 3000, false, 'SYP', 90, 'hair', 5, true, true, false),
  ('lash-lift',          'ليفتينغ الرموش', 'ليفتينغ الرموش', '', 1500, false, 'SYP', 60, 'lashes', 1, true, true, false),
  ('brow-lift',          'ليفتينغ الحواجب', 'ليفتينغ الحواجب', '', 1500, false, 'SYP', 60, 'lashes', 2, true, true, false)
) as v(key, name, short_name, description, price, price_from, price_currency, minutes, category_id, sort, bookable_online, active, is_consultation)
on conflict (key) do nothing;
