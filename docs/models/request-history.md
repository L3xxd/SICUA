# Modelo: RequestHistory

Campos (Prisma):
- `id: string`
- `requestId: string` y relación `request: Request`
- `action: string` (p.ej., `submitted`, `approved`, `rejected`)
- `by: string` (actor)
- `date: Date` (default `now()`)
- `reason?: string`
