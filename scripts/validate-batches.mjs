import fs from 'node:fs';
import path from 'node:path';

const batchDir = 'content/caps-batches';
const diagramDir = 'content/diagrams';
const manifest = JSON.parse(fs.readFileSync('content/caps-master-manifest.json', 'utf8'));
const manifestIds = new Set((manifest.units || []).map((unit) => unit.id));
const files = fs.readdirSync(batchDir).filter((file) => file.endsWith('.json')).sort();
const errors = [];
const seenUnitIds = new Map();
const placeholderPattern = /\b(?:todo|tbd|lorem ipsum|placeholder|coming soon)\b/i;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function listHasPlaceholder(values) {
  return (values || []).some((value) => placeholderPattern.test(String(value)));
}

for (const file of files) {
  let batch;
  try {
    batch = JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8'));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
    continue;
  }

  if (!text(batch.batch)) errors.push(`${file}: missing batch id`);
  if (!text(batch.source)) errors.push(`${file}: missing source provenance`);
  if (!Array.isArray(batch.units) || batch.units.length === 0) {
    errors.push(`${file}: no units`);
    continue;
  }

  for (const unit of batch.units) {
    const id = text(unit.unitId);
    if (!id) {
      errors.push(`${file}: unit missing unitId`);
      continue;
    }

    if (!manifestIds.has(id)) errors.push(`${id}: not present in CAPS master manifest`);
    if (seenUnitIds.has(id)) errors.push(`${id}: duplicated in ${seenUnitIds.get(id)} and ${file}`);
    else seenUnitIds.set(id, file);

    if (text(unit.why).length < 20) errors.push(`${id}: weak/missing learner rationale`);
    if ((unit.objectives || []).length < 3) errors.push(`${id}: objective floor`);
    if ((unit.definitions || []).length < 3) errors.push(`${id}: definitions floor`);
    if ((unit.principles || []).length < 2) errors.push(`${id}: principles floor`);
    if ((unit.examples || []).length < 2) errors.push(`${id}: examples floor`);
    if ((unit.practice || []).length < 8) errors.push(`${id}: practice floor`);
    if ((unit.quizQuestions || []).length < 10) errors.push(`${id}: quiz floor`);
    if ((unit.solutions || []).length < (unit.practice || []).length) errors.push(`${id}: missing solutions`);

    const diagram = text(unit.diagram);
    if (!diagram.startsWith(`${diagramDir}/`) || !diagram.endsWith('.svg')) {
      errors.push(`${id}: diagram must be a tracked SVG under ${diagramDir}`);
    } else if (!fs.existsSync(diagram)) {
      errors.push(`${id}: diagram file does not exist (${diagram})`);
    }

    const video = unit.videoPackage || {};
    if (!text(video.title) || !text(video.duration)) errors.push(`${id}: incomplete video metadata`);
    if ((video.scenes || []).length < 3) errors.push(`${id}: video scene floor`);
    if (text(video.transcript).length < 40) errors.push(`${id}: video transcript too shallow`);

    const depth = unit.depth;
    if (!depth || !Array.isArray(depth.progression) || depth.progression.length < 3) {
      errors.push(`${id}: missing Foundation/Standard/Challenge depth progression`);
    } else {
      const expectedProgression = ['Foundation', 'Standard', 'Challenge'];
      if (expectedProgression.some((level) => !depth.progression.includes(level))) {
        errors.push(`${id}: incomplete depth progression`);
      }
      if (Number(depth.workedExamples) > (unit.examples || []).length) {
        errors.push(`${id}: depth workedExamples exceeds authored examples`);
      }
      if (Number(depth.practiceQuestions) > (unit.practice || []).length) {
        errors.push(`${id}: depth practiceQuestions exceeds authored practice`);
      }
      if (Number(depth.solutionCoverage) > (unit.solutions || []).length) {
        errors.push(`${id}: depth solutionCoverage exceeds authored solutions`);
      }
    }

    const textCollections = [
      unit.why,
      ...(unit.objectives || []),
      ...(unit.definitions || []),
      ...(unit.principles || []),
      ...(unit.examples || []),
      ...(unit.practice || []),
      ...(unit.solutions || []),
      ...(unit.quizQuestions || []),
      video.title,
      video.transcript,
      ...(video.scenes || []),
    ];
    if (listHasPlaceholder(textCollections)) errors.push(`${id}: placeholder text detected`);
  }
}

console.log(`batch files: ${files.length}; units: ${seenUnitIds.size}; validation=${errors.length ? 'FAIL' : 'PASS'}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
