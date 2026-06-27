revoke all on table public.devices from anon;
revoke all on table public.devices from authenticated;
grant all on table public.devices to service_role;
