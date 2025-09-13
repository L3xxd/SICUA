# Documentación de Archivos

Esta guía enumera los archivos relevantes del frontend y backend, con una breve descripción de su propósito.

## Frontend (`src/`)

- `src/main.tsx`: Punto de entrada de React; monta la app y configura el router.
- `src/App.tsx`: Define las rutas principales, rutas protegidas y layout base.
- `src/index.css`: Estilos globales (Tailwind/PostCSS).
- `src/vite-env.d.ts`: Tipos de Vite para TypeScript.

### Contextos y configuración
- `src/context/AuthContext.tsx`: Contexto de autenticación; maneja login, logout y estado `currentUser`. Integra con `api` y modo mock.
- `src/context/AppContext.tsx`: Contexto de estado global de la aplicación (preferencias/estado compartido). 
- `src/config/policies.ts`: Configuración y estructura de políticas desde el lado del cliente.
- `src/utils/labels.ts`: Utilidades para etiquetas/formatos legibles por el usuario.
- `src/utils/policies/vacations.ts`: Utilidades/validadores para políticas de vacaciones.
- `src/types/index.ts`: Definiciones de tipos compartidos del frontend (Usuario, Solicitud, Notificación, etc.).

### Servicios y datos
- `src/services/api.ts`: Cliente HTTP tipado para consumir el backend (`/auth`, `/users`, `/requests`, `/notifications`, `/policies`). Usa `VITE_API_URL`.
- `src/data/mockData.ts`: Datos de ejemplo/mock para desarrollo sin API.
- `src/data/departments.ts`: Catálogo de departamentos y posiciones simuladas.

### Componentes de UI
- `src/components/Layout.tsx`: Contenedor principal con `Sidebar` + `Header` + `Outlet`.
- `src/components/Protected/Protected.tsx`: Guarda de ruta; exige autenticación antes de renderizar hijos.
- `src/components/Header.tsx`: Barra superior con accesos rápidos/perfil.
- `src/components/Sidebar.tsx`: Navegación lateral y links de secciones.
- `src/components/NavLink.tsx`: Link de navegación estilizado/activo.

### Páginas y vistas
- `src/components/Dashboard.tsx`: Panel general del usuario.
- `src/components/ProfileView.tsx`: Perfil del usuario autenticado.
- `src/components/ProfileModal.tsx`: Modal para edición/visualización rápida de perfil.
- `src/components/CalendarView.tsx`: Calendario con eventos/solicitudes.
- `src/components/ApprovalsView.tsx`: Bandeja de aprobaciones pendientes por rol.
- `src/components/TeamView.tsx`: Vista de equipo/asignaciones por departamento.
- `src/components/EmployeesManagement.tsx`: Administración de empleados (alta/edición/listado).
- `src/components/ReportsView.tsx`: Reportes generales.
- `src/components/LoginForm.tsx`: Formulario de acceso.

### Dashboards por rol
- `src/components/dashboards/EmployeeDashboard.tsx`: Panel para empleado (estado de solicitudes, notificaciones, etc.).
- `src/components/dashboards/HRDashboard.tsx`: Panel para RRHH (procesos, métricas clave).
- `src/components/dashboards/SupervisorDashboard.tsx`: Panel para supervisores (seguimiento/aprobaciones del equipo).
- `src/components/dashboards/DirectorDashboard.tsx`: Panel para directores (visión ejecutiva).

### Directorio "director"
- `src/components/director/ExecutiveReports.tsx`: Reportes ejecutivos agregados.
- `src/components/director/AnalyticsView.tsx`: Analítica y visualizaciones.

### Solicitudes
- `src/components/requests/RequestsList.tsx`: Listado/estado de solicitudes.
- `src/components/requests/RequestForm.tsx`: Formulario para crear solicitudes (vacaciones, permisos, etc.).

## Backend (`server/`)

- `server/src/index.ts`: Servidor Express. Endpoints:
  - `GET /health`: chequeo de salud.
  - `POST /auth/login`: login simple (sin JWT real).
  - `GET /users` / `POST /users` / `PUT /users/:id`: CRUD básico de usuarios + asignaciones por departamento.
  - `GET /requests` / `POST /requests` / `PUT /requests/:id/status` / `PUT /requests/:id/stage` / `DELETE /requests/:id`: flujo de solicitudes.
  - `GET /notifications/:userId` / `POST /notifications` / `PUT /notifications/:id/read`: notificaciones por usuario.
  - `GET /policies` / `PUT /policies/:id`: lectura/actualización de políticas y registro de cambios.

### Prisma y base de datos
- `server/prisma/schema.prisma`: Esquema de datos (User, DepartmentAssignment, Request, Notification, PolicyRule, PolicyChange, etc.).
- `server/prisma/seed.ts`: Datos iniciales/semillas para poblar la base.
- `server/prisma/dev.db`: Base SQLite para desarrollo.

### Scripts de mantenimiento
- `server/scripts/resetGlobal.ts`: Reseteo de datos globales a un estado base.
- `server/scripts/resetSimulation.ts`: Simulación/limpieza de datos de prueba.
- `server/scripts/backfillBarcodes.ts`: Backfill de barcodes únicos para usuarios existentes.
- `server/scripts/updateAna.ts`: Script utilitario para actualizaciones puntuales.

## Raíz del proyecto y otros

- `index.html`: HTML base del frontend (Vite).
- `tailwind.config.js`: Configuración de TailwindCSS.
- `postcss.config.js`: Configuración de PostCSS.
- `tsconfig.app.json` / `tsconfig.node.json`: Config de TypeScript para app/node.
- `package-lock.json`: Bloqueo de dependencias.
- `public/icono.png` / `public/icono-big.png`: Recursos estáticos.
- `dist/**`: Artefactos de build (frontend) — no editar manualmente.

Notas:
- Directorios `node_modules/`, `.git/`, `dist/` y archivos del sistema se omiten de la documentación funcional.
- Las rutas y nombres están en español por consistencia del dominio y la app.

