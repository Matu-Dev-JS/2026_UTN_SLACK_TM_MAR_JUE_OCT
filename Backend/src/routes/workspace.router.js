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
workspace_router.get('/', authMiddleware, getAllWorkspaces)

workspace_router.post('/', authMiddleware, createWorkspace)

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
workspace_router.get(
    '/:workspace_id/members',
    authMiddleware,
    workspaceMiddleware([]),
    getWorkspaceMembers
)

workspace_router.delete(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner']),
    deleteWorkspaceById
)

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
