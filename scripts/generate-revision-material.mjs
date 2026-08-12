import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const items = [];
for (const file of fs.readdirSync(path.join(root, 'content', 'caps-batches')).filter(name => name.endsWith('.json'))) {
  const batch = JSON.parse(fs.readFileSync(path.join(root, 'content', 'caps-batches', file), 'utf8'));
  for (const unit of batch.units || []) {
    items.push({ unitId: unit.unitId, title: `${unit.title} revision guide`, summary: `Review ${unit.title} using the worked examples and practice set.`, checklist: [`I can define the key terms in ${unit.title}.`, `I can complete a worked example without notes.`, `I can explain one common misconception.`], retrieval: [`Write the governing principle for ${unit.title}.`, `Solve or explain one foundation question.`, `Describe one real-world application.`] });
  }
}
fs.writeFileSync(path.join(root, 'content', 'assessments', 'revision-material.json'), JSON.stringify({ version: '1.0', items }, null, 2) + '\n');
console.log(`revision material generated: ${items.length} items`);
