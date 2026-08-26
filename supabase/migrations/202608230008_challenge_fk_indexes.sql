-- Complete the remaining challenge foreign-key indexes reported after the
-- verified challenge tables were deployed.
create index if not exists challenge_attempt_answers_question_idx
  on public.challenge_attempt_answers(question_id);
create index if not exists challenge_attempts_challenge_idx
  on public.challenge_attempts(challenge_id);
