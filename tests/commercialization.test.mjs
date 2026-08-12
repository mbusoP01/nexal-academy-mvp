import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const access = JSON.parse(fs.readFileSync(path.join(root, 'content', 'access-manifest.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(root, 'content', 'video-audit.json'), 'utf8'));
const entitlementSource = fs.readFileSync(path.join(root, 'js', 'entitlements.js'), 'utf8');

assert.equal(access.showcaseLessons.length, 3, 'three subject showcase lessons are required');
assert.equal(new Set(access.showcaseLessons).size, 3, 'showcase lesson IDs must be unique');
assert.ok(access.modules.quadratics && access.modules.kinematics && access.modules.dna_rna, 'showcase access metadata is complete');
assert.ok(!entitlementSource.includes('premium=true'), 'query parameters must never grant Premium');
assert.ok(audit.totalModules >= 12, 'video audit must cover the curriculum foundation');
assert.equal(audit.safeExternal, 0, 'no unverified external video may be labelled commercial-safe');
assert.ok(audit.scriptReadyOnly + audit.reviewRequired === audit.totalModules, 'every audited video must have a truthful status');
assert.ok(fs.existsSync(path.join(root, 'pricing.html')), 'pricing page exists');
assert.ok(fs.existsSync(path.join(root, 'auth-callback.html')), 'auth callback exists');
console.log(`COMMERCIALIZATION_TEST_PASS showcases=${access.showcaseLessons.length} videoModules=${audit.totalModules}`);
