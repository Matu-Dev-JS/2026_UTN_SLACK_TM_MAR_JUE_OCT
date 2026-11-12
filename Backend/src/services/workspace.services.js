/*
La capa de servicios concentra la LOGICA DE NEGOCIO de cada endpoint:
aqui decidimos que se puede hacer y que no (validaciones, reglas de membresia, etc).

El controller solo se encarga de HTTP (leer request, responder response)
y delega toda esta logica acá.
*/

import workspace_repository from "../repositories/workspace.repository.js"
import member_repository from "../repositories/member.repository.js"
import ServerError from "../utils/error.util.js"

/*
GET ALL WORKSPACES (lógica del endpoint GET /api/workspace)
1. busca todas las membresias del usuario (sus espacios de trabajo y su rol en cada uno)
2. para cada espacio de trabajo busca su lista de miembros (nombre y rol)
*/
export async function getAllWorkspacesByUserId(user_id) {
    const workspaces_obtenidos = await member_repository.getAllWorkspaceByUserId(user_id)

    //Buscamos los miembros de cada workspace en paralelo
    const workspaces_con_miembros = await Promise.all(
        workspaces_obtenidos.map(async workspace => {
            const members = await member_repository.getAllMembershipsByWorkspaceId(workspace.workspace_id)
            return {
                ...workspace,
                members: members
            }
        })
    )

    return workspaces_con_miembros
}

/*
CREATE WORKSPACE (lógica del endpoint POST /api/workspace)
1. valida los datos
2. crea el workspace
3. crea la membresia 'owner' para el usuario que lo creo
*/
export async function createWorkspaceWithOwner(name, description, user_id) {
    if (!name) {
        throw new ServerError("name es un campo requerido", 400)
    }

    const workspace_created = await workspace_repository.createWorkspace(name, description)

    const owner_membership = await member_repository.create(
        user_id,
        workspace_created._id,
        'owner'
    )

    return {
        workspace_created,
        owner_membership
    }
}

/*
GET MEMBERS (lógica del endpoint GET /api/workspaces/:workspace_id/members)
trae la lista de miembros (membresias) asociadas a un espacio de trabajo
*/
export async function getMembersByWorkspaceId(workspace_id) {
    return await member_repository.getAllMembershipsByWorkspaceId(workspace_id)
}

/*
DELETE WORKSPACE (lógica del endpoint DELETE /api/workspace/:workspace_id)
1. elimina el workspace
2. elimina todas las membresias asociadas a ese workspace
*/
export async function deleteWorkspaceWithMemberships(workspace_id) {
    await workspace_repository.deleteById(workspace_id)
    await member_repository.deleteAllMembershipsByWorkspaceId(workspace_id)
}

/*
UPDATE WORKSPACE (lógica del endpoint PUT /api/workspace/:workspace_id)
1. valida los datos
2. actualiza nombre/descripcion del workspace
*/
export async function updateWorkspace(workspace_id, name, description) {
    if (!name || !description) {
        throw new ServerError("name y description son campos requeridos", 400)
    }

    return await workspace_repository.updateById(
        workspace_id,
        { nombre: name, description }
    )
}
