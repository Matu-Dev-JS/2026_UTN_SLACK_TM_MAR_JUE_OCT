Trabajo integrador final (Full-Stack: React + Express)
Objetivo: desarrollar una aplicación web completa (Frontend en React + Backend en Express) cuyo dominio/tema queda a elección del alumno (por ejemplo: agenda de tareas, reservas de canchas, gestor de eventos, catálogo de libros, sistema de seguimiento de hábitos, etc.). Lo importante es que la app implemente un CRUD real, un sistema de autenticación seguro (hashing + JWT + verificación de e-mail) y respete una arquitectura en capas (routes → controllers → services → repositories). Se exige entrega de repositorios separados o dentro de uno (frontend y backend) y despliegue público de ambos.

Requisitos técnicos obligatorios 
Frontend: React (CRA / Vite ) — UI responsiva (2000px a 320px) y clara, integración total con la API.

Backend: Node.js + Express.

Base de datos: MongoDB o MySQL.

Arquitectura: carpetas routes/, controllers/, services/, repositories/. Los controllers con logica de manejo de request/response; la lógica va en services; el acceso a BD en repositorios.

Middlewares obligatorios: CORS, validación de input, manejo centralizado de errores, middleware de autenticación JWT.

Seguridad:

Hash de contraseñas con bcrypt.

JWT para autenticación (Bearer token). Tokens con expiración.

Verificación por correo electrónico: al registrarse, el usuario recibe un token/link de activación. Debe existir endpoint para verificar.

Variables de entorno con dotenv.

Envío de emails: usar nodemailer.

Documentación: README completo + Postman collection.

Lo que debe poder hacer la aplicación (funcional)
Gestionar una entidad principal a elección del alumno (p. ej. eventos, tareas, reservas, posts, productos digitales, libros, etc.) con CRUD completo.

Gestionar al menos otra entidad relacionada (p. ej. categorías, usuarios, salas, etiquetas) y modelar la relación (FK o ref + populate).

Registro de usuarios + verificación por correo + login que devuelve JWT.

Rutas sensibles (crear/editar/eliminar) protegidas por JWT.

El frontend implementa pantallas para registro/login, listado, detalle, crear/editar/borrar de la entidad principal y la entidad relacionada.

Entregables (obligatorios)
Repo Backend (GitHub)

Código completo, README.md.

Documentación de endpoints  en el README.md.

Repo Frontend (GitHub)

Código completo, README.md.

Despliegues públicos

URL del backend desplegado (API).

URL del frontend desplegado (Web).