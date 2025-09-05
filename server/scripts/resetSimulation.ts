import { PrismaClient } from '@prisma/client';

async function main() {
  if (!process.env.DATABASE_URL) {
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

    // Reestablecer perfil base de la simulación: aniversario hoy - 1 año, contrato fijo, usadas = 0
    const now = new Date();
    const hired = new Date(now);
    hired.setFullYear(now.getFullYear() - 1);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hireDate: hired,
        contractType: 'fijo',
        usedVacationDays: 0,
      },
    });

    // Eliminar TODAS las solicitudes de vacaciones de Ana para restaurar números
    const vacationReqs = await prisma.request.findMany({ where: { employeeId: user.id, type: 'vacation' } });
    if (vacationReqs.length) {
      await prisma.requestHistory.deleteMany({ where: { requestId: { in: vacationReqs.map(r => r.id) } } });
      await prisma.request.deleteMany({ where: { id: { in: vacationReqs.map(r => r.id) } } });
      console.log(`Eliminadas ${vacationReqs.length} solicitudes de vacaciones de ${user.email}.`);
    } else {
      console.log('No hay solicitudes de vacaciones para eliminar.');
    }

    console.log('Simulación restablecida: sin solicitudes de vacaciones, hireDate ajustado y usadas=0.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
