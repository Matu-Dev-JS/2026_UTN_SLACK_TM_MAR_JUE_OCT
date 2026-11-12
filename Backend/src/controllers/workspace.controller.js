/*
El controller es la capa HTTP: lee lo que llega en el request,
delega la logica de negocio a la capa de servicios
y arma la response para el cliente.
*/

import * as workspace_services from "../services/workspace.services.js"

/*
(Authentified) GET /api/workspace
    Traer la lista de espacios de trabajo asocidadas a ese usuario (basicamente sus membresias), con el rol de membresia en cada espacio de trabajo
*/
export async function getAllWorkspaces (request, response) {

    //El servicio busca las membresias del usuario autentificado
    const workspaces_obtenidos = await workspace_services.getAllWorkspacesByUserId(request.user.id)
    return response.status(200).send({
        ok:true,
        message: "Obtenidos todos los datos",
        status: 200,
        data: {
            workspaces: workspaces_obtenidos
        }
    })
}

export async function createWorkspace (request, response) {
    //Quien carancho quiere hacer esta operacion ?????
    console.log('[CREATE WORKSPACE]', request.user)
    const {name, description} = request.body

    //El servicio valida los datos, crea el workspace y la membresia owner
    const {workspace_created, owner_membership} = await workspace_services.createWorkspaceWithOwner(
        name,
        description,
        request.user.id
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

export async function getWorkspaceById (request, response) {

    return response.status(200).send({
        ok: true,
        message: "Workspace obtenido correctamente",
        status: 200,
        data: {
            workspace_selected: request.workspace
        }
    })
}

export async function deleteWorkspaceById (request, response) {
    //El servicio elimina el workspace y todas sus membresias
    await workspace_services.deleteWorkspaceWithMemberships(request.workspace._id)
    return response.status(200).send({
        ok: true,
        message: "Workspace eliminado correctamente",
        status: 200,
        data: {
            workspace_deleted: request.workspace
        }
    })
}

export async function updateWorkspaceById (request, response) {
    const { workspace_id } = request.params
    const { name, description } = request.body

    //El servicio valida los datos y actualiza el workspace
    const workspace_updated = await workspace_services.updateWorkspace(workspace_id, name, description)
    return response.status(200).send({
        ok: true,
        message: "Workspace actualizado correctamente",
        status: 200,
        data: {
            workspace_updated
        }
    })
}
