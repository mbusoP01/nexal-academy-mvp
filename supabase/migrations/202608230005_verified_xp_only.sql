-- Persistent Academy XP is competitive/verified only. Browser-generated normal
-- practice may track local lesson progress but cannot mutate leaderboard XP.

revoke all on function public.academy_complete_practice(integer) from public, anon, authenticated;

create or replace function public.academy_create_challenge(p_target_username text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  source public.profiles;
  target public.profiles;
  challenge_id uuid;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if nullif(trim(p_target_username),'') is null then raise exception 'opponent alias required'; end if;

  select p.* into source from public.profiles p where p.id=uid;
  if source.id is null then raise exception 'learner profile required'; end if;
  if coalesce(source.role,'') <> 'student' then raise exception 'challenges are available to learner accounts only'; end if;
  if coalesce(source.grade,'') not in ('10','11','12') then raise exception 'a Grade 10–12 learner profile is required'; end if;

  select p.* into target
  from public.profiles p
  where lower(p.username)=lower(trim(p_target_username))
  limit 1;

  if target.id is null then raise exception 'opponent not found'; end if;
  if target.id=uid then raise exception 'you cannot challenge yourself'; end if;
  if coalesce(target.role,'') <> 'student' then raise exception 'opponent is not a learner account'; end if;
  if coalesce(target.grade,'')<>source.grade then raise exception 'verified challenges currently require learners in the same grade'; end if;

  if exists (
    select 1 from public.challenges c
    where c.status in ('pending','accepted')
      and ((c.challenger_id=uid and c.target_id=target.id) or (c.challenger_id=target.id and c.target_id=uid))
  ) then raise exception 'an active or pending challenge already exists'; end if;

  insert into public.challenges(challenger_id,target_id,status)
  values(uid,target.id,'pending')
  returning id into challenge_id;

  return jsonb_build_object('challenge_id',challenge_id,'target_username',target.username,'grade',source.grade);
end;
$$;

revoke all on function public.academy_create_challenge(text) from public, anon, authenticated;
grant execute on function public.academy_create_challenge(text) to authenticated;
