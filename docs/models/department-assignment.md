# Modelo: DepartmentAssignment

Campos (Prisma):
- `id: string` (cuid)
- `userId: string`
- `department: string`
- `position: string`
- `createdAt: Date`
- `updatedAt: Date`

Restricciones:
- `@@unique([userId, department])`: un usuario solo puede tener una asignación por departamento.
