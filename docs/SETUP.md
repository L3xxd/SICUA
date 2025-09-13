# Puesta en marcha en otro equipo

Esta guía explica cómo clonar, configurar y correr el proyecto (frontend + backend) y cómo manejar la base de datos con Prisma.

## Requisitos
- Node.js 18+
- npm 9+

## 1) Clonar el repositorio
```
git clone <URL_DEL_REPO>
cd sicua
```

## 2) Variables de entorno
- Frontend: crear `.env` en la raíz con la URL del API.
```
# .env (raíz)
VITE_API_URL=http://localhost:3001
```
- Backend: crear `server/.env` con la base de datos (SQLite por defecto) y puerto opcional.
```
# server/.env
DATABASE_URL="file:./dev.db"
PORT=3001
```

## 3) Instalar dependencias
```
# Frontend
npm install

# Backend
cd server
npm install
```

## 4) Base de datos
El proyecto usa Prisma con SQLite por defecto.
Tienes dos opciones:

- Opción A: recrear la BD desde el esquema y seed (recomendado)
```
cd server
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

- Opción B: usar el archivo `server/prisma/dev.db` versionado
Si el archivo está en el repo, bastará con tener `DATABASE_URL=file:./dev.db`. Aun así, ejecuta `npm run prisma:generate` para el cliente de Prisma.

## 5) Levantar los servicios
```
# Backend
cd server
npm run dev
# API en http://localhost:3001

# Frontend (otra terminal en la raíz del repo)
npm run dev
# Vite en http://localhost:5173
```

## Producción / despliegue
- Considera usar Postgres en producción. Cambia `datasource db` en `server/prisma/schema.prisma`, ajusta `DATABASE_URL` y corre migraciones.
- No subas `.env` a GitHub. Define secrets en el proveedor (Railway/Render/VPS/GitHub Actions).

## Notas
- Si `api.ts` lanza "API not configured", revisa `VITE_API_URL`.
- Si cambias el esquema Prisma, ejecuta de nuevo `npm run prisma:generate` y `npm run prisma:migrate`.
