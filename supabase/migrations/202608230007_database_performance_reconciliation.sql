-- Low-risk indexes for Academy foreign-key and RLS access paths identified by
-- the live Supabase advisor before learner data exists.

create index if not exists trusted_staff_created_by_idx on nexal_private.trusted_staff(created_by);
create index if not exists announcements_class_id_idx on public.announcements(class_id);
create index if not exists announcements_created_by_idx on public.announcements(created_by);
create index if not exists announcements_updated_by_idx on public.announcements(updated_by);
create index if not exists assignment_submissions_learner_id_idx on public.assignment_submissions(learner_id);
create index if not exists assignments_created_by_idx on public.assignments(created_by);
create index if not exists challenges_challenger_status_idx on public.challenges(challenger_id,status);
create index if not exists challenges_target_status_idx on public.challenges(target_id,status);
create index if not exists class_memberships_learner_status_idx on public.class_memberships(learner_id,status);
create index if not exists classes_created_by_idx on public.classes(created_by);
create index if not exists teacher_class_assignments_class_active_idx on public.teacher_class_assignments(class_id,active);
create index if not exists teacher_students_teacher_idx on public.teacher_students(teacher_id);
create index if not exists teacher_students_student_idx on public.teacher_students(student_id);

drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own
on public.entitlements
for select
to authenticated
using ((select auth.uid())=user_id);
