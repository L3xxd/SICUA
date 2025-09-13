import path from 'path';
import { spawn } from 'child_process';

const root = process.cwd();
const serverDir = path.join(root, 'server');

function start(name, cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, shell: true });
  const prefix = `[${name}]`;
  child.stdout.on('data', (d) => process.stdout.write(`${prefix} ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`${prefix} ${d}`));
  child.on('exit', (code) => console.log(`${prefix} exited with code ${code}`));
  return child;
}

const backend = start('server', 'npm', ['run', 'dev'], serverDir);
const frontend = start('web', 'npm', ['run', 'dev'], root);

function shutdown() {
  backend && backend.kill('SIGINT');
  frontend && frontend.kill('SIGINT');
  setTimeout(() => process.exit(0), 200);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

