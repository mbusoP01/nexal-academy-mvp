create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'FREE' check (tier in ('FREE','PREMIUM')),
  status text not null default 'active' check (status in ('active','inactive')),
  source text not null default 'owner_grant',
  starts_at timestamptz not null default now(),
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own
on public.entitlements
for select
to authenticated
using (auth.uid() = user_id);

revoke all on table public.entitlements from anon;
revoke insert, update, delete on table public.entitlements from authenticated;
grant select on table public.entitlements to authenticated;

create or replace function public.set_entitlements_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_entitlements_updated_at on public.entitlements;
create trigger set_entitlements_updated_at
before update on public.entitlements
for each row execute function public.set_entitlements_updated_at();
