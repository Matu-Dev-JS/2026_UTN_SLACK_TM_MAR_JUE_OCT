# Documentación del Backend — API de Espacios de Trabajo (estilo Slack)

> Documentación de alcance, rutas, endpoints y middlewares del proyecto.
> Última actualización: Noviembre 2026.

---

## 1. Alcance del proyecto

El backend implementa una **API REST** que da soporte a una aplicación de mensajería y colaboración tipo **Slack**, permitiendo gestionar usuarios, espacios de trabajo (workspaces), membresías y canales.

Funcionalidades cubiertas actualmente:

- **Autenticación y cuenta de usuario**
  - Registro de usuarios con contraseña encriptada (bcrypt).
  - Inicio de sesión basado en **JWT** (JsonWebTokens firmados con HS256).
  - Verificación de email por token (link enviado por mail con Nodemailer).
  - Reenvío del mail de verificación.
  - Restablecimiento de contraseña (olvidé mi contraseña → token → nueva contraseña).
- **Gestión de espacios de trabajo (workspaces)**
  - Listado de workspaces según las membresías del usuario autenticado.
  - Creación de workspaces (el creador queda como miembro con rol `owner`).
  - Obtención de un workspace por id.
  - Listado de miembros (membresías) de un workspace.
  - Actualización de nombre/descripción (restringido a `owner` y `admin`).
  - Eliminación de workspace y sus membresías (restringido a `owner`).
- **Endpoints de usuarios** (consulta de usuarios registrados).

Funcionalidades **planificadas / en desarrollo** (no implementadas aún):

- Invitación de miembros por email (`POST /api/workspaces/:workspace_id/members/invite`).
- Aceptación de invitación por token (`GET /api/workspaces/:workspace_id/members/accept-invite/:invitation_token`).
- Eliminación de miembros (`DELETE /api/workspaces/:workspace_id/members/:member_id`).
- Módulo de **canales y mensajes** (existen modelos `channel`, `channelMessage` y `directMessage`, y un router de channels con un endpoint de prueba que **no está montado** en la app).

### Stack tecnológico

| Componente | Tecnología |
|---|---|
| Runtime | Node.js (módulos ES, `type: module`) |
| Framework HTTP | Express 5 |
| Base de datos | MongoDB (Mongoose) — también existe config para MySQL (mysql2) |
| Autenticación | JWT (`jsonwebtoken`) |
| Encriptación | `bcrypt` |
| Emails | `nodemailer` (cuenta Gmail) |
| CORS | `cors` |
| Configuración | `dotenv` (variables en `.env`) |
| Deploy | `vercel.json` incluido para despliegue en Vercel |

### Arquitectura (en capas)

```
src/
├── main.js                  → Punto de entrada: configura Express, middlewares globales y monta los routers
├── config/                  → Conexiones (mongo, mysql, mailer) y variables de entorno
├── routes/                  → Definición de rutas y aplicación de middlewares por endpoint
├── controllers/             → Capa HTTP: leen el request, delegan en servicios y arman la response
├── services/                → Lógica de negocio (validaciones, tokens, envío de mails)
├── repositories/            → Acceso a datos (queries a MongoDB vía Mongoose)
├── models/                  → Esquemas de Mongoose: user, workspace, member, channel, channelMessage, directMessage
├── middlewares/             → auth, workspace (autorización por rol) y errorHandler centralizado
├── dto/                     → Objetos de transferencia de datos (user.dto.js)
└── utils/                   → Helpers: ServerError, bcrypt, plantillas de email
```

---

## 2. Middlewares

### Middlewares globales (aplican a TODOS los endpoints)

Definidos en `src/main.js`, se ejecutan en este orden para cualquier request:

| Orden | Middleware | Descripción |
|---|---|---|
| 1 | `cors()` | Habilita Cross-Origin Resource Sharing para cualquier origen. |
| 2 | `express.json()` | Parsea el body JSON de las requests (permite leer `request.body`). |
| 3 | Conexión MongoDB (inline) | Antes de cada request intenta `connectMongoDB()`. Si falla responde `503 { message: "No se pudo conectar a la base de datos" }` y no continúa. |
| 4 | `errorHandlerMiddleware` | Último en la cadena: captura cualquier error lanzado con `next(error)` o `throw` en controllers/middlewares. Si el error tiene `status` (un `ServerError` esperable) responde con ese código y su mensaje; si no, loguea y responde `500 { ok:false, message: "Internal server error" }`. |

### Middlewares por endpoint

**`authMiddleware`** (`src/middlewares/auth.middleware.js`) — *Autenticación*

- Exige el header `Authorization` (formato `Bearer <token>`): si falta o está mal formado responde `400`.
- Verifica el JWT con `JWT_SECRET_KEY`; si el token es inválido, mal firmado, "del futuro" o expirado responde `401`.
- Si es válido, inyecta `request.user = { id, name, email }` para que los controllers sepan quién consulta.

**`workspaceMiddleware(valid_roles)`** (`src/middlewares/workspace.middleware.js`) — *Autorización sobre un workspace*

- Middleware factory: recibe un array de roles permitidos (ej. `['owner']`, `['owner','admin']` o `[]` para "todos").
- Valida que:
  1. El workspace exista → si no, `404 "Workspace no encontrado"`.
  2. El usuario autenticado tenga membresía en ese workspace → si no, `403 "No eres miembro de este espacio de trabajo"`.
  3. Si `valid_roles` no está vacío, el rol de la membresía (`owner` | `admin` | `user`) esté en la lista → si no, `403 "No tienes permisos suficientes para hacer esta operacion"`.
- Si todo pasa, inyecta `request.workspace` (el documento del workspace) para el controller.

> ⚠️ Nota: este middleware se usa **siempre después** de `authMiddleware`, porque depende de `request.user`.

---

## 3. Rutas montadas

En `src/main.js` se montan tres routers bajo el prefijo `/api`:

| Prefijo | Router | Archivo |
|---|---|---|
| `/api/auth` | `auth_router` | `src/routes/auth.router.js` |
| `/api/users` | `user_router` | `src/routes/user.router.js` |
| `/api/workspaces` | `workspace_router` | `src/routes/workspace.router.js` |

> `src/routes/channels.router.js` existe (con `mergeParams: true` y un endpoint de prueba) pero **no está montado**: el `workspace_router.use('/:workspace_id/channels', channel_router)` está comentado en `workspace.router.js`.

---

## 4. Endpoints

Leyenda de middlewares: 🌐 = globales (cors, json, mongo, errorHandler) · 🔐 = `authMiddleware` · 🏢 = `workspaceMiddleware(roles)`

### 4.1 `/api/auth` — Autenticación (públicos, sin authMiddleware)

| Método | Ruta | Middlewares (además de los globales) | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | 🌐 | Registra un nuevo usuario. Valida email y datos, encripta la contraseña con bcrypt y envía un mail de verificación con un token JWT de 7 días. Responde `201`. |
| `POST` | `/api/auth/login` | 🌐 | Inicia sesión. Valida email + contraseña y devuelve un `auth_token` (JWT firmado) para usar en el header `Authorization: Bearer <token>` del resto de la API. Responde `200` con `data.auth_token`. |
| `GET` | `/api/auth/verify-email` | 🌐 | Verifica el email de un usuario. Recibe `?verification_token=...` por querystring (viene del link del mail que apunta al frontend) y marca la cuenta como verificada. |
| `GET` | `/api/auth/verify-email/:email/resend` | 🌐 | Reenvía el mail de verificación. Recibe el email por path param; regenera el token y reenvía el mail. Responde siempre con mensaje genérico (no revela si la cuenta existe). |
| `POST` | `/api/auth/forgot-password` | 🌐 | Paso 1 del restablecimiento de contraseña. Recibe `email` en el body y envía un mail con un link (al frontend) que contiene un `reset_token`. Respuesta genérica por seguridad. |
| `POST` | `/api/auth/reset-password` | 🌐 | Paso 2 del restablecimiento. Recibe `reset_token` y `password` en el body; valida el token, busca al usuario y guarda la nueva contraseña encriptada. |

### 4.2 `/api/users` — Usuarios (públicos, sin authMiddleware)

| Método | Ruta | Middlewares (además de los globales) | Descripción |
|---|---|---|---|
| `GET` | `/api/users` | 🌐 | Devuelve la lista de todos los usuarios registrados (`data.users`). |
| `GET` | `/api/users/:user_id` | 🌐 | Devuelve los datos de un usuario por su id (`data.user`). Si no existe responde `404 "User not found"`. |

### 4.3 `/api/workspaces` — Espacios de trabajo (protegidos)

| Método | Ruta | Middlewares (además de los globales) | Descripción |
|---|---|---|---|
| `GET` | `/api/workspaces` | 🔐 | Devuelve todos los workspaces asociados al usuario autenticado (sus membresías), incluyendo el rol de cada membresía. |
| `POST` | `/api/workspaces` | 🔐 | Crea un nuevo workspace con `name` y `description` del body, y genera automáticamente la membresía con rol `owner` para el usuario autenticado. Responde `201`. |
| `GET` | `/api/workspaces/:workspace_id` | 🔐 🏢(`[]` = cualquier miembro) | Devuelve los datos del workspace indicado. Solo accesible para miembros del workspace. |
| `GET` | `/api/workspaces/:workspace_id/members` | 🔐 🏢(`[]` = cualquier miembro) | Devuelve la lista de miembros (membresías) del workspace. |
| `PUT` | `/api/workspaces/:workspace_id` | 🔐 🏢(`['owner','admin']`) | Actualiza `name` y/o `description` del workspace. Solo `owner` o `admin`. |
| `DELETE` | `/api/workspaces/:workspace_id` | 🔐 🏢(`['owner']`) | Elimina el workspace y todas sus membresías asociadas. Solo `owner`. |

### 4.4 Endpoints planificados (aún no implementados)

Definidos como tarea en `workspace.router.js`:

- `(owner, admin)` `DELETE /api/workspaces/:workspace_id/members/:member_id` — quitar un miembro del workspace.
- `(owner, admin)` `POST /api/workspaces/:workspace_id/members/invite` — invitar por email (rol `admin` o `user`, validar que el usuario exista, que no tenga ya membresía, crear membresía con `invitacion_aceptada: false` y enviar mail con link + token con expiración).
- `(público)` `GET /api/workspaces/:workspace_id/members/accept-invite/:invitation_token` — valida el token de invitación y marca la membresía como aceptada.
- Módulo de canales (`channels.router.js` ya tiene un endpoint de prueba `GET /:workspace_id/channels` sin montar).

---

## 5. Códigos de respuesta comunes

| Código | Significado | Cuándo ocurre |
|---|---|---|
| `200` | OK | Consultas y actualizaciones exitosas. |
| `201` | Created | Registro de usuario y creación de workspace. |
| `400` | Bad Request | Datos faltantes/inválidos (ej. email inválido, header Authorization ausente o malformado). |
| `401` | Unauthorized | Token JWT inválido o expirado. |
| `403` | Forbidden | El usuario no es miembro del workspace o su rol no alcanza para la operación. |
| `404` | Not Found | Usuario o workspace inexistente. |
| `500` | Internal Server Error | Error inesperado no controlado (manejado por `errorHandlerMiddleware`). |
| `503` | Service Unavailable | Fallo de conexión con MongoDB antes de procesar el request. |

---

## 6. Cómo correr el proyecto

```bash
npm install
npm run dev    # modo desarrollo con --watch
npm start      # producción
```

Variables de entorno requeridas en `.env` (ver `src/config/environment.config.js`): `MONGO_DB_URI`, `MONGO_DB_NAME`, `JWT_SECRET_KEY`, `GMAIL_USER`, `GMAIL_PASSWORD`, `URL_BACKEND`, `URL_FRONTEND`, `PORT` (y opcionalmente las de MySQL).
