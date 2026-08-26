-- Remove cross-user profile row access from challenge participants. Challenge
-- lists expose only the opponent alias through a SECURITY DEFINER RPC.

drop policy if exists profiles_select_authorized on public.profiles;
create policy profiles_select_authorized
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.nexal_is_admin()
);

-- A normal learner may read their own complete profile; a trusted admin may
-- read all profiles through the same RLS policy. Other learners get no row.
revoke all on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, role, username, email, country, phone, school_name, avatar_url, age, grade, teacher_code)
on public.profiles to authenticated;
grant update (role, username, email, country, phone, school_name, avatar_url, age, grade, teacher_code)
on public.profiles to authenticated;

create or replace function public.academy_list_my_challenges()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with me as (select auth.uid() as uid), rows as (
    select
      c.id,
      c.status,
      c.challenger_played,
      c.target_played,
      c.challenger_score,
      c.target_score,
      (c.challenger_id = me.uid) as is_challenger,
      case when c.challenger_id = me.uid then target.username else challenger.username end as opponent_username
    from public.challenges c
    cross join me
    join public.profiles challenger on challenger.id = c.challenger_id
    join public.profiles target on target.id = c.target_id
    where me.uid is not null
      and (c.challenger_id = me.uid or c.target_id = me.uid)
      and c.status in ('pending','accepted')
    order by c.id desc
  )
  select coalesce(jsonb_agg(to_jsonb(rows)), '[]'::jsonb) from rows;
$$;

revoke all on function public.academy_list_my_challenges() from public, anon, authenticated;
grant execute on function public.academy_list_my_challenges() to authenticated;
