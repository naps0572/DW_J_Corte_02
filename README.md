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

## Cambios en esta versión

### Bugs corregidos
1. **Error HTTP incorrecto**: El middleware de errores devolvía 500 para errores de negocio (ticket no encontrado, sin permisos). Ahora devuelve 404 o 403 correctamente.
2. **Vulnerabilidad de seguridad**: El registro permitía que el cliente enviara `role: TECHNICIAN` y escalara privilegios. Ahora el rol siempre es `USER` en el registro.
3. **Bug Prisma `updateTicket`**: El spread de los datos de Zod dejaba campos `undefined`, lo que impedía que `technicianId: null` funcionara para desasignar un técnico. Ahora se construye el objeto de actualización explícitamente.
4. **Bug React `useEffect`**: `loadTicket` en `TicketDetailPage` no estaba en el array de dependencias. Convertido a `useCallback` y añadido correctamente.

### Mejoras
- Etiquetas de estado y prioridad en español con badges de colores
- Indicador de carga en el dashboard
- Columna de fecha en la tabla de tickets
- Comentarios del técnico destacados visualmente
- `select` del técnico con etiquetas en español en el formulario de actualización
