import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sanitized = fs.readFileSync(path.join(root, 'supabase/migrations/202608230002_sanitized_challenge_profiles.sql'), 'utf8');
const fair = fs.readFileSync(path.join(root, 'supabase/migrations/202608230003_fair_verified_challenges.sql'), 'utf8');
const challenges = fs.readFileSync(path.join(root, 'challenges.html'), 'utf8');
const supabaseConfig = fs.readFileSync(path.join(root, 'js/supabase-config.js'), 'utf8');

assert.match(sanitized, /academy_list_my_challenges/);
assert.match(sanitized, /id = \(select auth\.uid\(\)\)\s+or public\.nexal_is_admin\(\)/i);
assert.doesNotMatch(sanitized, /challenger_id = \(select auth\.uid\(\)\).*profiles\.id/is);
assert.match(sanitized, /opponent_username/);
assert.match(sanitized, /grant execute on function public\.academy_list_my_challenges\(\) to authenticated/i);

assert.match(fair, /challenge_question_sets/);
assert.match(fair, /same grade/i);
assert.match(fair, /target\.grade::text<>source\.grade::text/i);
assert.match(fair, /where active and grade=learner_grade/i);
assert.match(fair, /values\(c\.id,uid,qset\.question_ids\)/i);
assert.match(fair, /array_length\(question_ids,1\)=5/i);
const grade12Questions = (fair.match(/\('[mpl]12-[^']+'/g) || []).length;
assert.ok(grade12Questions >= 2, 'fairness migration must add enough Grade 12 questions for a five-question shared set');

assert.match(challenges, /rpc\('academy_list_my_challenges'/);
assert.doesNotMatch(challenges, /profiles!/);
assert.doesNotMatch(challenges, /avatar_url/);

assert.match(supabaseConfig, /private:\/\/avatars\//);
assert.match(supabaseConfig, /createSignedUrl/);
assert.match(supabaseConfig, /bucket\.getPublicUrl = path => \(\{ data: \{ publicUrl: locatorFor\(path\) \} \}\)/);
assert.match(supabaseConfig, /MutationObserver/);

console.log('Academy sanitized challenge fairness and private-avatar tests passed');
