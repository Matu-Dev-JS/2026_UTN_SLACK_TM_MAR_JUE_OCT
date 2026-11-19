/*
La capa de servicios concentra la LOGICA DE NEGOCIO de cada endpoint:
aqui decidimos que se puede hacer y que no (validaciones, reglas de membresia, etc).

El controller solo se encarga de HTTP (leer request, responder response)
y delega toda esta logica acá.
*/

import workspace_repository from "../repositories/workspace.repository.js"
import member_repository from "../repositories/member.repository.js"
import user_repository from "../repositories/user.repository.js"
import ServerError from "../utils/error.util.js"

/*
Roles que cada rol de quien crea la membresia puede asignar.
- owner: puede crear 'admin' y 'user'
- admin: solo puede crear 'user'
El rol 'owner' no se asigna nunca desde este endpoint.
*/
const ASSIGNABLE_ROLES_BY_CALLER = {
    owner: ['admin', 'user'],
    admin: ['user']
}

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
CREATE MEMBER (lógica del endpoint POST /api/workspaces/:workspace_id/members)
1. valida los datos
2. valida que quien crea la membresia pueda asignar ese rol (sino 403)
3. valida que exista un usuario con ese email
4. valida que el usuario no sea ya miembro del workspace
5. crea la membresia
*/
export async function createWorkspaceMember(email, workspace_id, rol, caller_role) {
    if (!email || !rol) {
        throw new ServerError("email y rol son campos requeridos", 400)
    }

    //owner puede asignar 'admin' o 'user'; admin solo 'user'. Cualquier otro rol se rechaza
    const assignable_roles = ASSIGNABLE_ROLES_BY_CALLER[caller_role] || []
    if (!assignable_roles.includes(rol)) {
        throw new ServerError(
            `No tienes permisos suficientes para crear un miembro con rol '${rol}'`,
            403
        )
    }

    const user_found = await user_repository.getByEmail(email)
    if (!user_found) {
        throw new ServerError("El usuario no existe", 404)
    }

    //Si ya tiene membresia en este workspace no se vuelve a agregar
    const existing_membership = await member_repository.getMembershipByUserAndWorkspace(user_found._id, workspace_id)
    if (existing_membership) {
        throw new ServerError("El usuario ya es miembro de este espacio de trabajo", 409)
    }

    return await member_repository.create(user_found._id, workspace_id, rol)
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
