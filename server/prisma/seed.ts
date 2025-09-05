import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Upsert de 4 perfiles con datos completos
  const hr = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {
      name: 'María García', password: 'password', role: 'hr',
      department: 'Recursos Humanos', position: 'Directora de RRHH',
      vacationDays: 12, usedVacationDays: 0,
      phone: '+52 5512345678', contractType: 'fijo', barcode: 'EMP-0001-0001',
      hireDate: new Date('2019-03-15T00:00:00Z'),
    },
    create: {
      email: 'admin@empresa.com', name: 'María García', password: 'password', role: 'hr',
      department: 'Recursos Humanos', position: 'Directora de RRHH',
      vacationDays: 12, usedVacationDays: 0,
      phone: '+52 5512345678', contractType: 'fijo', barcode: 'EMP-0001-0001',
      hireDate: new Date('2019-03-15T00:00:00Z'),
    }
  });

  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@empresa.com' },
    update: {
      name: 'Carlos Mendez', password: 'password', role: 'supervisor',
      department: 'Mantenimiento', position: 'Jefe de Mantenimiento',
      vacationDays: 14, usedVacationDays: 0,
      phone: '+52 5587654321', contractType: 'fijo', barcode: 'EMP-0002-0002',
      hireDate: new Date('2020-06-10T00:00:00Z'),
    },
    create: {
      email: 'supervisor@empresa.com', name: 'Carlos Mendez', password: 'password', role: 'supervisor',
      department: 'Mantenimiento', position: 'Jefe de Mantenimiento',
      vacationDays: 14, usedVacationDays: 0,
      phone: '+52 5587654321', contractType: 'fijo', barcode: 'EMP-0002-0002',
      hireDate: new Date('2020-06-10T00:00:00Z'),
    }
  });

  const employee = await prisma.user.upsert({
    where: { email: 'empleado@empresa.com' },
    update: {
      name: 'Ana López', password: 'password', role: 'employee',
      department: 'Mantenimiento', position: 'Operador de Mantenimiento',
      vacationDays: 10, usedVacationDays: 1,
      phone: '+52 5511122233', contractType: 'temporal', barcode: 'EMP-0003-0003',
      hireDate: new Date('2022-01-20T00:00:00Z'), supervisorId: undefined,
    },
    create: {
      email: 'empleado@empresa.com', name: 'Ana López', password: 'password', role: 'employee',
      department: 'Mantenimiento', position: 'Operador de Mantenimiento',
      vacationDays: 10, usedVacationDays: 1,
      phone: '+52 5511122233', contractType: 'temporal', barcode: 'EMP-0003-0003',
      hireDate: new Date('2022-01-20T00:00:00Z'),
    }
  });

  const director = await prisma.user.upsert({
    where: { email: 'director@empresa.com' },
    update: {
      name: 'Roberto Silva', password: 'password', role: 'director',
      department: 'Dirección General', position: 'Director General',
      vacationDays: 12, usedVacationDays: 0,
      phone: '+52 5599988877', contractType: 'fijo', barcode: 'EMP-0004-0004',
      hireDate: new Date('2018-09-01T00:00:00Z'),
    },
    create: {
      email: 'director@empresa.com', name: 'Roberto Silva', password: 'password', role: 'director',
      department: 'Dirección General', position: 'Director General',
      vacationDays: 12, usedVacationDays: 0,
      phone: '+52 5599988877', contractType: 'fijo', barcode: 'EMP-0004-0004',
      hireDate: new Date('2018-09-01T00:00:00Z'),
    }
  });

  // Asegurar la relación supervisor -> empleado
  await prisma.user.update({ where: { id: employee.id }, data: { supervisorId: supervisor.id } });

  const pcount = await prisma.policyRule.count();
  if (pcount === 0) {
    await prisma.policyRule.createMany({ data: [
      { type: 'vacation', minAdvanceDays: 5, maxConsecutiveDays: 15, requiresApproval: true, approvalLevels: JSON.stringify(['supervisor','hr']) },
      { type: 'permission', minAdvanceDays: 2, maxConsecutiveDays: 3, requiresApproval: true, approvalLevels: JSON.stringify(['supervisor']) },
      { type: 'leave', minAdvanceDays: 0, maxConsecutiveDays: 30, requiresApproval: true, approvalLevels: JSON.stringify(['supervisor','hr','director']) },
    ]});
  }
}

main().then(() => {
  console.log('Seed completed');
}).catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
