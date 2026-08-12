create extension if not exists pgcrypto;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  grade smallint not null check (grade in (10,11,12)),
  academic_year smallint not null check (academic_year between 2020 and 2200),
  school_name text,
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists classes_active_name_year_idx on public.classes(lower(name), academic_year) where active;

create table if not exists public.class_memberships (
  class_id uuid not null references public.classes(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','PENDING','REMOVED')),
  joined_at timestamptz not null default now(),
  primary key (class_id, learner_id)
);

create table if not exists public.teacher_class_assignments (
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject text not null check (subject in ('mathematics','physical-sciences','life-sciences')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (teacher_id, class_id, subject)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject text not null check (subject in ('mathematics','physical-sciences','life-sciences')),
  unit_id text not null check (char_length(trim(unit_id)) between 3 and 180),
  title text not null check (char_length(trim(title)) between 3 and 160),
  instructions text not null default '' check (char_length(instructions) <= 4000),
  due_at timestamptz,
  published boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists assignments_class_idx on public.assignments(class_id, published, due_at);

create table if not exists public.assignment_submissions (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'NOT_STARTED' check (status in ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (assignment_id, learner_id)
);

alter table public.announcements add column if not exists class_id uuid references public.classes(id) on delete cascade;
alter table public.announcements drop constraint if exists announcements_target_check;
alter table public.announcements add constraint announcements_target_check check (
  (audience_type = 'CLASS' and class_id is not null)
  or (audience_type = 'SUBJECT' and subject is not null)
  or (audience_type in ('GRADE_10','GRADE_11','GRADE_12') and grade is not null)
  or (audience_type = 'FREE' and plan = 'FREE')
  or (audience_type = 'PREMIUM' and plan = 'PREMIUM')
  or (audience_type in ('ALL','SUBJECT','FREE','PREMIUM'))
);
alter table public.announcements drop constraint if exists announcements_audience_type_check;
alter table public.announcements add constraint announcements_audience_type_check check (audience_type in ('ALL','GRADE_10','GRADE_11','GRADE_12','SUBJECT','CLASS','FREE','PREMIUM'));

do $$ declare t text; begin
  foreach t in array array['classes','class_memberships','teacher_class_assignments','assignments','assignment_submissions'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- All writes go through authority-checked RPCs.
revoke all on public.classes, public.class_memberships, public.teacher_class_assignments, public.assignments, public.assignment_submissions from anon;
revoke insert, update, delete, truncate, references, trigger on public.classes, public.class_memberships, public.teacher_class_assignments, public.assignments from authenticated;
grant select on public.classes, public.class_memberships, public.teacher_class_assignments, public.assignments to authenticated;
grant select, insert, update on public.assignment_submissions to authenticated;

drop policy if exists "class members read their classes" on public.classes;
create policy "class members read their classes" on public.classes for select to authenticated using (
  public.nexal_is_admin() or exists (select 1 from public.class_memberships m where m.class_id=id and m.learner_id=(select auth.uid()) and m.status='ACTIVE') or exists (select 1 from public.teacher_class_assignments a where a.class_id=id and a.teacher_id=(select auth.uid()) and a.active)
);
drop policy if exists "learners read own memberships" on public.class_memberships;
create policy "learners read own memberships" on public.class_memberships for select to authenticated using (public.nexal_is_admin() or learner_id=(select auth.uid()) or exists (select 1 from public.teacher_class_assignments a where a.class_id=class_id and a.teacher_id=(select auth.uid()) and a.active));
drop policy if exists "staff read authorised class subjects" on public.teacher_class_assignments;
create policy "staff read authorised class subjects" on public.teacher_class_assignments for select to authenticated using (public.nexal_is_admin() or teacher_id=(select auth.uid()));
drop policy if exists "assignment audience read" on public.assignments;
create policy "assignment audience read" on public.assignments for select to authenticated using (public.nexal_is_admin() or exists (select 1 from public.class_memberships m where m.class_id=assignments.class_id and m.learner_id=(select auth.uid()) and m.status='ACTIVE' and assignments.published) or exists (select 1 from public.teacher_class_assignments a where a.class_id=assignments.class_id and a.teacher_id=(select auth.uid()) and a.subject=assignments.subject and a.active));
drop policy if exists "learners manage own assignment submissions" on public.assignment_submissions;
create policy "learners manage own assignment submissions" on public.assignment_submissions for all to authenticated using (learner_id=(select auth.uid()) or public.nexal_is_admin()) with check (learner_id=(select auth.uid()) or public.nexal_is_admin());

create or replace function public.admin_create_class(p_name text,p_grade smallint,p_academic_year smallint,p_school_name text default null) returns public.classes language plpgsql security definer set search_path=public,nexal_private as $$ declare result public.classes; begin if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode='42501'; end if; insert into public.classes(name,grade,academic_year,school_name,created_by) values(trim(p_name),p_grade,p_academic_year,nullif(trim(p_school_name),''),(select auth.uid())) returning * into result; return result; end $$;
create or replace function public.admin_add_class_member(p_class_id uuid,p_learner_id uuid) returns public.class_memberships language plpgsql security definer set search_path=public,nexal_private as $$ declare result public.class_memberships; begin if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode='42501'; end if; if not exists(select 1 from public.classes c join public.profiles p on p.grade::text=c.grade::text where c.id=p_class_id and p.id=p_learner_id) then raise exception 'learner grade does not match class'; end if; insert into public.class_memberships(class_id,learner_id) values(p_class_id,p_learner_id) on conflict (class_id,learner_id) do update set status='ACTIVE' returning * into result; return result; end $$;
create or replace function public.admin_assign_teacher(p_teacher_id uuid,p_class_id uuid,p_subject text) returns public.teacher_class_assignments language plpgsql security definer set search_path=public,nexal_private as $$ declare result public.teacher_class_assignments; begin if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode='42501'; end if; if not exists(select 1 from nexal_private.trusted_staff s where s.user_id=p_teacher_id and s.staff_role='teacher') then raise exception 'teacher is not trusted'; end if; insert into public.teacher_class_assignments(teacher_id,class_id,subject) values(p_teacher_id,p_class_id,p_subject) on conflict (teacher_id,class_id,subject) do update set active=true returning * into result; return result; end $$;
create or replace function public.admin_archive_class(p_class_id uuid) returns boolean language plpgsql security definer set search_path=public,nexal_private as $$ begin if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode='42501'; end if; update public.classes set active=false,updated_at=now() where id=p_class_id; return found; end $$;
create or replace function public.teacher_create_assignment(p_class_id uuid,p_subject text,p_unit_id text,p_title text,p_instructions text default '',p_due_at timestamptz default null,p_published boolean default false) returns public.assignments language plpgsql security definer set search_path=public,nexal_private as $$ declare c public.classes; result public.assignments; begin select * into c from public.classes where id=p_class_id and active; if c.id is null then raise exception 'class not found'; end if; if not exists(select 1 from public.teacher_class_assignments a where a.teacher_id=(select auth.uid()) and a.class_id=p_class_id and a.subject=p_subject and a.active) and not public.nexal_is_admin() then raise exception 'teacher authority required'; end if; if p_unit_id !~ ('-g' || c.grade::text || '-') then raise exception 'unit grade does not match class grade'; end if; insert into public.assignments(class_id,subject,unit_id,title,instructions,due_at,published,created_by) values(p_class_id,p_subject,trim(p_unit_id),trim(p_title),trim(p_instructions),p_due_at,p_published,(select auth.uid())) returning * into result; return result; end $$;
create or replace function public.teacher_create_class_announcement(p_class_id uuid,p_subject text,p_title text,p_body text,p_priority text default 'NORMAL',p_starts_at timestamptz default now(),p_ends_at timestamptz default null) returns public.announcements language plpgsql security definer set search_path=public,nexal_private as $$ declare result public.announcements; begin if not exists(select 1 from public.teacher_class_assignments a where a.teacher_id=(select auth.uid()) and a.class_id=p_class_id and a.subject=p_subject and a.active) then raise exception 'teacher authority required' using errcode='42501'; end if; insert into public.announcements(title,body,priority,audience_type,class_id,subject,starts_at,ends_at,active,created_by,updated_by) values(trim(p_title),trim(p_body),p_priority,'CLASS',p_class_id,p_subject,p_starts_at,p_ends_at,true,(select auth.uid()),(select auth.uid())) returning * into result; return result; end $$;

create or replace function public.admin_add_trusted_teacher(p_email text) returns uuid language plpgsql security definer set search_path=public,nexal_private as $$ declare uid uuid; begin if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode='42501'; end if; select id into uid from auth.users where lower(email)=lower(trim(p_email)); if uid is null then raise exception 'user not found'; end if; insert into nexal_private.trusted_staff(user_id,staff_role,created_by) values(uid,'teacher',(select auth.uid())) on conflict(user_id) do update set staff_role='teacher'; return uid; end $$;

create or replace function public.admin_create_announcement(p_title text,p_body text,p_priority text default 'NORMAL',p_audience_type text default 'ALL',p_grade smallint default null,p_subject text default null,p_plan text default null,p_starts_at timestamptz default now(),p_ends_at timestamptz default null,p_active boolean default true,p_class_id uuid default null) returns public.announcements language plpgsql security definer set search_path=public,nexal_private as $$ declare result public.announcements; begin if not public.nexal_is_admin() then raise exception 'admin authority required' using errcode='42501'; end if; insert into public.announcements(title,body,priority,audience_type,grade,subject,plan,starts_at,ends_at,active,class_id,created_by,updated_by) values(trim(p_title),trim(p_body),p_priority,p_audience_type,p_grade,p_subject,p_plan,p_starts_at,p_ends_at,p_active,p_class_id,(select auth.uid()),(select auth.uid())) returning * into result; return result; end $$;

revoke all on function public.admin_create_class(text,smallint,smallint,text) from public,anon,authenticated;
revoke all on function public.admin_add_class_member(uuid,uuid) from public,anon,authenticated;
revoke all on function public.admin_assign_teacher(uuid,uuid,text) from public,anon,authenticated;
revoke all on function public.admin_archive_class(uuid) from public,anon,authenticated;
revoke all on function public.teacher_create_assignment(uuid,text,text,text,text,timestamptz,boolean) from public,anon,authenticated;
revoke all on function public.teacher_create_class_announcement(uuid,text,text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.admin_add_trusted_teacher(text) from public,anon,authenticated;
revoke all on function public.admin_create_announcement(text,text,text,text,smallint,text,text,timestamptz,timestamptz,boolean,uuid) from public,anon,authenticated;
grant execute on function public.admin_create_class(text,smallint,smallint,text) to authenticated;
grant execute on function public.admin_add_class_member(uuid,uuid) to authenticated;
grant execute on function public.admin_assign_teacher(uuid,uuid,text) to authenticated;
grant execute on function public.admin_archive_class(uuid) to authenticated;
grant execute on function public.teacher_create_assignment(uuid,text,text,text,text,timestamptz,boolean) to authenticated;
grant execute on function public.teacher_create_class_announcement(uuid,text,text,text,text,timestamptz,timestamptz) to authenticated;
grant execute on function public.admin_add_trusted_teacher(text) to authenticated;
grant execute on function public.admin_create_announcement(text,text,text,text,smallint,text,text,timestamptz,timestamptz,boolean,uuid) to authenticated;

drop policy if exists "learners read targeted active announcements" on public.announcements;
create policy "learners read targeted active announcements" on public.announcements for select to authenticated using (
 active=true and starts_at<=now() and (ends_at is null or ends_at>now()) and (
 audience_type='ALL'
 or (audience_type='CLASS' and exists(select 1 from public.class_memberships m where m.class_id=announcements.class_id and m.learner_id=(select auth.uid()) and m.status='ACTIVE'))
 or (audience_type='GRADE_10' and grade=10 and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.grade='10'))
 or (audience_type='GRADE_11' and grade=11 and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.grade='11'))
 or (audience_type='GRADE_12' and grade=12 and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.grade='12'))
 or (audience_type='FREE' and plan='FREE' and not exists(select 1 from public.entitlements e where e.user_id=(select auth.uid()) and e.tier='PREMIUM' and e.status='active'))
 or (audience_type='PREMIUM' and plan='PREMIUM' and exists(select 1 from public.entitlements e where e.user_id=(select auth.uid()) and e.tier='PREMIUM' and e.status='active'))
 or (audience_type='SUBJECT' and subject in ('mathematics','physical-sciences','life-sciences') and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.grade in ('10','11','12')))
 ));
