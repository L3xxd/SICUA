# Changelog

## 2025-09-13

- Add: Componente `Footer` global (`src/components/Footer.tsx`) con aviso de derechos de autor para Alejandro Balderas Rios, Citlalli Perez Teller y Cristofer Castro Alvares. Incluye año actual dinámico y estilos base (borde superior, fondo blanco).
- Update: Inclusión del `Footer` en el layout principal (`src/components/Layout.tsx`) para mostrarse en todas las vistas protegidas.
- Update: Inclusión del `Footer` en la pantalla de login (`src/components/LoginForm.tsx`) ajustando la estructura a `flex flex-col` y centrado del formulario con `flex-1` para mantener el footer al final.
- Fix: Se corrigió estructura JSX en `LoginForm.tsx` al cerrar el contenedor antes de renderizar `<Footer />` (error previo: "Unterminated JSX contents").
- Add: `docs/SETUP.md` con guía de instalación, variables de entorno, DB (Prisma/SQLite) y ejecución local.
- Add: `README.md` consolidando instrucciones clave de instalación, ejecución, base de datos y despliegue.
- Update: `README.md` incluye secciones "Quick Start" y "Comandos frecuentes" con comandos listos para copiar y pegar.
- Add: Scripts de automatización en la raíz:
  - `scripts/setup.mjs`: crea `.env`, instala deps, corre Prisma generate/migrate/seed.
  - `scripts/dev-all.mjs`: levanta backend y frontend en paralelo con logs prefijados.
  - Nuevos comandos npm: `npm run setup` y `npm run dev:all`.
  - `scripts/build-all.mjs`: build frontend y backend (incluye prisma:generate).
  - `scripts/start-all.mjs`: inicia backend (`npm start`) y frontend (`vite preview`) juntos.
  - Nuevos comandos npm: `npm run build:all` y `npm run start:all`.
 - Refactor: Reestructuración por dominios en `src/`.
   - `src/app/layout`: `Layout`, `Header`, `Sidebar`, `Footer` (movidos desde `src/components`).
   - `src/app/providers`: `AuthContext`, `AppContext` (movidos desde `src/context`).
   - `src/features/auth`: `LoginPage` (antes `LoginForm`), `Protected`.
   - `src/features/dashboard`: `Dashboard` y `dashboards/` por rol.
   - `src/features/*`: `requests`, `approvals`, `calendar`, `team`, `users`, `reports`, `director`, `policies`.
   - `src/shared/services/api.ts` (movido desde `src/services/api.ts`).
   - `src/shared/utils`: `labels.ts`, `policies/vacations.ts` (movidos desde `src/utils`).
   - `src/shared/data`: `mockData.ts`, `departments.ts` (movidos desde `src/data`).
   - Actualizadas rutas de importaciones y `src/App.tsx` para reflejar la nueva estructura.
