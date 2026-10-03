const { spawn } = require('child_process');

const backend = spawn('npm', ['run', 'dev'], { cwd: './backend', stdio: 'inherit', shell: true });
const frontend = spawn('npm', ['run', 'dev'], { cwd: './frontend', stdio: 'inherit', shell: true });

function cleanup() {
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
