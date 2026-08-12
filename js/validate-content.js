/* Node-friendly curriculum validator. Run: node js/validate-content.js */
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(require('path').join(__dirname, 'curriculum.js'), 'utf8');
const context = { window: {}, document: { addEventListener() {} } };
vm.createContext(context);
vm.runInContext(source, context, { filename: 'curriculum.js' });
const curriculum = context.window.NEXAL_CURRICULUM;
const errors = [];
const ids = new Set();
const questionIds = new Set();
const report = { subjects: 0, modules: 0, lessonsWithTheory: 0, practiceQuestions: 0, videoLinked: 0, scriptReady: 0 };
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
console.log(JSON.stringify({ ...report, validation: errors.length ? 'FAIL' : 'PASS', errors }, null, 2));
if (errors.length) process.exitCode = 1;
