# Sistema de Gestión de Tickets de Soporte

Proyecto full stack con frontend y backend usando:
- Node.js + TypeScript
- Express.js
- Prisma ORM + SQLite
- React + Vite

> Si luego quieres, puedes cambiar SQLite por PostgreSQL ajustando `provider` y `DATABASE_URL` en Prisma.

## Estructura

- `backend/`: API REST
- `frontend/`: interfaz web

## Funcionalidades

- Registro e inicio de sesión con JWT
- Roles: `USER` y `TECHNICIAN`
- Crear, listar y ver detalle de tickets
- Cambiar estado y prioridad (solo técnicos)
- Agregar comentarios
- Gestión de categorías

## Cómo ejecutarlo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

### 3. Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Credenciales de prueba

Después de correr el seed:

### Técnico
- Email: `tech@demo.com`
- Password: `123456`

### Usuario
- Email: `user@demo.com`
- Password: `123456`

## API base

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Endpoints principales

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Categorías
- `GET /api/categories`
- `POST /api/categories` _(solo TECHNICIAN)_

### Tickets
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `POST /api/tickets`
- `PATCH /api/tickets/:id` _(solo TECHNICIAN)_

### Comentarios
- `POST /api/tickets/:id/comments`


