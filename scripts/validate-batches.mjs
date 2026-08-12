import fs from 'node:fs';
import path from 'node:path';
const files = fs.readdirSync('content/caps-batches').filter(file => file.endsWith('.json'));
const errors = [];
for (const file of files) {
  const batch = JSON.parse(fs.readFileSync(path.join('content/caps-batches', file), 'utf8'));
  for (const unit of batch.units || []) {
    if ((unit.practice || []).length < 8) errors.push(`${unit.unitId}: practice floor`);
    if ((unit.quizQuestions || []).length < 10) errors.push(`${unit.unitId}: quiz floor`);
    if ((unit.examples || []).length < 2) errors.push(`${unit.unitId}: examples floor`);
    if ((unit.solutions || []).length < (unit.practice || []).length) errors.push(`${unit.unitId}: missing solutions`);
    if (!unit.videoPackage?.transcript || !unit.diagram) errors.push(`${unit.unitId}: media package`);
  }
}
console.log(`batch files: ${files.length}; validation=${errors.length ? 'FAIL' : 'PASS'}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
