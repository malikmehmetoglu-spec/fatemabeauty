-- Migration to add "استشارة بعد جلسة" service
INSERT INTO services (
  key,
  name,
  short_name,
  description,
  price,
  price_from,
  minutes,
  room_id,
  device_id,
  bookable_online,
  active,
  sort,
  is_consultation,
  category_id,
  price_currency,
  is_online
) VALUES (
  'post-session-consultation',
  'استشارة بعد جلسة',
  'استشارة بعد جلسة',
  'استشارة ومتابعة بعد الجلسة للاطمئنان على النتائج وتقديم التوجيهات',
  250,
  false,
  15,
  '2cac4298-e941-4174-bfa2-eeb55bb1068c',
  null,
  true,
  true,
  4,
  true,
  'consult',
  'SYP',
  false
) ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  minutes = EXCLUDED.minutes,
  active = EXCLUDED.active;

-- Link to Fatima Tayba
INSERT INTO staff_services (staff_id, service_key)
SELECT id, 'post-session-consultation'
FROM staff
WHERE role = 'admin' OR is_consultant = true
ON CONFLICT DO NOTHING;
