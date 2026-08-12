import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './project1-repo-guard.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content', 'caps-master-manifest.json'), 'utf8'));
const priority = ['curriculum_mapped','theory','worked_examples','guided_practice','independent_practice','solutions','topic_quiz','diagrams','revision_material','video_package','content_qa','calculation_qa','browser_qa'];
const authored = new Map();
for (const file of fs.readdirSync(path.join(root, 'content', 'caps-batches')).filter(name => name.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'content', 'caps-batches', file), 'utf8'));
  for (const unit of data.units || []) authored.set(unit.unitId, unit);
}
const batch = manifest.units.filter(unit => !authored.has(unit.id)).slice(0, 5).map(unit => ({ id: unit.id, subject: unit.subject, grade: unit.grade, term: unit.term, topic: unit.topic, next: priority[0] }));
if (!batch.length) {
  const authoredUnits = manifest.units.filter(unit => authored.has(unit.id));
  const nextGap = authoredUnits.find(unit => !authored.get(unit.id).revision_material);
  if (nextGap) batch.push({ id: nextGap.id, subject: nextGap.subject, grade: nextGap.grade, term: nextGap.term, topic: nextGap.topic, next: 'revision_material' });
}
console.log(JSON.stringify({ batchSize: batch.length, priority: priority[0], units: batch }, null, 2));
