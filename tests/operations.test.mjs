import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/202608120005_lms_operations.sql'), 'utf8');
const announcementSql = fs.readFileSync(path.join(root, 'supabase/migrations/202608120003_announcements.sql'), 'utf8');
const teacher = fs.readFileSync(path.join(root, 'teacher-hub.html'), 'utf8');
const assignments = fs.readFileSync(path.join(root, 'assignments.html'), 'utf8');
const admin = fs.readFileSync(path.join(root, 'admin-hub.html'), 'utf8');

for (const token of ['classes', 'class_memberships', 'teacher_class_assignments', 'assignments', 'assignment_submissions', 'enable row level security', 'teacher_create_assignment', 'teacher_create_class_announcement', 'admin_add_trusted_teacher', 'grade does not match class', 'teacher authority required']) {
  assert.match(sql, new RegExp(token, 'i'));
}

const unsafeAudienceCatchAll = /audience_type\s+in\s*\(\s*'ALL'\s*,\s*'SUBJECT'\s*,\s*'FREE'\s*,\s*'PREMIUM'\s*\)/i;
for (const migration of [announcementSql, sql]) {
  assert.doesNotMatch(migration, unsafeAudienceCatchAll, 'targeted announcements must not bypass their required target fields');
  assert.match(migration, /audience_type\s*=\s*'SUBJECT'\s+and\s+subject\s+is\s+not\s+null/i);
  assert.match(migration, /audience_type\s*=\s*'FREE'\s+and\s+plan\s*=\s*'FREE'/i);
  assert.match(migration, /audience_type\s*=\s*'PREMIUM'\s+and\s+plan\s*=\s*'PREMIUM'/i);
  assert.match(migration, /audience_type\s*=\s*'ALL'/i);
}
assert.match(sql, /audience_type\s*=\s*'CLASS'\s+and\s+class_id\s+is\s+not\s+null/i);
assert.match(sql, /revoke all on public\.classes, public\.class_memberships, public\.teacher_class_assignments, public\.assignments, public\.assignment_submissions from authenticated/i);
assert.match(sql, /grant select, insert, update on public\.assignment_submissions to authenticated/i);
assert.doesNotMatch(sql, /grant[^;]*delete[^;]*assignment_submissions[^;]*authenticated/i);

assert.match(teacher, /teacher_class_assignments/);
assert.match(teacher, /teacher_create_assignment/);
assert.match(teacher, /id=\"class-id\"[^>]*>\s*<option/);
assert.match(teacher, /id=\"unit-id\"[^>]*>\s*<option/);
assert.doesNotMatch(teacher, /Class ID<input|Master unit ID<input/);
assert.match(teacher, /caps-master-manifest\.json/);
assert.match(assignments, /from\('assignments'\)/);
assert.match(assignments, /textContent/);
assert.match(admin, /admin_create_class/);
assert.match(admin, /admin_assign_teacher/);
console.log('LMS operations security/UI tests passed');
