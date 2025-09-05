import { PrismaClient } from '@prisma/client';

async function main() {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./server/prisma/dev.db';
  }
  const prisma = new PrismaClient();
  try {
    // Delete dependent tables first to satisfy FKs
    const deletedHist = await prisma.requestHistory.deleteMany({});
    const deletedReqs = await prisma.request.deleteMany({});
    const deletedNotifs = await prisma.notification.deleteMany({});
    const deletedPolicyHist = await prisma.policyChange.deleteMany({});

    // Reset users' usedVacationDays to 0 (keep users and their assignments)
    await prisma.user.updateMany({ data: { usedVacationDays: 0 } });

    // Alinear el caso de demo: Ana (empleado@empresa.com) en su primer año
    const ana = await prisma.user.findUnique({ where: { email: 'empleado@empresa.com' } });
    if (ana) {
      const now = new Date();
      const hired = new Date(now);
      hired.setFullYear(now.getFullYear() - 1);
      await prisma.user.update({
        where: { id: ana.id },
        data: { hireDate: hired, contractType: 'fijo', usedVacationDays: 0 },
      });
    }

    console.log(
      `Reset global completo: requestHistory=${deletedHist.count}, requests=${deletedReqs.count}, notifications=${deletedNotifs.count}, policyHistory=${deletedPolicyHist.count}. usedVacationDays=0 para todos los usuarios.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
