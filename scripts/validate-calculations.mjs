const checks = [
  { name: 'quadratic factor example', expected: 6, actual: 2 * 3 },
  { name: 'kinematics unit identity', expected: 'm/s²', actual: 'm/s²' },
  { name: 'genetics recessive cross', expected: 0.25, actual: 1 / 4 }
];
const errors = checks.filter(check => check.expected !== check.actual);
console.log(`calculation checks: ${checks.length}; validation=${errors.length ? 'FAIL' : 'PASS'}`);
if (errors.length) { console.error(JSON.stringify(errors)); process.exitCode = 1; }
