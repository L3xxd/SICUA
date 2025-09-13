# Backend (Express + Prisma)

Resumen de endpoints, modelos de datos y scripts. Documentación separada del código.

## Servidor HTTP
- `server/src/index.ts`: App Express con CORS y JSON. Usa `@prisma/client`.

### Endpoints
- `GET /health`: Salud del servicio. Respuesta: `{ ok: true }`.

- `POST /auth/login`
  - Body: `{ email: string, password: string }`
  - Respuesta: `{ token: 'dev-token', user }` si credenciales válidas (comparación directa).

- `GET /users`: Lista usuarios con `assignments`.
- `POST /users`: Crea usuario. Valida `contractType` en {`fijo`,`temporal`}.
  - Si no se provee `barcode`, genera uno único (`EMP-XXXXXX-####`).
  - Soporta `assignments: { department, position }[]` y define `department/position` principales desde el primer assignment.
- `PUT /users/:id`: Actualiza usuario, valida `contractType` y unicidad de `barcode`.
  - Sincroniza `assignments`: borra los eliminados y hace `upsert` de los presentes.

- `GET /requests`: Lista solicitudes con `employee` y `history`.
- `POST /requests`: Crea solicitud.
- `PUT /requests/:id/status`: Actualiza `status`, `approvedBy`, `rejectionReason`. Si `approved`, setea `approvedDate`.
- `PUT /requests/:id/stage`: Actualiza `stage` (p.ej. supervisor → hr → director → completed).
- `DELETE /requests/:id`: Elimina `history` asociado y la solicitud.

- `GET /notifications/:userId`: Lista notificaciones de un usuario.
- `POST /notifications`: Crea notificación.
- `PUT /notifications/:id/read`: Marca como leída.

- `GET /policies`: Devuelve `PolicyRule[]` parseando `approvalLevels` (JSON).
- `PUT /policies/:id`: Actualiza campos de la política y registra cambios en `PolicyChange` por campo modificado.

## Modelos de datos (Prisma)
- `server/prisma/schema.prisma` (SQLite):
  - `User`: datos del empleado, supervisoría, `barcode` único, `assignments`.
  - `DepartmentAssignment`: relación usuario–departamento con `position`. Único por (`userId`,`department`).
  - `Request`: solicitud (vacaciones/permiso) con `status`, `stage`, `days`, `urgent` y referencias a `User`.
  - `RequestHistory`: auditoría de acciones sobre solicitudes.
  - `Notification`: mensajes por usuario, `type`, `read`, `relatedRequestId` opcional.
  - `PolicyRule`: reglas (tipo, días mínimos de aviso, máximos consecutivos, `requiresApproval`, `approvalLevels` como JSON string).
  - `PolicyChange`: historial de cambios por política y campo.

## Scripts y base
- `server/prisma/dev.db`: Base SQLite de desarrollo.
- `server/prisma/seed.ts`: Semillas iniciales (usuarios, políticas, etc.).
- `server/scripts/resetGlobal.ts`: Reseteo de datos globales a estado base.
- `server/scripts/resetSimulation.ts`: Limpieza/simulación de datos de prueba.
- `server/scripts/backfillBarcodes.ts`: Rellena `barcode` únicos para usuarios existentes.
- `server/scripts/updateAna.ts`: Actualización puntual.

## Variables de entorno
- `DATABASE_URL`: Ruta SQLite para Prisma.
- `PORT`: Puerto del servidor (por defecto `3001`).

## Notas de integración desde el frontend
- Configurar `VITE_API_URL` en el frontend para habilitar `api.ts`.
- Autenticación es simple (sin JWT real). El token devuelto (`dev-token`) se guarda en `localStorage` por el frontend.

