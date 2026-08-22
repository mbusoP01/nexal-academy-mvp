import { spawnSync } from 'node:child_process';

const gates = [
  ['repository guard', ['npm', ['run', 'project1:guard']]],
  ['syntax', ['npm', ['run', 'check:syntax']]],
  ['content', ['npm', ['run', 'validate:content']]],
  ['curriculum manifest', ['npm', ['run', 'validate:curriculum']]],
  ['CAPS batches', ['npm', ['run', 'validate:batches']]],
  ['assessments', ['npm', ['run', 'validate:assessments']]],
  ['calculations', ['npm', ['run', 'validate:calculations']]],
  ['content depth', ['npm', ['run', 'validate:depth']]],
  ['content tests', ['npm', ['run', 'test:content']]],
  ['commercialization', ['npm', ['run', 'test:commercial']]],
  ['blank-page regression', ['npm', ['run', 'test:blank-page']]],
  ['onboarding storage', ['npm', ['run', 'test:onboarding-storage']]],
  ['LMS', ['npm', ['run', 'test:lms']]],
  ['premium UI', ['npm', ['run', 'test:premium-ui']]],
  ['announcements', ['npm', ['run', 'test:announcements']]],
  ['operations', ['npm', ['run', 'test:operations']]],
];

const results = [];
for (const [name, [command, args]] of gates) {
  console.log(`\n=== Project 1 gate: ${name} ===`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  const passed = result.status === 0;
  results.push({ name, passed, status: result.status });
  console.log(`=== ${name}: ${passed ? 'PASS' : 'FAIL'} ===`);
}

console.log('\n=== Project 1 verification summary ===');
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}`);
}

const failed = results.filter((result) => !result.passed);
console.log(`PROJECT_1_GATES_TOTAL=${results.length}`);
console.log(`PROJECT_1_GATES_PASSED=${results.length - failed.length}`);
console.log(`PROJECT_1_GATES_FAILED=${failed.length}`);

if (failed.length) {
  console.error(`Project 1 is not premium-ready. Failed gates: ${failed.map((result) => result.name).join(', ')}`);
  process.exitCode = 1;
}
