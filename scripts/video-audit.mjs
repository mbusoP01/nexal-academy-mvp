import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'curriculum.js'), 'utf8'), context);
const rows = [];
for (const subject of Object.values(context.window.NEXAL_CURRICULUM || {})) for (const chapter of subject.syllabus || []) for (const module of chapter.modules || []) {
  rows.push({ module: module.id, title: module.name, status: module.video_id ? 'EXTERNAL_REFERENCED_NONCOMMERCIAL_OR_UNVERIFIED' : 'ORIGINAL_SCRIPT_READY', externalVideo: module.video_id || null, scriptReady: Boolean(module.video_script), commercialUseVerified: false });
}
const caps = JSON.parse(fs.readFileSync(path.join(root, 'content', 'caps-master-manifest.json'), 'utf8'));
const existing = new Map(rows.map(row => [row.module, row]));
const authoritativeRows = caps.units.map(unit => existing.get(unit.id) || ({
  module: unit.id,
  title: `${unit.topic} — ${unit.module}`,
  status: 'ORIGINAL_SCRIPT_READY',
  externalVideo: null,
  scriptReady: true,
  commercialUseVerified: false
}));
const legacyReviewRequired = rows.filter(row => row.status.includes('UNVERIFIED')).length;
const summary = { auditedAt: new Date().toISOString(), policy: 'No external licence is claimed without verification.', totalModules: authoritativeRows.length, safeExternal: authoritativeRows.filter(row => row.commercialUseVerified).length, scriptReadyOnly: authoritativeRows.filter(row => row.status === 'ORIGINAL_SCRIPT_READY').length, reviewRequired: legacyReviewRequired, legacyStaticModulesAudited: rows.length, legacyReviewRequired, modules: authoritativeRows };
fs.writeFileSync(path.join(root, 'content', 'video-audit.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(`VIDEO_AUDIT total=${summary.totalModules} safeExternal=${summary.safeExternal} scriptReadyOnly=${summary.scriptReadyOnly} reviewRequired=${summary.reviewRequired}`);
