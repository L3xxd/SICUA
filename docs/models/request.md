# Modelo: Request

Campos (Prisma):
- `id: string`
- `employeeId: string` y relación `employee: User`
- `type: string` (p.ej., `vacation`, `leave`)
- `startDate: Date`
- `endDate: Date`
- `reason: string`
- `status: string` (default `pending`)
- `stage?: string` (flujo: supervisor → hr → director → completed)
- `supervisorName?: string`
- `department?: string`
- `requestDate: Date` (default `now()`)
- `approvedBy?: string`
- `approvedDate?: Date`
- `rejectionReason?: string`
- `days: number` (default 0)
- `urgent: boolean` (default false)
- `history: RequestHistory[]`
