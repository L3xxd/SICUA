import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const root = process.cwd();
const serverDir = path.join(root, 'server');

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function ensureFile(filePath, contents) {
  if (!(await exists(filePath))) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents, 'utf8');
    console.log(`Created ${filePath}`);
  } else {
    console.log(`Found ${filePath}`);
  }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function main() {
  // 1) Env files
  await ensureFile(path.join(root, '.env'), 'VITE_API_URL=http://localhost:3001\n');
  await ensureFile(path.join(serverDir, '.env'), 'DATABASE_URL="file:./dev.db"\nPORT=3001\n');

  // 2) Install dependencies
  console.log('\nInstalling frontend deps...');
  await run('npm', ['install'], { cwd: root });

  console.log('\nInstalling backend deps...');
  await run('npm', ['install'], { cwd: serverDir });

  // 3) Prisma: generate + migrate + seed
  console.log('\nGenerating Prisma client...');
  await run('npm', ['run', 'prisma:generate'], { cwd: serverDir });

  console.log('\nApplying migrations (dev)...');
  await run('npm', ['run', 'prisma:migrate'], { cwd: serverDir });

  console.log('\nSeeding database...');
  await run('npm', ['run', 'prisma:seed'], { cwd: serverDir });

  console.log('\nSetup completed successfully.');
  console.log('- Start backend:  cd server && npm run dev');
  console.log('- Start frontend: npm run dev');
  console.log('- Or run both:   npm run dev:all');
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message);
  process.exit(1);
});

