# API: Autenticación

## POST /auth/login
- Body:
```json
{
  "email": "ana@example.com",
  "password": "password"
}
```
- 200 OK:
```json
{
  "token": "dev-token",
  "user": {
    "id": "cku...",
    "email": "ana@example.com",
    "name": "Ana",
    "role": "employee",
    "department": "Ventas",
    "position": "Ejecutivo",
    "barcode": "EMP-ABC123-0123"
  }
}
```
- 400 / 401: `{ "error": "mensaje" }`

Notas:
- No hay JWT real. El frontend guarda `token` en `localStorage`.
