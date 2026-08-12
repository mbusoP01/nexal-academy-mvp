create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 160),
  body text not null check (char_length(trim(body)) between 1 and 4000),
  priority text not null default 'NORMAL' check (priority in ('NORMAL','IMPORTANT','URGENT')),
  audience_type text not null default 'ALL' check (audience_type in ('ALL','GRADE_10','GRADE_11','GRADE_12','SUBJECT','FREE','PREMIUM')),
  grade smallint check (grade in (10,11,12)),
  subject text check (subject in ('mathematics','physical-sciences','life-sciences')),
  plan text check (plan in ('FREE','PREMIUM')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_window_check check (ends_at is null or ends_at > starts_at),
  constraint announcements_target_check check (
    (audience_type = 'SUBJECT' and subject is not null)
    or (audience_type in ('GRADE_10','GRADE_11','GRADE_12') and grade is not null)
    or (audience_type = 'FREE' and plan = 'FREE')
    or (audience_type = 'PREMIUM' and plan = 'PREMIUM')
    or (audience_type in ('ALL','SUBJECT','FREE','PREMIUM'))
  )
);

create index if not exists announcements_active_window_idx
  on public.announcements (active, starts_at, ends_at);

alter table public.announcements enable row level security;

drop policy if exists "learners read targeted active announcements" on public.announcements;
create policy "learners read targeted active announcements"
  on public.announcements for select to authenticated
  using (
    active = true
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
    and (
      audience_type = 'ALL'
      or (audience_type = 'GRADE_10' and grade = 10 and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.grade = 10))
      or (audience_type = 'GRADE_11' and grade = 11 and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.grade = 11))
      or (audience_type = 'GRADE_12' and grade = 12 and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.grade = 12))
      or (audience_type = 'FREE' and plan = 'FREE' and not exists (select 1 from public.entitlements e where e.user_id = (select auth.uid()) and e.tier = 'PREMIUM' and e.status = 'active'))
      or (audience_type = 'PREMIUM' and plan = 'PREMIUM' and exists (select 1 from public.entitlements e where e.user_id = (select auth.uid()) and e.tier = 'PREMIUM' and e.status = 'active'))
      or (
        audience_type = 'SUBJECT'
        and subject in ('mathematics','physical-sciences','life-sciences')
        and exists (
          select 1
          from public.profiles p
          where p.id = (select auth.uid())
            and p.grade in (10,11,12)
        )
      )
    )
  );

-- Management is intentionally restricted to server-side/admin tooling. No client role can write rows.
revoke all on public.announcements from anon;
revoke insert, update, delete, truncate, references, trigger on public.announcements from authenticated;
grant select on public.announcements to authenticated;
