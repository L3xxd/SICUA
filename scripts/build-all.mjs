import path from 'path';
import { spawn } from 'child_process';

const root = process.cwd();
const serverDir = path.join(root, 'server');

function run(name, cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`\n[${name}] ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`[${name}] exited with code ${code}`));
    });
  });
}

async function main() {
  // Ensure Prisma client exists before building server
  await run('server', 'npm', ['run', 'prisma:generate'], serverDir);

  // Build frontend first (so vite uses current VITE_API_URL)
  await run('web', 'npm', ['run', 'build'], root);

  // Build backend
  await run('server', 'npm', ['run', 'build'], serverDir);

  console.log('\nBuild completed.');
  console.log('- Start backend:  cd server && npm start');
  console.log('- Preview frontend: npm run preview');
  console.log('- Or start both:   npm run start:all');
}

main().catch((err) => {
  console.error('Build failed:', err.message);
  process.exit(1);
});

