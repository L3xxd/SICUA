# Modelo: PolicyChange

Campos (Prisma):
- `id: string`
- `policyId: string`
- `type: string` (tipo de política asociado)
- `field: string` (campo modificado)
- `from: string` (valor anterior)
- `to: string` (valor nuevo)
- `actor: string` (quién realizó el cambio)
- `date: Date` (default now)
