import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const migration = fs.readFileSync(path.join(root, 'supabase/migrations/202608120003_announcements.sql'), 'utf8');
const adminMigration = fs.readFileSync(path.join(root, 'supabase/migrations/202608120004_secure_announcement_admin.sql'), 'utf8');
const admin = fs.readFileSync(path.join(root, 'admin-hub.html'), 'utf8');

assert.match(migration, /alter table public\.announcements enable row level security/i);
assert.match(migration, /drop policy if exists/i);
assert.doesNotMatch(migration, /\ba\.(active|starts_at|ends_at|audience_type|grade|plan|subject)\b/);
assert.match(migration, /revoke all on public\.announcements from anon/i);
assert.match(migration, /revoke insert, update, delete, truncate, references, trigger on public\.announcements from authenticated/i);
assert.match(migration, /audience_type = 'SUBJECT'[\s\S]*subject in \('mathematics','physical-sciences','life-sciences'\)/i);

for (const token of ['trusted_staff', 'security definer', 'nexal_is_admin', 'admin_create_announcement', 'admin_update_announcement', 'admin_archive_announcement', 'admin_list_announcements', 'revoke all on function', 'grant execute on function']) {
  assert.match(adminMigration, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
}
assert.match(admin, /rpc\('nexal_is_admin'\)/);
assert.match(admin, /rpc\('admin_create_announcement'/);
assert.doesNotMatch(admin, /from\(['"]profiles['"]\)\.update|mbusophiri01@gmail\.com/);
assert.match(admin, /title\.textContent/);
assert.match(admin, /body\.textContent/);
console.log('Announcement security/composer tests passed');
