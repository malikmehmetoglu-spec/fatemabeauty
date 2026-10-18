-- NOTE: this reference data was later cleared at the owner's request (all data is now entered from the admin panel).
-- Applied to Supabase project btcyrzvaexmgffeamlmg as migration «seed_reference_data».

insert into public.rooms (name, sort) values ('غرفة 1', 1), ('غرفة 2', 2), ('غرفة 3', 3);

insert into public.devices (name, room_id) values
  ('جهاز الهيدرافيشل', (select id from public.rooms where name = 'غرفة 1')),
  ('جهاز الليزر', (select id from public.rooms where name = 'غرفة 3'));

insert into public.services (key, name, short_name, description, price, price_from, minutes, room_id, device_id, sort) values
  ('clean', 'تنظيف عميق للبشرة', 'تنظيف عميق', 'تنظيف المسام وإزالة الرؤوس السوداء', 1500, false, 60, (select id from public.rooms where name = 'غرفة 1'), null, 1),
  ('hydra', 'هيدرافيشل', 'هيدرافيشل', 'تنظيف وترطيب عميق بالجهاز', 2000, false, 60, (select id from public.rooms where name = 'غرفة 1'), (select id from public.devices where name = 'جهاز الهيدرافيشل'), 2),
  ('peel', 'تقشير البشرة', 'تقشير البشرة', 'تجديد البشرة وتوحيد لونها', 2000, false, 45, (select id from public.rooms where name = 'غرفة 2'), null, 3),
  ('laser', 'جلسة ليزر', 'جلسة ليزر', 'السعر حسب المنطقة', 3500, true, 45, (select id from public.rooms where name = 'غرفة 3'), (select id from public.devices where name = 'جهاز الليزر'), 4),
  ('consult', 'استشارة في المركز', 'استشارة', 'تقييم بشرتكِ وخطة تناسبها', 0, false, 20, (select id from public.rooms where name = 'غرفة 2'), null, 5);

insert into public.packages (service_key, name, sessions, price) values
  ('clean', 'باقة تنظيف عميق للبشرة', 6, 7500),
  ('hydra', 'باقة هيدرافيشل', 6, 10000),
  ('peel', 'باقة تقشير البشرة', 6, 10000);

insert into public.products (key, name, size, category, price, stock, recommended, sort) values
  ('clean', 'غسول لطيف للوجه', '150 مل', 'الغسولات', 2500, 0, true, 1),
  ('hyal', 'سيروم الهيالورونيك', '30 مل', 'السيرومات', 1100, 0, true, 2),
  ('spf', 'واقي شمس SPF 50', '50 مل', 'الحماية', 2000, 0, true, 3),
  ('vitc', 'سيروم فيتامين C', '30 مل', 'السيرومات', 2000, 0, false, 4),
  ('moist', 'مرطب خفيف للوجه', '50 مل', 'الترطيب', 1700, 0, false, 5),
  ('mask', 'ماسك مهدّئ', '100 مل', 'الأقنعة', null, 0, false, 6);

insert into public.staff (name, title, role, photo_url) values
  ('فاطمة طيبة', 'أخصائية عناية بالبشرة', 'admin', '/images/fatema.jpg');

insert into public.settings (key, value) values
  ('policies', '{"free_change_hours": 6, "reminders_hours": [24, 2], "max_discount_without_approval": 10}'),
  ('call', '{"voice": "female", "languages": ["ar", "en"], "repeat": 2, "by_number_only": true}'),
  ('centre', '{"name": "Fatema Beauty — Skin Care Center", "name_ar": "فاطمة بيوتي", "timezone": "Asia/Damascus", "currency": "ل.س"}');
