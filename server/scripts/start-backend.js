const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const backendDir = path.join(__dirname, '..');
const envPath = path.join(backendDir, '.env');
const envExamplePath = path.join(backendDir, '.env.example');

function ensureEnv() {
  if (fs.existsSync(envPath)) return;

  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env not found and .env.example missing');
    process.exit(1);
  }

  console.warn('⚠️  .env not found');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    '👉 Create .env from .env.example? [Y/n] ',
    (answer) => {
      rl.close();
      if (answer.trim().toLowerCase() === 'n') {
        process.exit(1);
      }

      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env created from .env.example');
      return;
    }
  );

  console.error('Please run the script again after creating the .env file manually.');
  process.exit(0);
}

function resolvePython() {
  const venvPython =
    process.platform === 'win32'
      ? path.join(backendDir, '.venv', 'Scripts', 'python.exe')
      : path.join(backendDir, '.venv', 'bin', 'python');

  if (fs.existsSync(venvPython)) {
    return venvPython;
  }

  // throw error if virtual environment python is not found
  throw new Error('Virtual environment not found. Please run the install script first.');
}

const python = resolvePython();

ensureEnv();

const args = [
  '-m', 'uvicorn',
  '--app-dir', 'src',
  'main:app',
  '--reload',
  '--reload-dir', 'src',
  '--host', '0.0.0.0',
  '--port', '3002'
];

console.log(`🚀 Starting backend using: ${python}`);

const proc = spawn(python, args, {
  cwd: backendDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PYTHONUNBUFFERED: '1',
  },
});

proc.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend exited with code ${code}`);
    process.exit(code);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend...');
  proc.kill('SIGINT');
});

process.on('SIGTERM', () => {
  proc.kill('SIGTERM');
});

proc.on('error', (err) => {
  console.error('❌ Failed to start backend:', err);
  process.exit(1);
});
