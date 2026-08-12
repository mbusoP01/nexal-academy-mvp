const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'curriculum.js'), 'utf8'), context);
const curriculum = context.window.NEXAL_CURRICULUM;
const quizzes = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'assessments', 'topic-quizzes.json'), 'utf8'));
const moduleIds = new Set();
for (const subject of Object.values(curriculum)) for (const chapter of subject.syllabus) for (const module of chapter.modules) moduleIds.add(module.id);

assert.strictEqual(moduleIds.size, 12, 'the authored foundation should expose twelve stable modules');
assert.strictEqual(quizzes.quizzes.length, moduleIds.size, 'each authored module has a topic quiz');
for (const quiz of quizzes.quizzes) {
  assert(moduleIds.has(quiz.module), `quiz points at an unknown module: ${quiz.module}`);
  assert(quiz.questions.length >= 3, `quiz is too short: ${quiz.id}`);
  for (const question of quiz.questions) {
    assert(question.id && question.answer !== undefined && question.explanation, `incomplete question: ${question.id}`);
  }
}
console.log(`content smoke PASS: ${moduleIds.size} modules, ${quizzes.quizzes.reduce((n, q) => n + q.questions.length, 0)} quiz questions`);
