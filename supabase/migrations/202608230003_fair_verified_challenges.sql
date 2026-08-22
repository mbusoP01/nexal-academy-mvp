-- Make verified duels fair: only learner-vs-learner in the same grade, and
-- both participants receive the same server-owned five-question set.

insert into public.challenge_question_bank(question_key,grade,subject,prompt,options,correct_index) values
('m12-probability',12,'mathematics','A fair coin is tossed once. What is the probability of getting heads?','["0","0.25","0.5","1"]'::jsonb,2),
('l12-homeostasis',12,'life-sciences','Which hormone lowers blood glucose concentration when it rises above the normal range?','["adrenaline","insulin","glucagon","thyroxine"]'::jsonb,1)
on conflict (question_key) do update set
  grade=excluded.grade,subject=excluded.subject,prompt=excluded.prompt,options=excluded.options,correct_index=excluded.correct_index,active=true;

create table if not exists public.challenge_question_sets (
  challenge_id uuid primary key references public.challenges(id) on delete cascade,
  grade smallint not null check (grade in (10,11,12)),
  question_ids uuid[] not null,
  created_at timestamptz not null default now(),
  constraint challenge_question_sets_five_check check (array_length(question_ids,1)=5)
);
alter table public.challenge_question_sets enable row level security;
revoke all on table public.challenge_question_sets from public, anon, authenticated;

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
  if source.role not in ('student','learner') then raise exception 'challenges are available to learner accounts only'; end if;
  if source.grade::text not in ('10','11','12') then raise exception 'a Grade 10–12 learner profile is required'; end if;

  select p.* into target
  from public.profiles p
  where lower(p.username)=lower(trim(p_target_username))
  limit 1;

  if target.id is null then raise exception 'opponent not found'; end if;
  if target.id=uid then raise exception 'you cannot challenge yourself'; end if;
  if target.role not in ('student','learner') then raise exception 'opponent is not a learner account'; end if;
  if target.grade::text<>source.grade::text then raise exception 'verified challenges currently require learners in the same grade'; end if;

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

create or replace function public.academy_begin_challenge_attempt(p_challenge_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  c public.challenges;
  a public.challenge_attempts;
  qset public.challenge_question_sets;
  ids uuid[];
  questions jsonb;
  learner_grade smallint;
  already_played boolean;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;

  select * into c from public.challenges where id=p_challenge_id for update;
  if c.id is null then raise exception 'challenge not found'; end if;
  if c.status<>'accepted' then raise exception 'challenge is not active'; end if;
  if uid<>c.challenger_id and uid<>c.target_id then raise exception 'challenge access denied' using errcode='42501'; end if;

  already_played := case when uid=c.challenger_id then coalesce(c.challenger_played,false) else coalesce(c.target_played,false) end;
  if already_played then raise exception 'your challenge turn is already complete'; end if;

  select p.grade::smallint into learner_grade from public.profiles p where p.id=c.challenger_id;
  if learner_grade not in (10,11,12) then raise exception 'challenge grade is invalid'; end if;

  select * into qset from public.challenge_question_sets where challenge_id=c.id for update;
  if qset.challenge_id is null then
    select array_agg(q.id) into ids
    from (
      select id from public.challenge_question_bank
      where active and grade=learner_grade
      order by random()
      limit 5
    ) q;
    if coalesce(array_length(ids,1),0)<>5 then raise exception 'challenge question bank is not ready for this grade'; end if;
    insert into public.challenge_question_sets(challenge_id,grade,question_ids)
    values(c.id,learner_grade,ids)
    returning * into qset;
  end if;

  update public.challenge_attempts
  set status='EXPIRED'
  where user_id=uid and challenge_id=c.id and status='ACTIVE' and expires_at<=now();

  select * into a
  from public.challenge_attempts
  where user_id=uid and challenge_id=c.id and status='ACTIVE' and expires_at>now()
  order by started_at desc limit 1;

  if a.id is null then
    insert into public.challenge_attempts(challenge_id,user_id,question_ids)
    values(c.id,uid,qset.question_ids)
    returning * into a;
  end if;

  select jsonb_agg(
    jsonb_build_object('id',q.id,'grade',q.grade,'subject',q.subject,'prompt',q.prompt,'options',q.options)
    order by array_position(a.question_ids,q.id)
  ) into questions
  from public.challenge_question_bank q
  where q.id=any(a.question_ids);

  return jsonb_build_object('attempt_id',a.id,'expires_at',a.expires_at,'questions',coalesce(questions,'[]'::jsonb));
end;
$$;

revoke all on function public.academy_create_challenge(text) from public, anon, authenticated;
revoke all on function public.academy_begin_challenge_attempt(uuid) from public, anon, authenticated;
grant execute on function public.academy_create_challenge(text) to authenticated;
grant execute on function public.academy_begin_challenge_attempt(uuid) to authenticated;
