import fs from 'node:fs';
const quizzes = JSON.parse(fs.readFileSync('content/assessments/topic-quizzes.json', 'utf8'));
const errors = [];
const ids = new Set();
for (const quiz of quizzes.quizzes || []) {
  if (quiz.questions.length < 10) errors.push(`${quiz.id}: requires at least 10 questions for substantial topic coverage`);
  for (const question of quiz.questions || []) {
    if (ids.has(question.id)) errors.push(`duplicate question id: ${question.id}`);
    ids.add(question.id);
    if (!question.answer || !question.explanation) errors.push(`${question.id}: answer/explanation missing`);
  }
}
console.log(`quiz questions: ${ids.size}; validation=${errors.length ? 'FAIL' : 'PASS'}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
