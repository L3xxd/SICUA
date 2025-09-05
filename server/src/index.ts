import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Auth (simple, sin JWT por ahora)
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'email/password requeridos' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  if (user.password && user.password !== password) return res.status(401).json({ error: 'Credenciales inválidas' });
  // token ficticio
  res.json({ token: 'dev-token', user });
});

// Users
app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({ include: { assignments: true } });
  res.json(users);
});

app.post('/users', async (req, res) => {
  const data = req.body ?? {};
  try {
    // Validación simple de contractType
    if (data.contractType && !['fijo', 'temporal'].includes(String(data.contractType))) {
      return res.status(400).json({ error: 'contractType inválido (use "fijo" o "temporal")' });
    }
    // Generar barcode si no viene
    let barcode: string | null = data.barcode ?? null;
    const gen = () => `EMP-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    if (!barcode) {
      // intentar varias veces por si colisiona
      for (let i = 0; i < 5; i++) {
        const candidate = gen();
        const exists = await prisma.user.findFirst({ where: { barcode: candidate } });
        if (!exists) { barcode = candidate; break; }
      }
    } else {
      const exists = await prisma.user.findFirst({ where: { barcode } });
      if (exists) return res.status(400).json({ error: 'barcode ya existe' });
    }
    const assignments = Array.isArray(data.assignments) ? data.assignments as Array<{department:string; position:string}> : [];
    const mainDept = assignments[0]?.department ?? data.department;
    const mainPos = assignments[0]?.position ?? data.position;

    const created = await prisma.user.create({
      data: { ...data, department: mainDept, position: mainPos, barcode, assignments: {
        create: assignments.map(a => ({ department: a.department, position: a.position }))
      } },
      include: { assignments: true }
    });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body ?? {};
  try {
    if (data.contractType && !['fijo', 'temporal'].includes(String(data.contractType))) {
      return res.status(400).json({ error: 'contractType inválido (use "fijo" o "temporal")' });
    }
    if (data.barcode) {
      const exists = await prisma.user.findFirst({ where: { barcode: data.barcode, NOT: { id } } });
      if (exists) return res.status(400).json({ error: 'barcode ya existe' });
    }
    const assignments = Array.isArray(data.assignments) ? data.assignments as Array<{department:string; position:string}> : null;
    const mainDept = assignments && assignments[0]?.department ? assignments[0].department : data.department;
    const mainPos = assignments && assignments[0]?.position ? assignments[0].position : data.position;

    const updated = await prisma.user.update({ where: { id }, data: { ...data, department: mainDept, position: mainPos } });

    if (assignments) {
      // sync: delete removed, upsert provided
      const existing = await prisma.departmentAssignment.findMany({ where: { userId: id } });
      const nextKeys = new Set(assignments.map(a => a.department));
      const toDelete = existing.filter(e => !nextKeys.has(e.department)).map(e => e.id);
      if (toDelete.length) {
        await prisma.departmentAssignment.deleteMany({ where: { id: { in: toDelete } } });
      }
      for (const a of assignments) {
        await prisma.departmentAssignment.upsert({
          where: { userId_department: { userId: id, department: a.department } },
          update: { position: a.position },
          create: { userId: id, department: a.department, position: a.position },
        });
      }
    }

    const withAssign = await prisma.user.findUnique({ where: { id }, include: { assignments: true } });
    res.json(withAssign);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Requests
app.get('/requests', async (_req, res) => {
  const requests = await prisma.request.findMany({ include: { employee: true, history: true } });
  res.json(requests);
});

app.post('/requests', async (req, res) => {
  const data = req.body;
  try {
    const created = await prisma.request.create({ data, include: { employee: true } });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, approvedBy, rejectionReason } = req.body ?? {} as { status: string; approvedBy?: string; rejectionReason?: string };
  if (!status) return res.status(400).json({ error: 'status requerido' });
  try {
    const updated = await prisma.request.update({ where: { id }, data: { status, approvedBy, rejectionReason, approvedDate: status === 'approved' ? new Date() : null } });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/requests/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.requestHistory.deleteMany({ where: { requestId: id } });
    await prisma.request.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Notifications
app.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  const items = await prisma.notification.findMany({ where: { userId } });
  res.json(items);
});

app.post('/notifications', async (req, res) => {
  try {
    const created = await prisma.notification.create({ data: req.body });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Policies
app.get('/policies', async (_req, res) => {
  const items = await prisma.policyRule.findMany();
  res.json(items.map(p => ({ ...p, approvalLevels: JSON.parse(p.approvalLevels || '[]') })));
});

app.put('/policies/:id', async (req, res) => {
  const { id } = req.params;
  const { patch, actor } = req.body ?? {};
  if (!patch) return res.status(400).json({ error: 'patch requerido' });
  try {
    const existing = await prisma.policyRule.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'policy no encontrada' });
    const updated = await prisma.policyRule.update({ where: { id }, data: {
      type: patch.type ?? existing.type,
      minAdvanceDays: patch.minAdvanceDays ?? existing.minAdvanceDays,
      maxConsecutiveDays: patch.maxConsecutiveDays ?? existing.maxConsecutiveDays,
      requiresApproval: patch.requiresApproval ?? existing.requiresApproval,
      approvalLevels: JSON.stringify(patch.approvalLevels ?? JSON.parse(existing.approvalLevels || '[]')),
    }});
    // Historial simple por cada campo cambiado
    const changes: any[] = [];
    const before = existing;
    const after = updated;
    const compare = (field: string, from: any, to: any) => { if (JSON.stringify(from) !== JSON.stringify(to)) changes.push({ policyId: id, type: after.type, field, from: String(from), to: String(to), actor: actor || 'Sistema' }); };
    compare('minAdvanceDays', before.minAdvanceDays, after.minAdvanceDays);
    compare('maxConsecutiveDays', before.maxConsecutiveDays, after.maxConsecutiveDays);
    compare('requiresApproval', before.requiresApproval, after.requiresApproval);
    compare('approvalLevels', before.approvalLevels, after.approvalLevels);
    if (changes.length) await prisma.policyChange.createMany({ data: changes });
    res.json({ ...updated, approvalLevels: JSON.parse(updated.approvalLevels || '[]') });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/policy-history', async (_req, res) => {
  const items = await prisma.policyChange.findMany({ orderBy: { date: 'desc' }, take: 500 });
  res.json(items);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`SICUA API running on http://localhost:${port}`);
});

// attendance routes removed (reverted)
