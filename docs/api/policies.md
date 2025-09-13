# API: Políticas

## GET /policies
- 200 OK: `PolicyRule[]` con `approvalLevels` parseado a arreglo.

## PUT /policies/:id
- Body (ejemplo):
```json
{
  "patch": {
    "minAdvanceDays": 5,
    "maxConsecutiveDays": 10,
    "requiresApproval": true,
    "approvalLevels": ["supervisor", "hr", "director"]
  },
  "actor": "Admin RRHH"
}
```
- 200 OK: Política actualizada con `approvalLevels` como arreglo y registro en `PolicyChange` por cada campo modificado.
- 404: `{ "error": "policy no encontrada" }`
- 400: `{ "error": "mensaje" }`

Estructuras:
- Ver `docs/models/policy-rule.md` y `docs/models/policy-change.md`.
