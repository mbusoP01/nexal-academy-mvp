import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content', 'caps-master-manifest.json'), 'utf8'));
const priority = ['curriculum_mapped','theory','worked_examples','guided_practice','independent_practice','solutions','topic_quiz','diagrams','revision_material','video_package','content_qa','calculation_qa','browser_qa'];
const batch = manifest.units.slice(0, 5).map(unit => ({ id: unit.id, subject: unit.subject, grade: unit.grade, term: unit.term, topic: unit.topic, next: priority[0] }));
console.log(JSON.stringify({ batchSize: batch.length, priority: priority[0], units: batch }, null, 2));
