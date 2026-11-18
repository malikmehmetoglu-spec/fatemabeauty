-- Non-Syrian clients: a number typed with + or 00 and a country code other than 963 is kept as +<digits> (7–15 digits).
create or replace function private.norm_phone_sy(p text)
 returns text language sql immutable set search_path to '' as $f$
  select case
    when intl and d0 !~ '^963' then case when d0 ~ '^[1-9][0-9]{6,14}$' then '+' || d0 end
    when d ~ '^9[0-9]{8}$' then '+963' || d end
  from (select coalesce(p, '') ~ '^\s*(\+|00)' as intl,
               regexp_replace(regexp_replace(coalesce(p, ''), '\D', '', 'g'), '^00', '') as d0,
               regexp_replace(regexp_replace(coalesce(p, ''), '\D', '', 'g'), '^(00963|963|0)', '') as d) x
$f$;
