create or replace function public.approve_organization_application(
  p_application_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_application_user_id uuid;
  v_claims jsonb;
  v_is_admin boolean;
begin
  if p_application_id is null then
    raise exception 'application_id_required'
      using errcode = '22023';
  end if;

  v_claims := coalesce(auth.jwt(), '{}'::jsonb);
  v_is_admin :=
    auth.role() = 'service_role'
    or v_claims #>> '{app_metadata,role}' = 'admin'
    or lower(coalesce(v_claims #>> '{app_metadata,is_admin}', 'false')) = 'true';

  if not v_is_admin then
    raise exception 'admin_required'
      using errcode = '42501';
  end if;

  update public.organization_applications
  set
    application_status = 'approved',
    updated_at = now()
  where id = p_application_id
  returning user_id into v_application_user_id;

  if v_application_user_id is null then
    raise exception 'application_not_found'
      using errcode = 'P0002';
  end if;

  update public.profiles
  set
    is_org = true,
    updated_at = now()
  where id = v_application_user_id;

  if not found then
    raise exception 'application_profile_not_found'
      using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.approve_organization_application(uuid) from public;
grant execute on function public.approve_organization_application(uuid) to authenticated;
grant execute on function public.approve_organization_application(uuid) to service_role;
