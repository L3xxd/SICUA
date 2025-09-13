# API: Notificaciones

## GET /notifications/:userId
- 200 OK: `Notification[]` del usuario.

## POST /notifications
- Body (ejemplo):
```json
{
  "userId": "cku...",
  "title": "Nueva solicitud",
  "message": "Tienes una solicitud por revisar",
  "type": "request",
  "relatedRequestId": "ckr..."
}
```
- 201 Created: `Notification` creada.

## PUT /notifications/:id/read
- Marca la notificación como leída (`read = true`).

Estructuras:
- Ver `docs/models/notification.md`.
