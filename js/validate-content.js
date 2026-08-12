/* Node-friendly curriculum validator. Run: node js/validate-content.js */
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(require('path').join(__dirname, 'curriculum.js'), 'utf8');
const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(source, context, { filename: 'curriculum.js' });
const curriculum = context.window.NEXAL_CURRICULUM;
const manifest = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'content', 'curriculum-manifest.json'), 'utf8'));
const quizzes = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'content', 'assessments', 'topic-quizzes.json'), 'utf8'));
const revisions = JSON.parse(fs.readFileSync(require('path').join(__dirname, '..', 'content', 'assessments', 'revision-assessments.json'), 'utf8'));
const errors = [];
const ids = new Set();
const questionIds = new Set();
const report = { subjects: 0, modules: 0, lessonsWithTheory: 0, practiceQuestions: 0, quizTopics: 0, quizQuestions: 0, revisionAssessments: 0, videoLinked: 0, scriptReady: 0 };
const manifestIds = new Set(manifest.modules.map(row => row.module));
for (const [subjectId, subject] of Object.entries(curriculum || {})) {
  report.subjects += 1;
  if (!subject.title || !subject.description) errors.push(`${subjectId}: missing title/description`);
  for (const chapter of subject.syllabus || []) {
    if (!chapter.title || !Array.isArray(chapter.modules)) errors.push(`${subjectId}: malformed chapter`);
    for (const module of chapter.modules || []) {
      report.modules += 1;
      if (!module.id || !module.name || ids.has(module.id)) errors.push(`${subjectId}: duplicate/missing module id ${module.id}`);
      ids.add(module.id);
      if (!module.theory || module.theory.trim().length < 40) errors.push(`${module.id}: theory missing or too short`);
      else report.lessonsWithTheory += 1;
      if (module.video_id) report.videoLinked += 1;
      if (module.video_status === 'SCRIPT_READY' || module.video_script) report.scriptReady += 1;
      for (const [index, question] of (module.practice || []).entries()) {
        report.practiceQuestions += 1;
        const qid = question.id || `${module.id}-practice-${index + 1}`;
        if (questionIds.has(qid)) errors.push(`duplicate question id ${qid}`);
        questionIds.add(qid);
        if (!question.question || question.answer === undefined || !question.explanation) errors.push(`${qid}: incomplete question`);
      }
    }
  }
}
for (const id of manifestIds) if (!ids.has(id)) errors.push(`manifest module missing from curriculum: ${id}`);
for (const id of ids) if (!manifestIds.has(id)) errors.push(`curriculum module missing from manifest: ${id}`);
const quizIds = new Set();
const quizModuleIds = new Set();
for (const quiz of quizzes.quizzes || []) {
  report.quizTopics += 1;
  if (!quiz.id || quizIds.has(quiz.id)) errors.push(`duplicate/missing quiz id ${quiz.id}`);
  quizIds.add(quiz.id);
  if (!ids.has(quiz.module)) errors.push(`quiz ${quiz.id}: unknown module ${quiz.module}`);
  quizModuleIds.add(quiz.module);
  if (!Array.isArray(quiz.questions) || quiz.questions.length < 3) errors.push(`quiz ${quiz.id}: at least 3 questions required`);
  for (const question of quiz.questions || []) {
    report.quizQuestions += 1;
    if (!question.id || question.answer === undefined || !question.explanation) errors.push(`${question.id || quiz.id}: incomplete quiz question`);
    if (question.id && questionIds.has(question.id)) errors.push(`duplicate question id ${question.id}`);
    if (question.id) questionIds.add(question.id);
  }
}
for (const id of ids) if (!quizModuleIds.has(id)) errors.push(`module missing topic quiz: ${id}`);
const knownQuestionIds = new Set(questionIds);
const revisionIds = new Set();
for (const assessment of revisions.assessments || []) {
  report.revisionAssessments += 1;
  if (!assessment.id || revisionIds.has(assessment.id)) errors.push(`duplicate/missing revision assessment id ${assessment.id}`);
  revisionIds.add(assessment.id);
  if (!assessment.subject || !assessment.grade || !assessment.term || !assessment.title) errors.push(`revision ${assessment.id}: missing metadata`);
  for (const questionRef of assessment.questionRefs || []) if (!knownQuestionIds.has(questionRef)) errors.push(`revision ${assessment.id}: unknown question ${questionRef}`);
}
report.manifestModules = manifest.modules.length;
console.log(JSON.stringify({ ...report, validation: errors.length ? 'FAIL' : 'PASS', errors }, null, 2));
if (errors.length) process.exitCode = 1;
