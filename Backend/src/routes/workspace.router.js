import express from 'express'
import workspace_repository from '../repositories/workspace.repository.js'
import member_repository from '../repositories/member.repository.js'
import authMiddleware from '../middlewares/auth.middleware.js'
import channel_router from './channels.router.js'
import ServerError from '../utils/error.util.js'
import workspaceMiddleware from '../middlewares/workspace.middleware.js'

const workspace_router = express.Router()


/* 
(Authentified) GET /api/workspace
    Traer la lista de espacios de trabajo asocidadas a ese usuario (basicamente sus membresias), con el rol de membresia en cada espacio de trabajo
*/
workspace_router.get(
    '/',
    authMiddleware,
    async (request, response) => {
        
        const workspaces_obtenidos = await member_repository.getAllWorkspaceByUserId(request.user.id)
        return response.status(200).send({
            ok:true,
            message: "Obtenidos todos los datos",
            status: 200,
            data: {
                workspaces: workspaces_obtenidos
            }
        })
    }
)

workspace_router.post(
    '/',
    authMiddleware,
    async (request, response) => {
        //Quien carancho quiere hacer esta operacion ?????
        console.log('[CREATE WORKSPACE]', request.user)
        const {name, description} = request.body



        const workspace_created = await workspace_repository.createWorkspace(name, description)
        const owner_membership = await member_repository.create(
            request.user.id,
            workspace_created._id,
            'owner'
        )

        return response.status(201).send(
            {
                ok: true, 
                status: 201,
                message: "Por ahora todo bien",
                data: {
                    workspace_created,
                    owner_membership
                }
            }
        )
    }
)

workspace_router.get(
    '/:workspace_id', 
    authMiddleware,
    workspaceMiddleware([]),
    async (request, response) => {
        

        return response.status(200).send({
            ok: true,
            message: "Workspace obtenido correctamente",
            status: 200,
            data: {
                workspace_selected: request.workspace
            }
        })
    }
)

workspace_router.delete(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner']),
    async (request, response) => {
        await  workspace_repository.deleteById(request.workspace._id)
        await member_repository.deleteAllMembershipsByWorkspaceId(request.workspace._id)
        return response.status(200).send({
            ok: true,
            message: "Workspace eliminado correctamente",
            status: 200,
            data: {
                workspace_deleted: request.workspace
            }
        })
    }
)

workspace_router.put(
    '/:workspace_id',
    authMiddleware,
    workspaceMiddleware(['owner', 'admin']),
    async (request, response) => {
        const { workspace_id } = request.params
        const { name, description } = request.body

        if(!name || !description){
            throw new ServerError("name y description son campos requeridos", 400)
        }

        const workspace_updated = await workspace_repository.updateById(
            workspace_id, 
            { nombre: name, description }
        )
        return response.status(200).send({
            ok: true,
            message: "Workspace actualizado correctamente",
            status: 200,
            data: {
                workspace_updated
            }
        })
    }
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


/* 
/api/workspace/:workspace_id/channels

*/