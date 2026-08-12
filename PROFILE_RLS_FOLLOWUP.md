# Profile RLS follow-up

The live `public.profiles` table currently has RLS disabled. It was not enabled in the avatar repair because the current product has broad profile reads and relationship queries in admin, teacher, leaderboard and challenge flows. Enabling an own-row-only policy without first migrating those flows would silently break them.

The safe next migration must:

1. move trusted role/admin authorization out of user-editable profile columns;
2. add explicit teacher/student relationship policies for `teacher_students` and challenge lookups;
3. expose only the minimum profile columns needed by leaderboard/challenges;
4. enable RLS on `profiles`, `teacher_students`, `user_enrollments` and `challenges` together;
5. test learner self-read/write, teacher relationship reads, admin authorization, and cross-user denial.

No service-role key is present in the browser. The avatar Storage RLS migration is applied independently and does not weaken profile authorization.
