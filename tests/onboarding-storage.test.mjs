import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'onboarding.html'), 'utf8');
const settings = fs.readFileSync(path.join(root, 'settings.html'), 'utf8');
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/202608120001_secure_avatar_storage.sql'), 'utf8');
const bootstrap = fs.readFileSync(path.join(root, 'js/supabase-config.js'), 'utf8');

assert.match(html, /\$\{currentUser\.id\}\/avatar\./);
assert.match(html, /image\/jpeg/);
assert.match(html, /5 \* 1024 \* 1024/);
assert.match(html, /profile will be created without the photo/);
assert.match(settings, /\$\{user\.id\}\/avatar\./);

assert.match(sql, /insert into storage\.buckets/i);
assert.match(sql, /'avatars'/);
assert.match(sql, /public, file_size_limit, allowed_mime_types/i);
assert.match(sql, /5242880/);
assert.match(sql, /array\['image\/jpeg','image\/png','image\/webp'\]/);
assert.match(sql, /set public = false/i);
assert.match(sql, /avatars_insert_own_folder/);
assert.match(sql, /avatars_select_own_folder/);
assert.match(sql, /avatars_update_own_folder/);
assert.match(sql, /avatars_delete_own_folder/);
assert.match(sql, /storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)::text\)/);

assert.match(bootstrap, /private:\/\/avatars\//);
assert.match(bootstrap, /createSignedUrl\(path, expiresIn\)/);
assert.match(bootstrap, /LEGACY_AVATAR_PATH/);
assert.match(bootstrap, /MutationObserver/);
assert.match(bootstrap, /bucketId === 'avatars'/);
assert.match(bootstrap, /getPublicUrl = path => \(\{ data: \{ publicUrl: locatorFor\(path\) \} \}\)/);
assert.doesNotMatch(sql, /set public = true/i);

console.log('ONBOARDING_STORAGE_TEST_PASS owner-path=present mime-size-validation=present private-bucket=present signed-url-compat=present');
