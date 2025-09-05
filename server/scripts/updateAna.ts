import { PrismaClient } from '@prisma/client';

async function main() {
  if (!process.env.DATABASE_URL) {
    // Default to local SQLite in repo for scripts
    process.env.DATABASE_URL = 'file:./server/prisma/dev.db';
  }
  const prisma = new PrismaClient();
  try {
    const email = 'empleado@empresa.com';
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`No existe el usuario con email ${email}`);
      process.exit(1);
    }

    // Hire date = hoy - 1 año, mismo mes/día
    const now = new Date();
    const hired = new Date(now);
    hired.setFullYear(now.getFullYear() - 1);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        hireDate: hired,
        contractType: 'fijo',
        usedVacationDays: 0,
      },
    });

    // Eliminar solicitudes de vacaciones existentes de este usuario
    const vacationReqs = await prisma.request.findMany({ where: { employeeId: user.id, type: 'vacation' } });
    if (vacationReqs.length) {
      await prisma.requestHistory.deleteMany({ where: { requestId: { in: vacationReqs.map(r => r.id) } } });
      await prisma.request.deleteMany({ where: { id: { in: vacationReqs.map(r => r.id) } } });
    }

    console.log(`Actualizado ${updated.email}. hireDate=${hired.toISOString().slice(0,10)}, contrato=fijo, usadas=0. Eliminadas ${vacationReqs.length} solicitudes de vacaciones.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
