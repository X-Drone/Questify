const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, '..');
const venvDir = path.join(backendDir, '.venv');

function tryRun(cmd, args, options = {}) {
  const res = spawnSync(cmd, args, {
    stdio: 'pipe',
    ...options,
  });
  return res;
}

function getPythonVersion(pythonCmd) {
  const res = tryRun(pythonCmd, ['--version']);
  if (res.status !== 0) return null;

  const output = (res.stdout.toString() || res.stderr.toString()).trim();
  const match = output.match(/Python (\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw: output,
  };
}

function findValidPython() {
  const candidates = ['python3.12', 'python3', 'python'];

  for (const cmd of candidates) {
    const version = getPythonVersion(cmd);
    if (!version) continue;

    const { major, minor } = version;

    if (major !== 3) {
      console.error(`❌ ${cmd}: Python ${version.raw} — only Python 3 is supported`);
      continue;
    }

    if (minor < 12) {
      console.error(`❌ ${cmd}: Python ${version.raw} — Python 3.12 is required`);
      continue;
    }

    if (minor >= 13) {
      console.error(`❌ ${cmd}: Python ${version.raw} — Python 3.13+ is NOT supported yet`);
      continue;
    }

    console.log(`✅ Using ${cmd} (${version.raw})`);
    return cmd;
  }

  console.error(`
❌ No suitable Python found.

Required:
  - Python 3.12.x

Checked:
  - python3.12
  - python3
  - python

👉 Please install Python 3.12 and make sure it is available in PATH.
    https://www.python.org/downloads/release/python-3120/
`);
  process.exit(1);
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, {
    cwd: backendDir,
    stdio: 'inherit',
  });
  if (res.status !== 0) process.exit(res.status);
}

/* ===== MAIN ===== */

if (!fs.existsSync(venvDir)) {
  const python = findValidPython();

  console.log('📦 Creating virtual environment');
  run(python, ['-m', 'venv', '.venv']);
} else {
  console.log('✅ Virtual environment already exists');
}

const pip =
  process.platform === 'win32'
    ? path.join(venvDir, 'Scripts', 'pip.exe')
    : path.join(venvDir, 'bin', 'pip');

console.log('📥 Installing backend dependencies');
run(pip, ['install', '-r', 'requirements.txt']);
