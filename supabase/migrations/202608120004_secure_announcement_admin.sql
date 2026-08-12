create schema if not exists nexal_private;

create table if not exists nexal_private.trusted_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  staff_role text not null check (staff_role in ('admin','teacher')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table nexal_private.trusted_staff enable row level security;
revoke all on schema nexal_private from public, anon, authenticated;
revoke all on nexal_private.trusted_staff from public, anon, authenticated;

alter table public.announcements add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.announcements add column if not exists archived_at timestamptz;

create or replace function public.nexal_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, nexal_private
as $$
  select exists (
    select 1 from nexal_private.trusted_staff s
    where s.user_id = (select auth.uid())
      and s.staff_role = 'admin'
  );
$$;

create or replace function public.admin_create_announcement(
  p_title text,
  p_body text,
  p_priority text default 'NORMAL',
  p_audience_type text default 'ALL',
  p_grade smallint default null,
  p_subject text default null,
  p_plan text default null,
  p_starts_at timestamptz default now(),
  p_ends_at timestamptz default null,
  p_active boolean default true
)
returns public.announcements
language plpgsql
security definer
set search_path = public, nexal_private
as $$
declare result public.announcements;
begin
  if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode = '42501'; end if;
  if p_audience_type in ('GRADE_10','GRADE_11','GRADE_12') and p_grade is null then raise exception 'grade is required for grade audience'; end if;
  if p_audience_type = 'SUBJECT' and p_subject is null then raise exception 'subject is required for subject audience'; end if;
  if p_audience_type in ('FREE','PREMIUM') and p_plan is null then p_plan := p_audience_type; end if;
  insert into public.announcements(title, body, priority, audience_type, grade, subject, plan, starts_at, ends_at, active, created_by, updated_by)
  values (trim(p_title), trim(p_body), p_priority, p_audience_type, p_grade, p_subject, p_plan, p_starts_at, p_ends_at, p_active, (select auth.uid()), (select auth.uid()))
  returning * into result;
  return result;
end;
$$;

create or replace function public.admin_update_announcement(
  p_id uuid, p_title text, p_body text, p_priority text, p_audience_type text,
  p_grade smallint, p_subject text, p_plan text, p_starts_at timestamptz,
  p_ends_at timestamptz, p_active boolean
)
returns public.announcements
language plpgsql
security definer
set search_path = public, nexal_private
as $$
declare result public.announcements;
begin
  if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode = '42501'; end if;
  update public.announcements
    set title=trim(p_title), body=trim(p_body), priority=p_priority, audience_type=p_audience_type,
        grade=p_grade, subject=p_subject, plan=p_plan, starts_at=p_starts_at, ends_at=p_ends_at,
        active=p_active, updated_by=(select auth.uid()), updated_at=now()
    where id=p_id returning * into result;
  if result.id is null then raise exception 'announcement not found'; end if;
  return result;
end;
$$;

create or replace function public.admin_archive_announcement(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, nexal_private
as $$
begin
  if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode = '42501'; end if;
  update public.announcements set active=false, archived_at=now(), updated_by=(select auth.uid()), updated_at=now() where id=p_id;
  return found;
end;
$$;

create or replace function public.admin_list_announcements()
returns setof public.announcements
language sql
stable
security definer
set search_path = public, nexal_private
as $$
  select a.* from public.announcements a
  where public.nexal_is_admin()
  order by a.created_at desc;
$$;

revoke all on function public.nexal_is_admin() from public, anon, authenticated;
revoke all on function public.admin_create_announcement(text,text,text,text,smallint,text,text,timestamptz,timestamptz,boolean) from public, anon, authenticated;
revoke all on function public.admin_update_announcement(uuid,text,text,text,text,smallint,text,text,timestamptz,timestamptz,boolean) from public, anon, authenticated;
revoke all on function public.admin_archive_announcement(uuid) from public, anon, authenticated;
revoke all on function public.admin_list_announcements() from public, anon, authenticated;
grant execute on function public.nexal_is_admin() to authenticated;
grant execute on function public.admin_create_announcement(text,text,text,text,smallint,text,text,timestamptz,timestamptz,boolean) to authenticated;
grant execute on function public.admin_update_announcement(uuid,text,text,text,text,smallint,text,text,timestamptz,timestamptz,boolean) to authenticated;
grant execute on function public.admin_archive_announcement(uuid) to authenticated;
grant execute on function public.admin_list_announcements() to authenticated;
