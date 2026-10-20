-- to_syp is internal (called by the SECURITY DEFINER price functions); it would otherwise let anyone read the rate directly.
-- Clients read prices through service_prices_syp() and public_booking_info().
revoke execute on function public.to_syp(integer, text) from anon, authenticated;
revoke execute on function public.service_price_syp(text) from anon;
