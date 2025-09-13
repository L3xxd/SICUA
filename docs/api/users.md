# API: Usuarios

## GET /users
- 200 OK: `User[]` incluyendo `assignments`.

## POST /users
- Body (ejemplo mínimo):
```json
{
  "email": "luis@example.com",
  "name": "Luis",
  "role": "employee",
  "department": "Ventas",
  "position": "Ejecutivo"
}
```
- Notas:
  - `contractType` permitido: `"fijo" | "temporal"`.
  - Si no se envía `barcode`, el servidor genera uno único.
  - Puede incluir `assignments`: `[{"department":"Ventas","position":"Ejecutivo"}]`.
- 201 Created: `User` con `assignments`.
- 400: `{ "error": "mensaje" }` (p.ej., `barcode` duplicado, `contractType` inválido).

## PUT /users/:id
- Body: campos a actualizar; mismas reglas de validación.
- Sincroniza `assignments` (borra los ausentes y actualiza/crea los presentes por `department`).
- 200 OK: `User` actualizado con `assignments`.

Estructuras:
- Ver `docs/models/user.md` y `docs/models/department-assignment.md`.
