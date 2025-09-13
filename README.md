# SICUA – Sistema de Control de Usuarios y Administración

Aplicación full‑stack (Vite + React + TypeScript + Tailwind en el frontend; Express + Prisma en el backend) para gestión de usuarios, solicitudes y políticas.

## Quick Start
```
# 1) Variables de entorno
echo 'VITE_API_URL=http://localhost:3001' > .env
mkdir -p server && echo 'DATABASE_URL="file:./dev.db"\nPORT=3001' > server/.env

# 2) Instalar dependencias
npm install && (cd server && npm install)

# 3) Base de datos (una sola vez)
cd server && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed && cd ..

# 4) Levantar backend y frontend
(cd server && npm run dev) &
npm run dev
```

También puedes usar el script automatizado:
```
# Configura envs, instala dependencias, genera Prisma, migra y seed
npm run setup

# Inicia backend y frontend juntos con logs prefijados
npm run dev:all
```

## Build y producción rápidos
```
# Compilar frontend y backend (incluye prisma:generate antes del build del server)
npm run build:all

# Arrancar ambos en modo producción (server start + vite preview)
npm run start:all
```
Nota: asegúrate de que `.env` tenga `VITE_API_URL` apuntando al backend correcto antes de construir el frontend.

## Requisitos
- Node.js 18+
- npm 9+

## Estructura
- Frontend (Vite): raíz del repo
  - Punto de entrada: `src/main.tsx`
  - App: `src/App.tsx`
  - Arquitectura por dominios:
    - `src/app/`
      - `layout/`: Layout, Header, Sidebar, Footer
      - `providers/`: Contextos de app (`AuthContext`, `AppContext`)
    - `src/features/`
      - `auth/`: `LoginPage`, `Protected`
      - `dashboard/`: `Dashboard` + `dashboards/` por rol
      - `requests/`, `approvals/`, `calendar/`, `team/`, `users/`, `reports/`, `director/`, `policies/`
    - `src/shared/`
      - `services/`: `api.ts`
      - `utils/`: helpers (incluye `policies/vacations.ts` y `labels.ts`)
      - `data/`: `mockData.ts`, `departments.ts`
      - `components/`: piezas reutilizables
- Backend (Express + Prisma): `server/`
  - Servidor: `server/src/index.ts`
  - Prisma schema: `server/prisma/schema.prisma`
  - DB local por defecto: SQLite `server/prisma/dev.db`
  - Seed: `server/prisma/seed.ts`

## Variables de entorno
- Frontend (`.env` en la raíz):
```
VITE_API_URL=http://localhost:3001
```
- Backend (`server/.env`):
```
DATABASE_URL="file:./dev.db"
PORT=3001
```

## Instalación
```bash
# En la raíz (frontend)
npm install

# Backend
cd server
npm install
```

## Base de datos (Prisma + SQLite por defecto)
Opción A – Re-crear BD desde esquema y seed (recomendada):
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```
Opción B – Usar `server/prisma/dev.db` versionado:
- Asegura `DATABASE_URL=file:./dev.db` en `server/.env`.
- Ejecuta: `cd server && npm run prisma:generate`.

## Desarrollo – Ejecutar servicios
Backend:
```bash
cd server
npm run dev     # http://localhost:3001
```
Frontend (otra terminal en la raíz):
```bash
npm run dev     # http://localhost:5173
```

## Scripts backend útiles (`server/package.json`)
- `npm run dev`: servidor en desarrollo con tsx
- `npm run build && npm start`: build TypeScript y ejecutar JS
- `npm run prisma:generate`: generar cliente de Prisma
- `npm run prisma:migrate`: aplicar migraciones (dev) y crear una nueva si hace falta
- `npm run prisma:seed`: popular datos iniciales

## Comandos frecuentes
- Iniciar backend: `cd server && npm run dev`
- Iniciar frontend: `npm run dev`
- Regenerar cliente Prisma: `cd server && npm run prisma:generate`
- Aplicar migraciones y seed: `cd server && npm run prisma:migrate && npm run prisma:seed`
- Build backend prod: `cd server && npm run build && npm start`

## Producción / despliegue
- DB recomendada: Postgres.
  - Cambia `datasource db` en `server/prisma/schema.prisma` a `provider = "postgresql"`.
  - Ajusta `DATABASE_URL` en `server/.env` o variables del entorno del proveedor.
  - Ejecuta migraciones en el entorno destino.
- No subas archivos `.env` a GitHub. Usa secretos del proveedor (Railway/Render/Vercel/VPS).
- Construcción backend:
```bash
cd server
npm run build
npm start
```
- Frontend: usa `npm run build` en la raíz si necesitas un artefacto de producción (sirve los estáticos con tu servidor preferido y `VITE_API_URL` apuntando al backend).

## Solución de problemas
- Error "API not configured" en `src/services/api.ts`: revisa que `.env` tenga `VITE_API_URL` y reinicia Vite.
- Cambios en Prisma: vuelve a ejecutar `npm run prisma:generate` y `npm run prisma:migrate`.
- Puertos en uso: cambia `PORT` en `server/.env` o detén procesos previos.

## Documentación
- Setup detallado: `docs/SETUP.md:1`
- Cambios recientes (Footer incluido en Layout y Login): `docs/CHANGELOG.md:1`

## Créditos
- © {AÑO_ACTUAL} Alejandro Balderas Rios, Citlalli Perez Teller y Cristofer Castro Alvares. Todos los derechos reservados.
