import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function genBarcode(): string {
  return `EMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
}

async function ensureUniqueBarcode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const candidate = genBarcode();
    const exists = await prisma.user.findFirst({ where: { barcode: candidate } });
    if (!exists) return candidate;
  }
  // Fallback menos probable
  return `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function main() {
  const users = await prisma.user.findMany();
  let updated = 0;
  for (const u of users) {
    if (!u.barcode || u.barcode.trim() === '') {
      const code = await ensureUniqueBarcode();
      await prisma.user.update({ where: { id: u.id }, data: { barcode: code } });
      updated++;
    }
  }
  console.log(`Backfill completed. Updated ${updated} users without barcode.`);
}

main().then(() => prisma.$disconnect()).catch((e) => {
  console.error(e);
  process.exit(1);
});

