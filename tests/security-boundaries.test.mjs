import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/202608230001_secure_profiles_challenges_xp.sql'), 'utf8');
const arena = fs.readFileSync(path.join(root, 'js/arena-engine.js'), 'utf8');
const challenges = fs.readFileSync(path.join(root, 'challenges.html'), 'utf8');

for (const token of [
  'alter table public.profiles enable row level security',
  'alter table public.challenges enable row level security',
  'academy_create_challenge',
  'academy_respond_challenge',
  'academy_begin_challenge_attempt',
  'academy_answer_challenge_question',
  'academy_submit_challenge_attempt',
  'challenge_question_bank',
  'challenge_attempts',
  'challenge_attempt_answers',
  'revoke all on table public.profiles from authenticated',
  'revoke all on table public.challenges from authenticated'
]) assert.match(sql, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

assert.match(sql, /grant select \(id, username, school_name, xp, avatar_url, grade, role\)\s+on public\.profiles to authenticated/i);
assert.doesNotMatch(sql, /grant update[^;]*xp[^;]*on public\.profiles to authenticated/i, 'browser clients must never receive direct XP update authority');
assert.match(sql, /question already answered/i);
assert.match(sql, /answer all five challenge questions first/i);
assert.match(sql, /update public\.profiles set xp=coalesce\(xp,0\)\+250 where id=winner/i);
assert.match(sql, /grant execute on function public\.academy_submit_challenge_attempt\(uuid\) to authenticated/i);
assert.match(sql, /revoke all on function public\.academy_submit_challenge_attempt\(uuid\) from public, anon, authenticated/i);

assert.match(arena, /rpc\('academy_begin_challenge_attempt'/);
assert.match(arena, /rpc\('academy_answer_challenge_question'/);
assert.match(arena, /rpc\('academy_submit_challenge_attempt'/);
assert.match(arena, /rpc\('academy_complete_practice'/);
assert.doesNotMatch(arena, /from\('profiles'\)\.update/);
assert.doesNotMatch(arena, /from\('challenges'\)\.update/);
assert.doesNotMatch(arena, /target_score|challenger_score\s*=/);

assert.match(challenges, /rpc\('academy_create_challenge'/);
assert.match(challenges, /rpc\('academy_respond_challenge'/);
assert.doesNotMatch(challenges, /from\('challenges'\)\.insert/);
assert.doesNotMatch(challenges, /from\('challenges'\)\.update/);
assert.doesNotMatch(challenges, /from\('profiles'\)\.select\('id, username'\)/);
assert.match(challenges, /Server-verified competition/i);

const seededQuestions = (sql.match(/\('(?:m|p|l)\d{2}-[^']+'/g) || []).length;
assert.ok(seededQuestions >= 15, `expected at least 15 server-scored challenge questions, found ${seededQuestions}`);

console.log('Academy profile/challenge/XP security boundary tests passed');
