import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rls = fs.readFileSync(path.join(root, 'supabase/migrations/202608230004_live_rls_and_storage_reconciliation.sql'), 'utf8');
const announcements = fs.readFileSync(path.join(root, 'supabase/migrations/202608230006_reconcile_announcement_targets.sql'), 'utf8');

assert.match(rls, /teacher_students_read_parties/);
assert.match(rls, /user_enrollments_read_own/);
assert.match(rls, /a\.class_id=class_memberships\.class_id/i);
assert.doesNotMatch(rls, /a\.class_id=a\.class_id/i);
assert.match(rls, /assignment_submissions_select_authorized/);
assert.match(rls, /assignment_submissions_insert_authorized/);
assert.match(rls, /assignment_submissions_update_authorized/);
assert.match(rls, /x\.published/);
assert.match(rls, /m\.status='ACTIVE'/);
assert.match(rls, /p_unit_id !~ \('\^' \|\| p_subject \|\| '-g' \|\| c\.grade::text \|\| '-'\)/);
assert.match(rls, /values\('avatars','avatars',false,5242880,array\['image\/jpeg','image\/png','image\/webp'\]\)/i);

assert.match(announcements, /audience_type='CLASS' and class_id is not null/i);
assert.match(announcements, /audience_type='SUBJECT' and subject is not null/i);
assert.match(announcements, /audience_type='FREE' and plan='FREE'/i);
assert.match(announcements, /audience_type='PREMIUM' and plan='PREMIUM'/i);
assert.match(announcements, /or audience_type='ALL'/i);
assert.doesNotMatch(announcements, /audience_type\s+in\s*\('ALL','SUBJECT','FREE','PREMIUM'\)/i);

console.log('Academy live reconciliation migration tests passed');
