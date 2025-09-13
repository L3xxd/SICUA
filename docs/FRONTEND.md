# Frontend (React + TypeScript)

Resumen de los módulos y responsabilidades. La documentación es separada y no intrusiva al código.

## Entradas y configuración
- `src/main.tsx`: Inicializa React y el router. Monta la app en `#root`.
- `src/App.tsx`: Define las rutas públicas (`/login`) y protegidas (dashboard, solicitudes, perfiles, etc.). Usa `Protected` como guard.
- `src/index.css`: Estilos globales (Tailwind). Ajustes base y utilidades.
- `src/vite-env.d.ts`: Tipos de Vite para TS.

## Contextos y utilidades
- `src/context/AuthContext.tsx`:
  - Estado `currentUser`, métodos `login(email, password)` y `logout()`.
  - Si `VITE_API_URL` está definido, usa `api.login`; si no, usa `mockUsers`.
  - Expone `isAuthenticated` para el guard de rutas.
- `src/context/AppContext.tsx`: Estado global para preferencias/selecciones compartidas.
- `src/utils/labels.ts`: Mapeos y helpers para etiquetas/formatos legibles.
- `src/utils/policies/vacations.ts`: Validadores y cálculos de políticas de vacaciones (días, consecutivos, anticipación).
- `src/config/policies.ts`: Config del lado cliente para políticas soportadas y niveles.
- `src/types/index.ts`: Tipos TS (User, Request, Notification, Policy, etc.).

## API cliente
- `src/services/api.ts`:
  - Base: `VITE_API_URL`. Lanza error si no está configurado.
  - Métodos: `login`, `getUsers/createUser/updateUser`, `getRequests/createRequest/updateRequestStatus/updateRequestStage/deleteRequest`, `getNotifications/addNotification`, `getPolicies/updatePolicy`.
  - Implementación: wrapper `http()` con `fetch`, JSON y manejo de errores simples.

## Componentes estructurales
- `src/components/Layout.tsx`: Layout principal con `Sidebar`, `Header` y `Outlet`.
- `src/components/Protected/Protected.tsx`: Redirige a `/login` si no autenticado.
- `src/components/Header.tsx` y `src/components/Sidebar.tsx`: Navegación y acciones comunes.
- `src/components/NavLink.tsx`: Link de navegación con estado activo.

## Vistas y flujos
- `src/components/Dashboard.tsx`: Resumen del usuario, KPIs básicos.
- `src/components/ProfileView.tsx` y `src/components/ProfileModal.tsx`: Perfil y edición rápida.
- `src/components/CalendarView.tsx`: Calendario de eventos/solicitudes.
- `src/components/ApprovalsView.tsx`: Aprobaciones por rol/etapa.
- `src/components/TeamView.tsx`: Equipo y asignaciones por departamento.
- `src/components/EmployeesManagement.tsx`: Gestión de empleados (alta/edición/listado).
- `src/components/ReportsView.tsx`: Reportes.
- `src/components/LoginForm.tsx`: Acceso.

## Dashboards por rol
- `src/components/dashboards/EmployeeDashboard.tsx`, `HRDashboard.tsx`, `SupervisorDashboard.tsx`, `DirectorDashboard.tsx`:
  - Vistas específicas por rol para KPIs y acciones prioritarias.

## Directorio `director`
- `src/components/director/ExecutiveReports.tsx` y `AnalyticsView.tsx`: Reportes ejecutivos y analítica.

## Datos de ejemplo
- `src/data/mockData.ts`: Usuarios/solicitudes de ejemplo para modo sin API.
- `src/data/departments.ts`: Catálogo de departamentos/posiciones de ejemplo.

## Variables de entorno relevantes
- `VITE_API_URL`: URL base del backend. Si no está presente, el frontend usa modo mock para `login` y datos.

