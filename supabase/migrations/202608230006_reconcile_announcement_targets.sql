-- Live Academy reconciliation: require each targeted announcement type to carry
-- the target field its learner policy expects. The prior constraint contained
-- a catch-all that accidentally allowed SUBJECT/FREE/PREMIUM without targets.

alter table public.announcements drop constraint if exists announcements_target_check;
alter table public.announcements add constraint announcements_target_check check (
  (audience_type='CLASS' and class_id is not null)
  or (audience_type='SUBJECT' and subject is not null)
  or (audience_type in ('GRADE_10','GRADE_11','GRADE_12') and grade is not null)
  or (audience_type='FREE' and plan='FREE')
  or (audience_type='PREMIUM' and plan='PREMIUM')
  or audience_type='ALL'
);
