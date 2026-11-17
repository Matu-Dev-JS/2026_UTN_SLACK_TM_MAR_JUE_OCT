/*
Configuracion de la documentacion con Swagger UI (OpenAPI 3.1)

swagger-jsdoc arma el spec leyendo los comentarios "@openapi" que estan
arriba de cada ruta en la carpeta ../routes (ver archivos .router.js).
Las respuestas y ejemplos documentados son los que produce realmente
el codigo (controllers, services y middlewares), no casos inventados.

- UI:    GET /api/docs
- Spec:  GET /api/docs/openapi.json
*/

import path from 'path'
import { fileURLToPath } from 'url'
import swaggerJSDoc from 'swagger-jsdoc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/*
Definicion base del spec: info, servers, tags y COMPONENTES REUTILIZABLES
(schemas, responses y securitySchemes que comparten todos los endpoints).
*/
const openapiDefinition = {
    openapi: '3.1.0',

    info: {
        title: 'API Slack - UTN PWA',
        version: '1.0.0',
        description:
            'API REST estilo Slack (espacios de trabajo, membresias y autenticacion).\n\n' +
            '**Formato de respuesta uniforme**\n\n' +
            'Toda respuesta (exitosa o de error) viaja en JSON con este sobre:\n\n' +
            '- Exito: `{ ok: true, status, message, data? }`\n' +
            '- Error: `{ ok: false, status, message }`\n\n' +
            'Los errores inesperados se centralizan en el middleware de errores y responden ' +
            '`{ ok: false, status: 500, message: "Internal server error" }`. ' +
            'Si MongoDB no esta disponible se responde 503 con `{ message: "No se pudo conectar a la base de datos" }`.\n\n' +
            '**Autenticacion**: JWT Bearer en el header `Authorization: bearer <token>`. ' +
            'El token se obtiene de `POST /api/auth/login` y no expira.'
    },

    servers: [
        {
            url: 'http://localhost:8080',
            description: 'Servidor local'
        }
        // Agregar aca la URL de produccion (Vercel) cuando exista
    ],

    tags: [
        {
            name: 'Auth',
            description: 'Registro, login, verificacion de email y restablecimiento de contrasena (endpoints publicos)'
        },
        {
            name: 'Users',
            description: 'Consultas de usuarios'
        },
        {
            name: 'Workspaces',
            description: 'Espacios de trabajo y sus membresias (requieren JWT Bearer)'
        }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description:
                    'Enviar el token devuelto por POST /api/auth/login. ' +
                    'El backend lee el header `Authorization` y toma la segunda parte (el token), ' +
                    'el prefijo "bearer"/"Bearer" no distingue mayusculas.'
            }
        },

        schemas: {
            /* ---------- Sobre de respuesta ---------- */
            MessageResponse: {
                type: 'object',
                properties: {
                    ok: { type: 'boolean', description: 'Indica si la operacion fue exitosa' },
                    status: { type: 'integer', description: 'Codigo HTTP de la respuesta' },
                    message: { type: 'string', description: 'Mensaje descriptivo del resultado' }
                },
                required: ['ok', 'status', 'message']
            },

            ErrorResponse: {
                type: 'object',
                properties: {
                    ok: { type: 'boolean', example: false },
                    status: { type: 'integer', description: 'Codigo HTTP del error' },
                    message: { type: 'string', description: 'Mensaje del error' }
                },
                required: ['ok', 'status', 'message']
            },

            /* ---------- Modelos de negocio ---------- */
            User: {
                type: 'object',
                description: 'Documento de usuario tal como esta guardado en MongoDB',
                properties: {
                    _id: { type: 'string', description: 'Id del usuario (ObjectId de MongoDB)' },
                    nombre: { type: 'string', example: 'maria' },
                    email: { type: 'string', format: 'email', example: 'maria@mail.com' },
                    password: { type: 'string', description: 'Hash bcrypt de la contrasena (se guarda encriptado)' },
                    fecha_creacion: { type: 'string', format: 'date-time' },
                    activo: { type: 'boolean', description: 'Baja logica del usuario' },
                    email_verificado: { type: 'boolean', description: 'true luego de verificar el email' }
                },
                required: ['_id', 'nombre', 'email', 'password', 'fecha_creacion', 'activo', 'email_verificado']
            },

            Workspace: {
                type: 'object',
                description: 'Documento de espacio de trabajo (coleccion EspacioTrabajo)',
                properties: {
                    _id: { type: 'string', description: 'Id del workspace (ObjectId de MongoDB)' },
                    nombre: { type: 'string', maxLength: 30, example: 'Proyecto UTN' },
                    description: { type: 'string', maxLength: 200, example: 'Espacio para el proyecto de la materia' },
                    fecha_creacion: { type: 'string', format: 'date-time' }
                },
                required: ['_id', 'nombre', 'fecha_creacion']
            },

            Membership: {
                type: 'object',
                description: 'Documento de membresia (coleccion Miembro)',
                properties: {
                    _id: { type: 'string' },
                    fk_id_usuario: { type: 'string', description: 'Id del usuario miembro' },
                    fk_id_espacio_trabajo: { type: 'string', description: 'Id del workspace' },
                    rol: {
                        type: 'string',
                        enum: ['user', 'admin', 'owner'],
                        description: 'owner: control total; admin: puede actualizar el workspace; user: solo lectura'
                    },
                    fecha_creacion: { type: 'string', format: 'date-time' },
                    activo: { type: 'boolean' }
                },
                required: ['_id', 'fk_id_usuario', 'fk_id_espacio_trabajo', 'rol', 'fecha_creacion', 'activo']
            },

            /* ---------- Formatos proyectados por los repositories ---------- */
            WorkspaceListItem: {
                type: 'object',
                description: 'Membresia del usuario + workspace con su lista de miembros',
                properties: {
                    member_id: { type: 'string', description: 'Id de la membresia del usuario' },
                    member_rol: { type: 'string', enum: ['user', 'admin', 'owner'] },
                    workspace_id: { type: 'string' },
                    workspace_nombre: { type: 'string' },
                    workspace_fecha_creacion: { type: 'string', format: 'date-time' },
                    members: {
                        type: 'array',
                        description: 'Lista de miembros de ese workspace',
                        items: { $ref: '#/components/schemas/MemberListItem' }
                    }
                },
                required: ['member_id', 'member_rol', 'workspace_id', 'workspace_nombre', 'workspace_fecha_creacion', 'members']
            },

            MemberListItem: {
                type: 'object',
                description: 'Membresia proyectada (id, nombre y rol del miembro)',
                properties: {
                    member_id: { type: 'string' },
                    member_nombre: { type: 'string' },
                    member_rol: { type: 'string', enum: ['user', 'admin', 'owner'] }
                },
                required: ['member_id', 'member_nombre', 'member_rol']
            }
        },

        responses: {
            /* Respuestas de error reutilizables con los mensajes reales del backend */
            BadRequest400: {
                description: 'Datos invalidos o faltantes. El mensaje indica el motivo concreto.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        examples: {
                            campos_requeridos: {
                                summary: 'Faltan campos requeridos',
                                value: { ok: false, status: 400, message: 'Email, password and username is required' }
                            },
                            formato_invalido: {
                                summary: 'Formato invalido',
                                value: { ok: false, status: 400, message: 'Email is incorrect' }
                            },
                            auth_header_faltante: {
                                summary: 'Header Authorization ausente (endpoints protegidos)',
                                value: { ok: false, status: 400, message: 'Auth header is requered' }
                            },
                            auth_header_malformado: {
                                summary: 'Header Authorization sin token (endpoints protegidos)',
                                value: { ok: false, status: 400, message: 'Auth header is malformed' }
                            }
                        }
                    }
                }
            },

            Unauthorized401: {
                description: 'Credenciales invalidas o token de sesion invalido.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        examples: {
                            credenciales_invalidas: {
                                summary: 'Email o contrasena incorrectos',
                                value: { ok: false, status: 401, message: 'Invalid email or password' }
                            },
                            token_invalido: {
                                summary: 'Token de sesion invalido o expirado',
                                value: { ok: false, status: 401, message: 'Auth token is invalid!' }
                            }
                        }
                    }
                }
            },

            Forbidden403: {
                description: 'El usuario autenticado no tiene permisos para esta operacion.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        examples: {
                            sin_membresia: {
                                summary: 'No es miembro del workspace',
                                value: { ok: false, status: 403, message: 'No eres miembro de este espacio de trabajo' }
                            },
                            rol_insuficiente: {
                                summary: 'Rol insuficiente (se requiere owner o owner/admin)',
                                value: { ok: false, status: 403, message: 'No tienes permisos suficientes para hacer esta operacion' }
                            },
                            email_no_verificado: {
                                summary: 'Cuenta sin verificar (solo login)',
                                value: { ok: false, status: 403, message: 'Email no verificado' }
                            },
                            usuario_desactivado: {
                                summary: 'Cuenta desactivada',
                                value: {
                                    ok: false,
                                    status: 403,
                                    message: 'Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error'
                                }
                            }
                        }
                    }
                }
            },

            NotFound404: {
                description: 'El recurso solicitado no existe.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        examples: {
                            usuario: {
                                summary: 'Usuario inexistente',
                                value: { ok: false, status: 404, message: 'User not found' }
                            },
                            workspace: {
                                summary: 'Workspace inexistente',
                                value: { ok: false, status: 404, message: 'Workspace no encontrado' }
                            }
                        }
                    }
                }
            },

            ServerError500: {
                description: 'Error inesperado del servidor.',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: { ok: false, status: 500, message: 'Internal server error' }
                    }
                }
            },

            ServiceUnavailable503: {
                description: 'No se pudo conectar a MongoDB (el error viaja sin el sobre ok/status).',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' }
                            }
                        },
                        example: { message: 'No se pudo conectar a la base de datos' }
                    }
                }
            }
        }
    }
}

/*
Se arma el spec completo: la definicion base + los "@openapi" de los routers.
Se resuelve la carpeta de routes con import.meta.url para que funcione
igual en local y en Vercel (sin depender del process.cwd()).
La libreria `glob` exige separadores "/" (falla con backslashes de Windows),
por eso se normaliza el path.
*/
const routesGlob = path
    .join(__dirname, '..', 'routes', '*.js')
    .split(path.sep)
    .join('/')

const openapiSpec = swaggerJSDoc({
    definition: openapiDefinition,
    apis: [routesGlob]
})

export default openapiSpec
