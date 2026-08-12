import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import './project1-repo-guard.mjs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content', 'caps-master-manifest.json'), 'utf8'));
const quiz = JSON.parse(fs.readFileSync(path.join(root, 'content', 'assessments', 'topic-quizzes.json'), 'utf8'));
const revision = JSON.parse(fs.readFileSync(path.join(root, 'content', 'assessments', 'revision-assessments.json'), 'utf8'));
const revisionMaterial = JSON.parse(fs.readFileSync(path.join(root, 'content', 'assessments', 'revision-material.json'), 'utf8'));
const ownerBlocked = JSON.parse(fs.readFileSync(path.join(root, 'OWNER_BLOCKED.json'), 'utf8'));
const batchDir = path.join(root, 'content', 'caps-batches');
const batchUnits = new Map();
for (const file of fs.readdirSync(batchDir).filter(name => name.endsWith('.json'))) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8'));
  for (const unit of batch.units || []) batchUnits.set(unit.unitId, unit);
}
const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'curriculum.js'), 'utf8'), context);
const authored = new Map();
for (const subject of Object.values(context.window.NEXAL_CURRICULUM || {})) {
  for (const chapter of subject.syllabus || []) for (const module of chapter.modules || []) authored.set(module.id, module);
}
const quizModules = new Set((quiz.quizzes || []).map(item => item.module));
const diagrams = new Set();
for (const file of fs.readdirSync(path.join(root, 'content', 'diagrams'))) diagrams.add(`content/diagrams/${file}`);
const mapping = { quadratics: 'mathematics-g10-algebra', functions: 'mathematics-g10-functions', trigonometry: 'mathematics-g10-trigonometry', limits: 'mathematics-g12-calculus', kinematics: 'physical-sciences-g10-mechanics', newton: 'physical-sciences-g11-newton', energy: 'physical-sciences-g11-energy', 'chemical-reactions': 'physical-sciences-g11-stoichiometry', dna_rna: 'life-sciences-g11-dna', genetics: 'life-sciences-g11-genetics', ecology: 'life-sciences-g10-ecology' };
const reverse = new Map(Object.entries(mapping).map(([module, unit]) => [unit, module]));
const required = ['theory','definitions','formulas_or_key_principles','worked_examples','diagrams','guided_practice','independent_practice','solutions','topic_quiz','revision_material','video_package','content_qa','calculation_qa','browser_qa'];
const isComplete = (unit) => {
  const module = authored.get(reverse.get(unit.id));
  const batch = batchUnits.get(unit.id);
  if (!batch) return false;
  const revisionReady = revisionMaterial.items.some(item => item.unitId === unit.id && item.checklist?.length >= 3);
  return Boolean(batch.why && batch.objectives?.length >= 3 && batch.examples?.length >= 2 && batch.practice?.length >= 8 && batch.solutions?.length >= batch.practice.length && batch.quizQuestions?.length >= 10 && batch.videoPackage?.transcript && batch.diagram && diagrams.has(batch.diagram) && revisionReady);
};
const complete = manifest.units.filter(isComplete);
const bySubject = subject => ({ expected: manifest.units.filter(u => u.subject === subject).length, complete: complete.filter(u => u.subject === subject).length });
const math = bySubject('mathematics');
const physics = bySubject('physical-sciences');
const life = bySubject('life-sciences');
const topicQuizExpected = manifest.units.length;
const topicQuizComplete = manifest.units.filter(u => { const batch = batchUnits.get(u.id); const id = reverse.get(u.id); const q = (quiz.quizzes || []).find(item => item.module === id); return (batch?.quizQuestions?.length >= 10) || (q && q.questions.length >= 10); }).length;
const revisionExpected = manifest.units.length;
const revisionComplete = revisionMaterial.items.filter(item => item.checklist?.length >= 3 && item.retrieval?.length >= 3).length;
const videoExpected = manifest.units.length;
const videoComplete = manifest.units.filter(u => { const batch = batchUnits.get(u.id); return Boolean(batch?.videoPackage?.transcript); }).length;
const diagramExpected = manifest.units.filter(u => ['mathematics','physical-sciences','life-sciences'].includes(u.subject)).length;
const diagramComplete = manifest.units.filter(u => { const batch = batchUnits.get(u.id); return batch?.diagram && diagrams.has(batch.diagram); }).length;
const output = {
  EXPECTED_CURRICULUM_UNITS: manifest.units.length,
  COMPLETE_CURRICULUM_UNITS: complete.length,
  INCOMPLETE_CURRICULUM_UNITS: manifest.units.length - complete.length,
  MATHEMATICS_EXPECTED: math.expected, MATHEMATICS_COMPLETE: math.complete,
  PHYSICAL_SCIENCES_EXPECTED: physics.expected, PHYSICAL_SCIENCES_COMPLETE: physics.complete,
  LIFE_SCIENCES_EXPECTED: life.expected, LIFE_SCIENCES_COMPLETE: life.complete,
  TOPIC_QUIZZES_EXPECTED: topicQuizExpected, TOPIC_QUIZZES_COMPLETE: topicQuizComplete,
  REVISION_ASSESSMENTS_EXPECTED: revisionExpected, REVISION_ASSESSMENTS_COMPLETE: revisionComplete,
  VIDEO_PACKAGES_EXPECTED: videoExpected, VIDEO_PACKAGES_COMPLETE: videoComplete,
  DIAGRAM_REQUIREMENTS_EXPECTED: diagramExpected, DIAGRAM_REQUIREMENTS_COMPLETE: diagramComplete,
  BATCH_AUTHORED_UNITS: batchUnits.size,
  LOCAL_EXECUTABLE_INCOMPLETE_COUNT: manifest.units.length - complete.length + (topicQuizExpected - topicQuizComplete) + (revisionExpected - revisionComplete) + (videoExpected - videoComplete) + (diagramExpected - diagramComplete),
  OWNER_BLOCKED_COUNT: (ownerBlocked.entries || []).length
};
console.log(Object.entries(output).map(([key, value]) => `${key}=${value}`).join('\n'));
