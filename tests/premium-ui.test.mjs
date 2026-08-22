import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const dashboard = read('dashboard.html');
const library = read('library.html');
const challenges = read('challenges.html');
const leaderboard = read('leaderboard.html');

assert.match(dashboard, /Nexal Pathway/);
assert.match(dashboard, /Continue learning/i);
assert.match(dashboard, /FREE PLAN/);
assert.match(dashboard, /id="course-grid"/);
assert.match(dashboard, /Your current-grade subjects/);
assert.match(dashboard, /caps-master-manifest\.json/);
assert.doesNotMatch(dashboard, /Current Rank/);
assert.doesNotMatch(dashboard, /Active Syllabus/);
assert.match(library, /caps-master-manifest\.json/);
assert.match(library, /54 mapped units/);
assert.match(library, /id="grade"/);
assert.match(library, /id="subject"/);
assert.match(library, /search/);
assert.match(challenges, /Coming soon|Preview/i);
assert.doesNotMatch(challenges, /top 5%|\+2,500 XP|Calculus Gauntlet/i);
assert.doesNotMatch(leaderboard, /aiScholars|Global Standard/i);
console.log('premium-ui smoke: PASS');
