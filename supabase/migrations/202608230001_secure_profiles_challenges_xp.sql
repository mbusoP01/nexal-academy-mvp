-- Academy production security boundary for profiles, challenges and XP.
-- Browser clients may read only the public profile columns they need. Sensitive
-- self-profile reads and all competitive writes go through authority-checked RPCs.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Profiles: own-row writes, minimal cross-user reads, no direct XP mutation.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_authorized on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;

create policy profiles_select_authorized
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.nexal_is_admin()
  or exists (
    select 1
    from public.challenges c
    where (c.challenger_id = (select auth.uid()) and c.target_id = profiles.id)
       or (c.target_id = (select auth.uid()) and c.challenger_id = profiles.id)
  )
);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke all on table public.profiles from anon;
revoke all on table public.profiles from authenticated;

-- Public-to-an-authenticated-user profile surface. Sensitive fields such as
-- email/phone/country/age/teacher_code are intentionally not directly readable.
grant select (id, username, school_name, xp, avatar_url, grade, role)
on public.profiles to authenticated;

-- Onboarding/settings may maintain the owner's profile, but XP is excluded.
grant insert (id, role, username, email, country, phone, school_name, avatar_url, age, grade, teacher_code)
on public.profiles to authenticated;
grant update (role, username, email, country, phone, school_name, avatar_url, age, grade, teacher_code)
on public.profiles to authenticated;

create or replace function public.academy_get_my_profile()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(to_jsonb(p), '{}'::jsonb)
  from public.profiles p
  where p.id = (select auth.uid());
$$;

create or replace function public.academy_admin_list_profiles()
returns setof public.profiles
language plpgsql
stable
security definer
set search_path = public, nexal_private, pg_temp
as $$
begin
  if not public.nexal_is_admin() then
    raise exception 'admin authority required' using errcode = '42501';
  end if;
  return query select p.* from public.profiles p order by p.username nulls last;
end;
$$;

revoke all on function public.academy_get_my_profile() from public, anon, authenticated;
revoke all on function public.academy_admin_list_profiles() from public, anon, authenticated;
grant execute on function public.academy_get_my_profile() to authenticated;
grant execute on function public.academy_admin_list_profiles() to authenticated;

-- ---------------------------------------------------------------------------
-- Challenges: no browser DML. All lifecycle changes are RPC-controlled.
-- ---------------------------------------------------------------------------
alter table public.challenges enable row level security;

drop policy if exists challenges_participant_select on public.challenges;
create policy challenges_participant_select
on public.challenges
for select
to authenticated
using (
  challenger_id = (select auth.uid())
  or target_id = (select auth.uid())
  or public.nexal_is_admin()
);

revoke all on table public.challenges from anon;
revoke all on table public.challenges from authenticated;
grant select on table public.challenges to authenticated;

create table if not exists public.challenge_question_bank (
  id uuid primary key default gen_random_uuid(),
  question_key text not null unique,
  grade smallint not null check (grade in (10,11,12)),
  subject text not null check (subject in ('mathematics','physical-sciences','life-sciences')),
  prompt text not null check (char_length(trim(prompt)) between 3 and 1000),
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.challenge_question_bank enable row level security;
revoke all on table public.challenge_question_bank from public, anon, authenticated;

insert into public.challenge_question_bank(question_key,grade,subject,prompt,options,correct_index) values
('m10-linear-gradient',10,'mathematics','What is the gradient of the line through (1, 2) and (3, 6)?','["1","2","3","4"]'::jsonb,1),
('m10-factor-roots',10,'mathematics','Which pair are the roots of x² - 5x + 6 = 0?','["1 and 6","2 and 3","-2 and -3","-1 and -6"]'::jsonb,1),
('m10-trig-sin30',10,'mathematics','What is sin 30°?','["0","0.5","1","√3"]'::jsonb,1),
('m11-sequence',11,'mathematics','An arithmetic sequence starts 4, 7, 10, ... What is the common difference?','["2","3","4","7"]'::jsonb,1),
('m12-derivative',12,'mathematics','What is the derivative of x² with respect to x?','["x","2x","x²","2"]'::jsonb,1),
('p10-force-unit',10,'physical-sciences','What is the SI unit of force?','["joule","newton","watt","pascal"]'::jsonb,1),
('p10-acceleration',10,'physical-sciences','A car changes velocity from 0 m·s⁻¹ to 20 m·s⁻¹ in 5 s. What is its average acceleration?','["2 m·s⁻²","4 m·s⁻²","5 m·s⁻²","100 m·s⁻²"]'::jsonb,1),
('p11-ohm',11,'physical-sciences','A 12 V potential difference is applied across a 4 Ω resistor. What current flows?','["0.33 A","3 A","8 A","48 A"]'::jsonb,1),
('p11-momentum-unit',11,'physical-sciences','Which is a correct SI unit for momentum?','["kg·m·s⁻¹","kg·m·s⁻²","J·s⁻¹","C·s⁻¹"]'::jsonb,0),
('p12-wave',12,'physical-sciences','If wave speed is 12 m·s⁻¹ and frequency is 3 Hz, what is the wavelength?','["2 m","4 m","9 m","36 m"]'::jsonb,1),
('l10-cell-organelle',10,'life-sciences','Which organelle is the main site of cellular respiration in eukaryotic cells?','["ribosome","mitochondrion","nucleus","Golgi apparatus"]'::jsonb,1),
('l10-photosynthesis',10,'life-sciences','Which organelle contains chlorophyll and is the main site of photosynthesis?','["chloroplast","lysosome","mitochondrion","centrosome"]'::jsonb,0),
('l11-dna-pairing',11,'life-sciences','In DNA, adenine pairs with which base?','["cytosine","guanine","thymine","uracil"]'::jsonb,2),
('l11-mitosis',11,'life-sciences','What is the main result of mitosis in a diploid body cell?','["Four genetically different haploid cells","Two genetically similar diploid cells","One haploid cell","Two genetically different haploid cells"]'::jsonb,1),
('l12-natural-selection',12,'life-sciences','Natural selection is most directly driven by differences in what?','["acquired traits only","survival and reproductive success","cell size","daily temperature"]'::jsonb,1)
on conflict (question_key) do update set
  grade = excluded.grade,
  subject = excluded.subject,
  prompt = excluded.prompt,
  options = excluded.options,
  correct_index = excluded.correct_index,
  active = true;

create table if not exists public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_ids uuid[] not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','SUBMITTED','EXPIRED')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  submitted_at timestamptz
);
create index if not exists challenge_attempts_user_status_idx
  on public.challenge_attempts(user_id, challenge_id, status, expires_at);

create table if not exists public.challenge_attempt_answers (
  attempt_id uuid not null references public.challenge_attempts(id) on delete cascade,
  question_id uuid not null references public.challenge_question_bank(id) on delete restrict,
  selected_index smallint not null check (selected_index between 0 and 3),
  correct boolean not null,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

alter table public.challenge_attempts enable row level security;
alter table public.challenge_attempt_answers enable row level security;
revoke all on table public.challenge_attempts, public.challenge_attempt_answers from public, anon, authenticated;

create or replace function public.academy_create_challenge(p_target_username text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  target public.profiles;
  challenge_id uuid;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if nullif(trim(p_target_username),'') is null then raise exception 'opponent alias required'; end if;

  select p.* into target
  from public.profiles p
  where lower(p.username) = lower(trim(p_target_username))
  limit 1;

  if target.id is null then raise exception 'opponent not found'; end if;
  if target.id = uid then raise exception 'you cannot challenge yourself'; end if;

  if exists (
    select 1 from public.challenges c
    where c.status in ('pending','accepted')
      and ((c.challenger_id=uid and c.target_id=target.id) or (c.challenger_id=target.id and c.target_id=uid))
  ) then raise exception 'an active or pending challenge already exists'; end if;

  insert into public.challenges(challenger_id,target_id,status)
  values(uid,target.id,'pending')
  returning id into challenge_id;

  return jsonb_build_object('challenge_id',challenge_id,'target_username',target.username);
end;
$$;

create or replace function public.academy_respond_challenge(p_challenge_id uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  c public.challenges;
  next_status text;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if lower(p_action) not in ('accept','decline') then raise exception 'invalid challenge action'; end if;

  select * into c from public.challenges where id=p_challenge_id for update;
  if c.id is null then raise exception 'challenge not found'; end if;
  if c.target_id <> uid then raise exception 'only the challenged learner may respond' using errcode='42501'; end if;
  if c.status <> 'pending' then raise exception 'challenge is no longer pending'; end if;

  next_status := case when lower(p_action)='accept' then 'accepted' else 'declined' end;
  update public.challenges set status=next_status where id=c.id;
  return jsonb_build_object('challenge_id',c.id,'status',next_status);
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
  ids uuid[];
  questions jsonb;
  already_played boolean;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;

  select * into c from public.challenges where id=p_challenge_id for update;
  if c.id is null then raise exception 'challenge not found'; end if;
  if c.status <> 'accepted' then raise exception 'challenge is not active'; end if;
  if uid <> c.challenger_id and uid <> c.target_id then raise exception 'challenge access denied' using errcode='42501'; end if;

  already_played := case when uid=c.challenger_id then coalesce(c.challenger_played,false) else coalesce(c.target_played,false) end;
  if already_played then raise exception 'your challenge turn is already complete'; end if;

  update public.challenge_attempts
  set status='EXPIRED'
  where user_id=uid and challenge_id=c.id and status='ACTIVE' and expires_at<=now();

  select * into a
  from public.challenge_attempts
  where user_id=uid and challenge_id=c.id and status='ACTIVE' and expires_at>now()
  order by started_at desc limit 1;

  if a.id is null then
    select array_agg(q.id) into ids
    from (
      select id from public.challenge_question_bank
      where active
      order by random()
      limit 5
    ) q;
    if coalesce(array_length(ids,1),0) <> 5 then raise exception 'challenge question bank is not ready'; end if;
    insert into public.challenge_attempts(challenge_id,user_id,question_ids)
    values(c.id,uid,ids)
    returning * into a;
  else
    ids := a.question_ids;
  end if;

  select jsonb_agg(
    jsonb_build_object('id',q.id,'grade',q.grade,'subject',q.subject,'prompt',q.prompt,'options',q.options)
    order by array_position(a.question_ids,q.id)
  ) into questions
  from public.challenge_question_bank q
  where q.id = any(a.question_ids);

  return jsonb_build_object('attempt_id',a.id,'expires_at',a.expires_at,'questions',coalesce(questions,'[]'::jsonb));
end;
$$;

create or replace function public.academy_answer_challenge_question(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_index smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  a public.challenge_attempts;
  correct_index smallint;
  is_correct boolean;
  answered_count integer;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_selected_index not between 0 and 3 then raise exception 'invalid answer selection'; end if;

  select * into a from public.challenge_attempts where id=p_attempt_id for update;
  if a.id is null or a.user_id<>uid then raise exception 'attempt access denied' using errcode='42501'; end if;
  if a.status<>'ACTIVE' or a.expires_at<=now() then raise exception 'challenge attempt expired'; end if;
  if not (p_question_id = any(a.question_ids)) then raise exception 'question is not part of this attempt'; end if;
  if exists(select 1 from public.challenge_attempt_answers where attempt_id=a.id and question_id=p_question_id) then
    raise exception 'question already answered';
  end if;

  select q.correct_index into correct_index from public.challenge_question_bank q where q.id=p_question_id and q.active;
  if correct_index is null then raise exception 'question unavailable'; end if;
  is_correct := (p_selected_index=correct_index);

  insert into public.challenge_attempt_answers(attempt_id,question_id,selected_index,correct)
  values(a.id,p_question_id,p_selected_index,is_correct);

  select count(*) into answered_count from public.challenge_attempt_answers where attempt_id=a.id;
  return jsonb_build_object('correct',is_correct,'answered_count',answered_count,'remaining',greatest(5-answered_count,0));
end;
$$;

create or replace function public.academy_submit_challenge_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  a public.challenge_attempts;
  c public.challenges;
  correct_count integer;
  score integer;
  opponent_played boolean;
  opponent_score integer;
  winner uuid;
  outcome text := 'waiting';
  total_xp bigint;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;

  select * into a from public.challenge_attempts where id=p_attempt_id for update;
  if a.id is null or a.user_id<>uid then raise exception 'attempt access denied' using errcode='42501'; end if;
  if a.status<>'ACTIVE' or a.expires_at<=now() then raise exception 'challenge attempt expired'; end if;

  select count(*) filter (where correct), count(*)
  into correct_count, score
  from public.challenge_attempt_answers where attempt_id=a.id;
  if score <> 5 then raise exception 'answer all five challenge questions first'; end if;
  score := correct_count * 50;

  select * into c from public.challenges where id=a.challenge_id for update;
  if c.id is null or c.status<>'accepted' then raise exception 'challenge is not active'; end if;
  if uid<>c.challenger_id and uid<>c.target_id then raise exception 'challenge access denied' using errcode='42501'; end if;

  if uid=c.challenger_id then
    if coalesce(c.challenger_played,false) then raise exception 'your challenge turn is already complete'; end if;
    opponent_played := coalesce(c.target_played,false);
    opponent_score := coalesce(c.target_score,0);
    update public.challenges set challenger_score=score, challenger_played=true where id=c.id;
  else
    if coalesce(c.target_played,false) then raise exception 'your challenge turn is already complete'; end if;
    opponent_played := coalesce(c.challenger_played,false);
    opponent_score := coalesce(c.challenger_score,0);
    update public.challenges set target_score=score, target_played=true where id=c.id;
  end if;

  update public.profiles set xp=coalesce(xp,0)+score where id=uid;

  if opponent_played then
    if score > opponent_score then
      winner := uid;
      outcome := 'won';
    elsif score < opponent_score then
      winner := case when uid=c.challenger_id then c.target_id else c.challenger_id end;
      outcome := 'lost';
    else
      outcome := 'tied';
    end if;

    if winner is not null then
      update public.profiles set xp=coalesce(xp,0)+250 where id=winner;
    end if;
    update public.challenges set status='completed' where id=c.id;
  end if;

  update public.challenge_attempts set status='SUBMITTED',submitted_at=now() where id=a.id;
  select coalesce(p.xp,0) into total_xp from public.profiles p where p.id=uid;

  return jsonb_build_object(
    'score',score,
    'correct_answers',correct_count,
    'challenge_status',case when opponent_played then 'completed' else 'accepted' end,
    'outcome',outcome,
    'total_xp',total_xp,
    'winner_bonus',case when winner=uid then 250 else 0 end
  );
end;
$$;

-- Normal practice XP remains low-stakes but cannot mutate another learner and is
-- bounded to one five-question session. Competitive outcomes never use this RPC.
create or replace function public.academy_complete_practice(p_score integer)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := (select auth.uid());
  total_xp bigint;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if p_score < 0 or p_score > 250 or mod(p_score,50)<>0 then raise exception 'invalid practice score'; end if;
  update public.profiles set xp=coalesce(xp,0)+p_score where id=uid;
  if not found then raise exception 'profile not found'; end if;
  select coalesce(p.xp,0) into total_xp from public.profiles p where p.id=uid;
  return jsonb_build_object('awarded_xp',p_score,'total_xp',total_xp);
end;
$$;

revoke all on function public.academy_create_challenge(text) from public, anon, authenticated;
revoke all on function public.academy_respond_challenge(uuid,text) from public, anon, authenticated;
revoke all on function public.academy_begin_challenge_attempt(uuid) from public, anon, authenticated;
revoke all on function public.academy_answer_challenge_question(uuid,uuid,smallint) from public, anon, authenticated;
revoke all on function public.academy_submit_challenge_attempt(uuid) from public, anon, authenticated;
revoke all on function public.academy_complete_practice(integer) from public, anon, authenticated;

grant execute on function public.academy_create_challenge(text) to authenticated;
grant execute on function public.academy_respond_challenge(uuid,text) to authenticated;
grant execute on function public.academy_begin_challenge_attempt(uuid) to authenticated;
grant execute on function public.academy_answer_challenge_question(uuid,uuid,smallint) to authenticated;
grant execute on function public.academy_submit_challenge_attempt(uuid) to authenticated;
grant execute on function public.academy_complete_practice(integer) to authenticated;
