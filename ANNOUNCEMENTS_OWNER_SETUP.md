# Production announcements owner setup

The announcements table and RLS policies are deployed to Supabase project
`szqpkxlatzvwcxpwmewt`. Browser clients cannot insert, update, or delete rows.
The Admin Hub calls security-definer RPCs, which require a trusted staff row.

## Seed the first administrator

In the Supabase SQL editor for project `szqpkxlatzvwcxpwmewt`, verify the
administrator's Auth user UUID, then run:

```sql
insert into nexal_private.trusted_staff (user_id, staff_role)
values ('<AUTH_USER_UUID>', 'admin')
on conflict (user_id) do update set staff_role = excluded.staff_role;
```

The profile observed during deployment was `741b8698-70de-482e-aa9a-02152940ff4f`
(`mbusophiri01@gmail.com`), but always confirm the UUID in Authentication →
Users before inserting it. Never seed staff through the browser or by changing
`profiles.role`/`profiles.is_admin`.

## Verification

Sign in as that user, open `admin-hub.html`, and confirm the authority badge says
`Trusted admin`. Publish a temporary notice, verify it from an authenticated
learner account, then archive it. A normal learner must receive `42501` when
calling the admin RPC and must not have table write privileges.

Teacher announcement writes are intentionally not enabled until class/subject
authority is modelled and tested.

The existing `public.profiles` RLS-disabled state is a separate migration task;
do not enable it without auditing the dashboard, teacher, leaderboard, and
relationship queries that currently depend on it.
