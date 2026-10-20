-- Hourly USD rate sync from sp-today.com via the «fx-sync» Edge Function (pg_cron + pg_net).
create extension if not exists pg_net;
create extension if not exists pg_cron;
select cron.schedule('fx-sync-hourly', '5 * * * *',
  $$ select net.http_post(url := 'https://btcyrzvaexmgffeamlmg.supabase.co/functions/v1/fx-sync', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{}'::jsonb); $$);
