do $$
begin
  if exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'demographic_types'
      and e.enumlabel = 'Mixed'
  ) and not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname = 'demographic_types'
      and e.enumlabel = 'Mixed (segregated)'
  ) then
    alter type public.demographic_types rename value 'Mixed' to 'Mixed (segregated)';
  end if;
end $$;

alter type public.demographic_types add value if not exists 'Mixed (not segregated)';
