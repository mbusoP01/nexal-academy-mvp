import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expectedRemote = 'https://github.com/mbusoP01/nexal-academy-mvp.git';
const actualRoot = execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim().replaceAll('\\', '/');
const actualRemote = execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim().replace(/\.git$/, '').replace(/\/$/, '') + '.git';
const expectedRoot = root.replaceAll('\\', '/');
if (!actualRoot.endsWith('/nexal-academy-mvp') || actualRoot !== expectedRoot || actualRemote !== expectedRemote) {
  throw new Error(`PROJECT_1 repository guard failed: root=${actualRoot}, remote=${actualRemote}`);
}
if (!fs.existsSync(path.join(root, 'content', 'caps-master-manifest.json'))) throw new Error('PROJECT_1 CAPS manifest missing');
console.log(`PROJECT_1_REPOSITORY_GUARD=PASS\nPROJECT_1_ROOT=${actualRoot}\nPROJECT_1_REMOTE=${actualRemote}`);
