import fs from 'node:fs';
const manifest = JSON.parse(fs.readFileSync('content/caps-master-manifest.json', 'utf8'));
const errors = [];
const ids = new Set();
for (const unit of manifest.units || []) {
  if (!unit.id || ids.has(unit.id)) errors.push(`duplicate/missing unit id: ${unit.id}`);
  ids.add(unit.id);
  for (const field of ['subject','grade','term','topic','module']) if (unit[field] === undefined || unit[field] === '') errors.push(`${unit.id}: missing ${field}`);
}
console.log(`CAPS units: ${manifest.units.length}; validation=${errors.length ? 'FAIL' : 'PASS'}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
