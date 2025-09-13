# Modelo: PolicyRule

Campos (Prisma):
- `id: string`
- `type: string` (p.ej., `vacation`)
- `minAdvanceDays: number`
- `maxConsecutiveDays: number`
- `requiresApproval: boolean`
- `approvalLevels: string` (JSON string de arreglo)

Notas:
- En `GET /policies` y respuesta de `PUT /policies/:id`, `approvalLevels` se devuelve como arreglo JSON.
