import express from 'express'
import {
    getAllWorkspaces,
    createWorkspace,
    getWorkspaceById,
    getWorkspaceMembers,
    deleteWorkspaceById,
    updateWorkspaceById
} from '../controllers/workspace.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'

const workspace_router = express.Router()

/*
(Authentified) GET /api/workspace
    Traer la lista de espacios de trabajo asocidadas a ese usuario (basicamente sus membresias), con el rol de membresia en cada espacio de trabajo
*/

/**
 * @openapi
 * /api/workspaces:
 *   get:
 *     summary: Lista los workspaces del usuario autenticado
 *     description: |
 *       Trae las membresias del usuario del token: cada item es una membresia
 *       con su rol y los datos del workspace, mas la lista de miembros de ese
 *       workspace (id, nombre y rol de cada miembro).
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membresias del usuario con los datos de cada workspace y sus miembros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspaces:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkspaceListItem'
 *             example:
 *               ok: true
 *               message: Obtenidos todos los datos
 *               status: 200
 *               data:
 *                 workspaces:
 *                   - member_id: 6aabb111190ff6061955c001
 *                     member_rol: owner
 *                     workspace_id: 6aabb222190ff6061955c002
 *                     workspace_nombre: Proyecto UTN
 *                     workspace_fecha_creacion: '2026-09-17T14:56:26.249Z'
 *                     members:
 *                       - member_id: 6aabb111190ff6061955c001
 *                         member_nombre: maria
 *                         member_rol: owner
 *                       - member_id: 6aabb333190ff6061955c003
 *                         member_nombre: pepe
 *                         member_rol: user
 *       400:
 *         description: Falta el header Authorization o esta malformado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               auth_header_faltante:
 *                 summary: Header ausente
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is requered
 *               auth_header_malformado:
 *                 summary: Header sin token
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is malformed
 *       401:
 *         description: El token de sesion es invalido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Auth token is invalid!
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
workspace_router.get('/', authMiddleware, getAllWorkspaces)

/**
 * @openapi
 * /api/workspaces:
 *   post:
 *     summary: Crea un workspace y la membresia owner del creador
 *     description: |
 *       Crea el espacio de trabajo y genera automaticamente una membresia
 *       con rol `owner` para el usuario del token. La `description` es opcional.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 30
 *                 example: Proyecto UTN
 *                 description: Nombre del workspace (se guarda como `nombre`)
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: Espacio para el proyecto de la materia
 *                 description: Descripcion opcional del workspace
 *     responses:
 *       201:
 *         description: Workspace creado con su membresia owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace_created:
 *                       $ref: '#/components/schemas/Workspace'
 *                     owner_membership:
 *                       $ref: '#/components/schemas/Membership'
 *             example:
 *               ok: true
 *               status: 201
 *               message: Por ahora todo bien
 *               data:
 *                 workspace_created:
 *                   _id: 6aabb222190ff6061955c002
 *                   nombre: Proyecto UTN
 *                   description: Espacio para el proyecto de la materia
 *                   fecha_creacion: '2026-09-17T14:56:26.249Z'
 *                 owner_membership:
 *                   _id: 6aabb111190ff6061955c001
 *                   fk_id_usuario: 6aabff9a190ff6061955c889
 *                   fk_id_espacio_trabajo: 6aabb222190ff6061955c002
 *                   rol: owner
 *                   fecha_creacion: '2026-09-17T14:56:26.249Z'
 *                   activo: false
 *       400:
 *         description: Header de auth faltante/malformado o falta el campo `name`
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               name_requerido:
 *                 summary: Falta el nombre del workspace
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: name es un campo requerido
 *               auth_header_faltante:
 *                 summary: Header Authorization ausente
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is requered
 *       401:
 *         description: El token de sesion es invalido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Auth token is invalid!
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
workspace_router.post('/', authMiddleware, createWorkspace)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   get:
 *     summary: Obtiene un workspace por id (miembros del workspace)
 *     description: |
 *       Devuelve el documento del workspace. Requiere ser miembro del
 *       workspace (cualquier rol).
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId del workspace en MongoDB
 *         example: 6aabb222190ff6061955c002
 *     responses:
 *       200:
 *         description: Workspace encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace_selected:
 *                       $ref: '#/components/schemas/Workspace'
 *             example:
 *               ok: true
 *               message: Workspace obtenido correctamente
 *               status: 200
 *               data:
 *                 workspace_selected:
 *                   _id: 6aabb222190ff6061955c002
 *                   nombre: Proyecto UTN
 *                   description: Espacio para el proyecto de la materia
 *                   fecha_creacion: '2026-09-17T14:56:26.249Z'
 *       400:
 *         description: Falta el header Authorization o esta malformado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 400
 *               message: Auth header is requered
 *       401:
 *         description: El token de sesion es invalido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Auth token is invalid!
 *       403:
 *         description: El usuario autenticado no es miembro del workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: No eres miembro de este espacio de trabajo
 *       404:
 *         description: No existe un workspace con ese id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Workspace no encontrado
 *       500:
 *         description: |
 *           Error inesperado. Si el id no tiene formato de ObjectId de MongoDB,
 *           Mongoose lanza CastError y el middleware responde 500 generico.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 500
 *               message: Internal server error
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
workspace_router.get(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceById
)

/*
(Autentified, todos) GET /api/workspaces/:workspace_id/members
    Traer la lista de miembros (membresias) asociadas a un espacio de trabajo
*/

/**
 * @openapi
 * /api/workspaces/{workspace_id}/members:
 *   get:
 *     summary: Lista los miembros del workspace
 *     description: |
 *       Devuelve la lista de membresias del workspace proyectada como
 *       (id del miembro, nombre del usuario y rol). Requiere ser miembro
 *       del workspace (cualquier rol).
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId del workspace en MongoDB
 *         example: 6aabb222190ff6061955c002
 *     responses:
 *       200:
 *         description: Lista de miembros del workspace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     members:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MemberListItem'
 *             example:
 *               ok: true
 *               message: Miembros obtenidos correctamente
 *               status: 200
 *               data:
 *                 members:
 *                   - member_id: 6aabb111190ff6061955c001
 *                     member_nombre: maria
 *                     member_rol: owner
 *                   - member_id: 6aabb333190ff6061955c003
 *                     member_nombre: pepe
 *                     member_rol: user
 *       400:
 *         description: Falta el header Authorization o esta malformado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 400
 *               message: Auth header is requered
 *       401:
 *         description: El token de sesion es invalido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Auth token is invalid!
 *       403:
 *         description: El usuario autenticado no es miembro del workspace
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: No eres miembro de este espacio de trabajo
 *       404:
 *         description: No existe un workspace con ese id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Workspace no encontrado
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
workspace_router.get(
    '/:workspace_id/members',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceMembers
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   delete:
 *     summary: Elimina el workspace y todas sus membresias
 *     description: |
 *       Elimina el workspace y TODAS las membresias asociadas (borrado fisico).
 *       Requiere rol `owner` en ese workspace. Devuelve el workspace eliminado.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId del workspace en MongoDB
 *         example: 6aabb222190ff6061955c002
 *     responses:
 *       200:
 *         description: Workspace eliminado (devuelve el documento eliminado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace_deleted:
 *                       $ref: '#/components/schemas/Workspace'
 *             example:
 *               ok: true
 *               message: Workspace eliminado correctamente
 *               status: 200
 *               data:
 *                 workspace_deleted:
 *                   _id: 6aabb222190ff6061955c002
 *                   nombre: Proyecto UTN
 *                   description: Espacio para el proyecto de la materia
 *                   fecha_creacion: '2026-09-17T14:56:26.249Z'
 *       400:
 *         description: Falta el header Authorization o esta malformado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 400
 *               message: Auth header is requered
 *       401:
 *         description: El token de sesion es invalido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Auth token is invalid!
 *       403:
 *         description: No es miembro del workspace o no tiene rol `owner`
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sin_membresia:
 *                 summary: No es miembro
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No eres miembro de este espacio de trabajo
 *               rol_insuficiente:
 *                 summary: Es miembro pero no owner
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No tienes permisos suficientes para hacer esta operacion
 *       404:
 *         description: No existe un workspace con ese id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Workspace no encontrado
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
workspace_router.delete(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner']),
    deleteWorkspaceById
)

/**
 * @openapi
 * /api/workspaces/{workspace_id}:
 *   put:
 *     summary: Actualiza nombre y descripcion del workspace
 *     description: |
 *       Actualiza `nombre` y `description` del workspace. Requiere rol
 *       `owner` o `admin` en ese workspace. Ambos campos son requeridos.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspace_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId del workspace en MongoDB
 *         example: 6aabb222190ff6061955c002
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 30
 *                 example: Proyecto UTN 2026
 *                 description: Nuevo nombre (se guarda como `nombre`)
 *               description:
 *                 type: string
 *                 maxLength: 200
 *                 example: Nueva descripcion del espacio
 *     responses:
 *       200:
 *         description: Workspace actualizado (devuelve el documento actualizado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     workspace_updated:
 *                       $ref: '#/components/schemas/Workspace'
 *             example:
 *               ok: true
 *               message: Workspace actualizado correctamente
 *               status: 200
 *               data:
 *                 workspace_updated:
 *                   _id: 6aabb222190ff6061955c002
 *                   nombre: Proyecto UTN 2026
 *                   description: Nueva descripcion del espacio
 *                   fecha_creacion: '2026-09-17T14:56:26.249Z'
 *       400:
 *         description: Header de auth faltante/malformado o faltan `name` y `description`
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campos_requeridos:
 *                 summary: Falta name o description
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: name y description son campos requeridos
 *               auth_header_faltante:
 *                 summary: Header Authorization ausente
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Auth header is requered
 *       401:
 *         description: El token de sesion es invalido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Auth token is invalid!
 *       403:
 *         description: No es miembro del workspace o no tiene rol `owner`/`admin`
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sin_membresia:
 *                 summary: No es miembro
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No eres miembro de este espacio de trabajo
 *               rol_insuficiente:
 *                 summary: Es miembro pero sin owner/admin
 *                 value:
 *                   ok: false
 *                   status: 403
 *                   message: No tienes permisos suficientes para hacer esta operacion
 *       404:
 *         description: No existe un workspace con ese id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Workspace no encontrado
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
workspace_router.put(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    updateWorkspaceById
)

/*
Crear los endpoints

EJERCITACION PARA AHORA
- (owner) DELETE /api/workspace/:workspace_id => Elimina espacio de trabajo (HECHO)
- (owner, admin) PUT /api/workspace/:workspace_id => Actualizar nombre/descripcion del espacio de trabajo

Tarea:
- (todos) get /api/workspace/:workspace_id/members
- (owner, admin) DELETE /api/workspace/:workspace_id/members/:member_id
- (owner, admin) POST /api/workspace/:workspace_id/members/invite
    body: email (el email del usuario a invitar)
    - Revisar que el rol con el que se crea sea 'admin' o 'user'
    - Revisar que el usuario a invitar exista
    - Revisar que no este ya agregado al workspace (que tenga una membresia)
    - Crear la membresia con una propiedad 'invitacion_aceptada': false
    - Enviar un mail con un link para "aceptar invitacion" (debe tener una expiracion y debe enviar un token)
        - Ese link hara un GET hacia /api/workspace/:workspace_id/members/accept-invite/:invitation_token

- (todos) Unauthentified /api/workspace/:workspace_id/members/accept-invite/:invitation_token
    - Verifica que el invitation_token sea valido y edita la membersia para marcar que lo acepto
*/

/* workspace_router.use(
    '/:workspace_id/channels',
    channel_router
) */

export default workspace_router
