/**
 * Judge service for coding problems.
 * Uses child_process with a timeout to execute user code safely.
 *
 * NOTE:
 * - You must provide language-specific runner scripts/binaries that accept:
 *     run_<lang> <codeFilePath>
 *   and read test-case input from stdin, writing output to stdout.
 */
const { execFile } = require('child_process');
const path = require('path');

const MAX_BUFFER = 1024 * 1024; // 1 MB

function getRunnerCommand(language) {
  // Adjust these paths to your actual runner scripts/binaries.
  switch (language) {
    case 'cpp':
      return path.join(__dirname, '../runners/run_cpp.sh');
    case 'python':
      return path.join(__dirname, '../runners/run_py.sh');
    case 'js':
    default:
      return path.join(__dirname, '../runners/run_js.sh');
  }
}

function runCode({ language, codePath, input, timeLimitSeconds }) {
  return new Promise((resolve) => {
    const cmd = getRunnerCommand(language);

    const child = execFile(
      cmd,
      [codePath],
      {
        timeout: timeLimitSeconds * 1000,
        maxBuffer: MAX_BUFFER,
      },
      (error, stdout, stderr) => {
        if (error) {
          // Timeout or killed → TLE
          if (error.killed || error.signal === 'SIGTERM') {
            return resolve({ status: 'TLE' });
          }
          // Runtime error
          return resolve({ status: 'RE', stderr: String(stderr || error.message) });
        }
        return resolve({ status: 'OK', stdout: stdout.trim() });
      }
    );

    if (child.stdin) {
      child.stdin.write(input ?? '');
      child.stdin.end();
    }
  });
}

/**
 * Evaluate the given code against a list of test cases.
 * Each test case: { input, expectedOutput }
 */
async function evaluateAgainstCases({ language, codePath, testCases, timeLimit }) {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const r = await runCode({
      language,
      codePath,
      input: tc.input,
      timeLimitSeconds: timeLimit,
    });

    let status;
    if (r.status === 'TLE') status = 'TLE';
    else if (r.status === 'RE') status = 'RE';
    else if (r.status === 'OK' && r.stdout === tc.expectedOutput.trim()) status = 'PASS';
    else status = 'WA';

    results.push({ index: i + 1, status });
  }

  return results;
}

module.exports = { evaluateAgainstCases };

