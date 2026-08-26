import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/202608230007_database_performance_reconciliation.sql'), 'utf8');

for (const index of [
  'trusted_staff_created_by_idx','announcements_class_id_idx','announcements_created_by_idx','announcements_updated_by_idx',
  'assignment_submissions_learner_id_idx','assignments_created_by_idx','challenges_challenger_status_idx','challenges_target_status_idx',
  'class_memberships_learner_status_idx','classes_created_by_idx','teacher_class_assignments_class_active_idx',
  'teacher_students_teacher_idx','teacher_students_student_idx'
]) assert.match(sql, new RegExp(`create index if not exists ${index}`, 'i'));

assert.match(sql, /using \(\(select auth\.uid\(\)\)=user_id\)/i);
console.log('Academy database performance reconciliation tests passed');
