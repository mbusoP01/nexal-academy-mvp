import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content', 'caps-master-manifest.json'), 'utf8'));
const quizzes = JSON.parse(fs.readFileSync(path.join(root, 'content', 'assessments', 'topic-quizzes.json'), 'utf8'));
const groups = new Map();
for (const unit of manifest.units) {
  const key = `${unit.subject}-${unit.grade}-${unit.term}`;
  if (!groups.has(key)) groups.set(key, { id: `revision-${key}`, subject: unit.subject, grade: unit.grade, term: unit.term, title: `Nexal Academy ${unit.subject} Grade ${unit.grade} Term ${unit.term} Revision Assessment`, marks: 30, questionRefs: [], memo: 'Use the linked topic-quiz explanations as the marking memo.' });
  const group = groups.get(key);
  const moduleId = unit.module;
  const quiz = quizzes.quizzes.find(item => item.module === moduleId);
  if (quiz) group.questionRefs.push(...quiz.questions.slice(0, 3).map(question => question.id));
}
fs.writeFileSync(path.join(root, 'content', 'assessments', 'revision-assessments.json'), JSON.stringify({ version: '1.0', label: 'Nexal Academy Revision Assessments', assessments: [...groups.values()] }, null, 2) + '\n');
console.log(`revision assessments generated: ${groups.size}`);
