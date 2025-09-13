# Modelo: User

Campos principales (Prisma):
- `id: string` (cuid)
- `email: string` (único)
- `name: string`
- `password?: string`
- `role: string`
- `department: string`
- `position: string`
- `supervisorId?: string` y relación `supervisor`/`subordinates`
- `avatar?: string`
- `vacationDays: number` (default 0)
- `usedVacationDays: number` (default 0)
- `phone?: string`
- `hireDate?: Date`
- `contractType?: string` (`fijo | temporal` en API)
- `barcode: string` (único)
- `assignments: DepartmentAssignment[]`
- `requests: Request[]`, `notifications: Notification[]`

Ejemplo:
```json
{
  "id": "cku...",
  "email": "ana@example.com",
  "name": "Ana",
  "role": "employee",
  "department": "Ventas",
  "position": "Ejecutivo",
  "barcode": "EMP-ABC123-0123"
}
```
