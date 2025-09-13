# API: Solicitudes

## GET /requests
- 200 OK: `Request[]` con `employee` y `history`.

## POST /requests
- Body (ejemplo):
```json
{
  "employeeId": "cku...",
  "type": "vacation",
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-07-05T00:00:00.000Z",
  "reason": "Vacaciones anuales",
  "days": 5,
  "urgent": false
}
```
- 201 Created: `Request` creada.
- 400: `{ "error": "mensaje" }`.

## PUT /requests/:id/status
- Body:
```json
{ "status": "approved", "approvedBy": "Jefe", "rejectionReason": null }
```
- Si `status` = `approved`, `approvedDate` se establece automáticamente.

## PUT /requests/:id/stage
- Body:
```json
{ "stage": "hr" }
```
- Etapas típicas: `supervisor` → `hr` → `director` → `completed`.

## DELETE /requests/:id
- Elimina `history` asociado y luego la solicitud.

Estructuras:
- Ver `docs/models/request.md` y `docs/models/request-history.md`.
