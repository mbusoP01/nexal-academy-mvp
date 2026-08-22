import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = fs.readFileSync(path.join(root, 'supabase/migrations/202608230001_secure_profiles_challenges_xp.sql'), 'utf8');
const reconcile = fs.readFileSync(path.join(root, 'supabase/migrations/202608230004_live_rls_and_storage_reconciliation.sql'), 'utf8');
const verifiedOnly = fs.readFileSync(path.join(root, 'supabase/migrations/202608230005_verified_xp_only.sql'), 'utf8');
const arena = fs.readFileSync(path.join(root, 'js/arena-engine.js'), 'utf8');

assert.match(base, /alter table public\.profiles enable row level security/i);
assert.match(base, /alter table public\.challenges enable row level security/i);
assert.match(base, /academy_answer_challenge_question/i);
assert.match(base, /academy_submit_challenge_attempt/i);
assert.doesNotMatch(base, /grant update[^;]*xp[^;]*on public\.profiles to authenticated/i);
assert.match(base, /update public\.profiles set xp=coalesce\(xp,0\)\+250 where id=winner/i);

assert.match(reconcile, /alter table public\.teacher_students enable row level security/i);
assert.match(reconcile, /alter table public\.user_enrollments enable row level security/i);
assert.match(reconcile, /a\.class_id=class_memberships\.class_id/i);
assert.doesNotMatch(reconcile, /a\.class_id=a\.class_id/i);
assert.match(reconcile, /assignment_submissions_insert_authorized/i);
assert.match(reconcile, /x\.published/i);
assert.match(reconcile, /m\.status='ACTIVE'/i);
assert.match(reconcile, /t\.subject=x\.subject/i);
assert.match(reconcile, /\^' \|\| p_subject \|\| '-g'/i);
assert.match(reconcile, /public=false/i);
assert.match(reconcile, /5242880/);
assert.match(reconcile, /image\/jpeg/);
assert.match(reconcile, /image\/png/);
assert.match(reconcile, /image\/webp/);

assert.match(verifiedOnly, /revoke all on function public\.academy_complete_practice\(integer\) from public, anon, authenticated/i);
assert.match(verifiedOnly, /coalesce\(source\.role,''\) <> 'student'/i);
assert.match(verifiedOnly, /coalesce\(target\.grade,''\)<>source\.grade/i);

assert.match(arena, /rpc\('academy_begin_challenge_attempt'/);
assert.match(arena, /rpc\('academy_answer_challenge_question'/);
assert.match(arena, /rpc\('academy_submit_challenge_attempt'/);
assert.doesNotMatch(arena, /academy_complete_practice/);
assert.doesNotMatch(arena, /from\('profiles'\)\.update/);
assert.doesNotMatch(arena, /from\('challenges'\)\.update/);
assert.match(arena, /nexal-last-practice-score/);
assert.match(arena, /verified challenge XP powers rankings/i);

console.log('Academy live RLS, storage and verified-XP reconciliation tests passed');
