-- Reconcile live Academy security state discovered during the 2026-08-23 audit.
-- This migration closes legacy RLS gaps, fixes class-membership correlation,
-- constrains learner submissions, hardens teacher unit scope, and makes avatars private.

-- ---------------------------------------------------------------------------
-- Legacy relationships: no anonymous access. Only parties to a relationship
-- may read it; these legacy tables are not used for client-side writes.
-- ---------------------------------------------------------------------------
alter table public.teacher_students enable row level security;
drop policy if exists teacher_students_read_parties on public.teacher_students;
create policy teacher_students_read_parties
on public.teacher_students
for select
to authenticated
using (
  teacher_id=(select auth.uid())
  or student_id=(select auth.uid())
  or public.nexal_is_admin()
);
revoke all on table public.teacher_students from anon, authenticated;
grant select on table public.teacher_students to authenticated;

alter table public.user_enrollments enable row level security;
drop policy if exists user_enrollments_read_own on public.user_enrollments;
drop policy if exists user_enrollments_insert_own on public.user_enrollments;
drop policy if exists user_enrollments_delete_own on public.user_enrollments;
create policy user_enrollments_read_own
on public.user_enrollments
for select
to authenticated
using (user_id=(select auth.uid()) or public.nexal_is_admin());
create policy user_enrollments_insert_own
on public.user_enrollments
for insert
to authenticated
with check (user_id=(select auth.uid()));
create policy user_enrollments_delete_own
on public.user_enrollments
for delete
to authenticated
using (user_id=(select auth.uid()) or public.nexal_is_admin());
revoke all on table public.user_enrollments from anon, authenticated;
grant select, insert, delete on table public.user_enrollments to authenticated;

-- ---------------------------------------------------------------------------
-- Fix teacher membership visibility. The prior live policy accidentally used
-- a.class_id = a.class_id, which did not correlate to the membership row.
-- ---------------------------------------------------------------------------
drop policy if exists "learners read own memberships" on public.class_memberships;
create policy "learners read own memberships"
on public.class_memberships
for select
to authenticated
using (
  public.nexal_is_admin()
  or learner_id=(select auth.uid())
  or exists (
    select 1 from public.teacher_class_assignments a
    where a.class_id=class_memberships.class_id
      and a.teacher_id=(select auth.uid())
      and a.active
  )
);

-- ---------------------------------------------------------------------------
-- Submission rows may only be created/updated by the learner for a published
-- assignment in an actively joined class. Teachers may read submissions only
-- for the exact class+subject they are assigned to. Admins retain authority.
-- ---------------------------------------------------------------------------
drop policy if exists "learners manage own assignment submissions" on public.assignment_submissions;
drop policy if exists assignment_submissions_select_authorized on public.assignment_submissions;
drop policy if exists assignment_submissions_insert_authorized on public.assignment_submissions;
drop policy if exists assignment_submissions_update_authorized on public.assignment_submissions;

create policy assignment_submissions_select_authorized
on public.assignment_submissions
for select
to authenticated
using (
  public.nexal_is_admin()
  or (
    learner_id=(select auth.uid())
    and exists (
      select 1
      from public.assignments x
      join public.class_memberships m on m.class_id=x.class_id
      where x.id=assignment_submissions.assignment_id
        and x.published
        and m.learner_id=(select auth.uid())
        and m.status='ACTIVE'
    )
  )
  or exists (
    select 1
    from public.assignments x
    join public.teacher_class_assignments t
      on t.class_id=x.class_id and t.subject=x.subject
    where x.id=assignment_submissions.assignment_id
      and t.teacher_id=(select auth.uid())
      and t.active
  )
);

create policy assignment_submissions_insert_authorized
on public.assignment_submissions
for insert
to authenticated
with check (
  public.nexal_is_admin()
  or (
    learner_id=(select auth.uid())
    and exists (
      select 1
      from public.assignments x
      join public.class_memberships m on m.class_id=x.class_id
      where x.id=assignment_submissions.assignment_id
        and x.published
        and m.learner_id=(select auth.uid())
        and m.status='ACTIVE'
    )
  )
);

create policy assignment_submissions_update_authorized
on public.assignment_submissions
for update
to authenticated
using (
  public.nexal_is_admin()
  or (
    learner_id=(select auth.uid())
    and exists (
      select 1
      from public.assignments x
      join public.class_memberships m on m.class_id=x.class_id
      where x.id=assignment_submissions.assignment_id
        and x.published
        and m.learner_id=(select auth.uid())
        and m.status='ACTIVE'
    )
  )
)
with check (
  public.nexal_is_admin()
  or (
    learner_id=(select auth.uid())
    and exists (
      select 1
      from public.assignments x
      join public.class_memberships m on m.class_id=x.class_id
      where x.id=assignment_submissions.assignment_id
        and x.published
        and m.learner_id=(select auth.uid())
        and m.status='ACTIVE'
    )
  )
);

revoke all on table public.assignment_submissions from anon, authenticated;
grant select, insert, update on table public.assignment_submissions to authenticated;

-- ---------------------------------------------------------------------------
-- Teacher-created assignments must bind the unit ID to both the authorised
-- subject and the selected class grade, not merely the grade substring.
-- ---------------------------------------------------------------------------
create or replace function public.teacher_create_assignment(
  p_class_id uuid,
  p_subject text,
  p_unit_id text,
  p_title text,
  p_instructions text default '',
  p_due_at timestamptz default null,
  p_published boolean default false
)
returns public.assignments
language plpgsql
security definer
set search_path=public,nexal_private,pg_temp
as $$
declare
  c public.classes;
  result public.assignments;
begin
  select * into c from public.classes where id=p_class_id and active;
  if c.id is null then raise exception 'class not found'; end if;
  if p_subject not in ('mathematics','physical-sciences','life-sciences') then
    raise exception 'invalid subject';
  end if;
  if not exists(
    select 1 from public.teacher_class_assignments a
    where a.teacher_id=(select auth.uid())
      and a.class_id=p_class_id
      and a.subject=p_subject
      and a.active
  ) and not public.nexal_is_admin() then
    raise exception 'teacher authority required' using errcode='42501';
  end if;
  if p_unit_id !~ ('^' || p_subject || '-g' || c.grade::text || '-') then
    raise exception 'unit subject or grade does not match class scope';
  end if;
  insert into public.assignments(class_id,subject,unit_id,title,instructions,due_at,published,created_by)
  values(p_class_id,p_subject,trim(p_unit_id),trim(p_title),trim(p_instructions),p_due_at,p_published,(select auth.uid()))
  returning * into result;
  return result;
end;
$$;
revoke all on function public.teacher_create_assignment(uuid,text,text,text,text,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.teacher_create_assignment(uuid,text,text,text,text,timestamptz,boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Avatars: private, small, image-only. Existing owner-folder object policies
-- remain the access boundary and signed URLs are generated by the client helper.
-- ---------------------------------------------------------------------------
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set
  name=excluded.name,
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "avatars_insert_own_folder" on storage.objects;
drop policy if exists "avatars_select_own_folder" on storage.objects;
drop policy if exists "avatars_update_own_folder" on storage.objects;
drop policy if exists "avatars_delete_own_folder" on storage.objects;
create policy "avatars_insert_own_folder" on storage.objects for insert to authenticated
with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "avatars_select_own_folder" on storage.objects for select to authenticated
using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "avatars_update_own_folder" on storage.objects for update to authenticated
using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid()::text))
with check(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid()::text));
create policy "avatars_delete_own_folder" on storage.objects for delete to authenticated
using(bucket_id='avatars' and (storage.foldername(name))[1]=(select auth.uid()::text));
