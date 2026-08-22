import fs from 'node:fs';
import path from 'node:path';

const quizzes = JSON.parse(fs.readFileSync('content/assessments/topic-quizzes.json', 'utf8'));
const batchDir = 'content/caps-batches';
const errors = [];
const questionIds = new Set();
const batchUnits = new Map();

for (const file of fs.readdirSync(batchDir).filter((name) => name.endsWith('.json'))) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8'));
  for (const unit of batch.units || []) batchUnits.set(unit.unitId, unit);
}

// The original interactive curriculum has 12 named modules. Their curated three-question
// checks live in topic-quizzes.json, while deeper practice/solution coverage lives in the
// corresponding CAPS unit batches. Validate the composed learner assessment pool so the
// quality gate reflects what Academy can actually serve instead of counting one legacy file.
const moduleToUnit = {
  quadratics: 'mathematics-g10-algebra',
  inequalities: 'mathematics-g10-algebra',
  limits: 'mathematics-g12-calculus',
  functions: 'mathematics-g10-functions',
  trigonometry: 'mathematics-g10-trigonometry',
  kinematics: 'physical-sciences-g10-mechanics',
  newton: 'physical-sciences-g11-newton',
  energy: 'physical-sciences-g11-energy',
  'chemical-reactions': 'physical-sciences-g11-stoichiometry',
  dna_rna: 'life-sciences-g11-dna',
  genetics: 'life-sciences-g11-genetics',
  ecology: 'life-sciences-g10-ecology',
};

let curatedQuestions = 0;
let supplementalPairs = 0;

for (const quiz of quizzes.quizzes || []) {
  const curated = quiz.questions || [];
  curatedQuestions += curated.length;

  if (curated.length < 3) errors.push(`${quiz.id}: curated check requires at least 3 authored questions`);

  for (const question of curated) {
    if (!question.id) errors.push(`${quiz.id}: question id missing`);
    else if (questionIds.has(question.id)) errors.push(`duplicate question id: ${question.id}`);
    else questionIds.add(question.id);

    if (!question.prompt || !question.answer || !question.explanation) {
      errors.push(`${question.id || quiz.id}: prompt/answer/explanation missing`);
    }
    if (!['foundation', 'standard', 'challenge'].includes(question.difficulty)) {
      errors.push(`${question.id || quiz.id}: invalid difficulty`);
    }
    if (question.type === 'multiple-choice') {
      if (!Array.isArray(question.options) || question.options.length < 3) {
        errors.push(`${question.id || quiz.id}: multiple-choice options missing`);
      } else if (!question.options.includes(question.answer)) {
        errors.push(`${question.id || quiz.id}: answer is not one of the options`);
      }
    }
  }

  const unitId = moduleToUnit[quiz.module];
  const unit = unitId ? batchUnits.get(unitId) : null;
  if (!unit) {
    errors.push(`${quiz.id}: no CAPS batch mapped for module ${quiz.module}`);
    continue;
  }

  const practice = unit.practice || [];
  const solutions = unit.solutions || [];
  const paired = Math.min(practice.length, solutions.length);
  supplementalPairs += paired;

  if (paired < 7) {
    errors.push(`${quiz.id}: requires at least 7 solved CAPS practice questions in addition to curated checks`);
  }

  const substantialCoverage = curated.length + paired;
  if (substantialCoverage < 10) {
    errors.push(`${quiz.id}: combined assessment coverage ${substantialCoverage}/10`);
  }

  if (practice.some((prompt) => !String(prompt).trim())) errors.push(`${quiz.id}: empty CAPS practice prompt`);
  if (solutions.slice(0, practice.length).some((answer) => !String(answer).trim())) {
    errors.push(`${quiz.id}: empty CAPS practice solution`);
  }
}

console.log(
  `assessment modules: ${(quizzes.quizzes || []).length}; curated=${curatedQuestions}; solved-supplemental=${supplementalPairs}; validation=${errors.length ? 'FAIL' : 'PASS'}`,
);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
