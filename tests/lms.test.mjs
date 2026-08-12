import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(file)=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const dashboard=read('dashboard.html'),library=read('library.html'),study=read('study-hall.html'),migration=read('supabase/migrations/202608120003_announcements.sql');
assert.match(dashboard,/My courses/);assert.match(dashboard,/Announcements/);assert.match(dashboard,/content\/caps-master-manifest\.json/);assert.match(dashboard,/study-hall\.html\?unit=/);assert.doesNotMatch(dashboard,/ids=\['1','2','3'\]/);
assert.match(library,/Grade scope/);assert.match(library,/profile\.role!=='learner'/);assert.match(library,/study-hall\.html\?unit=/);
assert.match(study,/This lesson belongs to Grade/);assert.match(study,/Return to My Courses/);assert.match(study,/record\.grade/);
assert.match(migration,/enable row level security/);assert.match(migration,/learners read targeted active announcements/);assert.match(migration,/revoke insert, update, delete/);
console.log('lms scope smoke: PASS');
