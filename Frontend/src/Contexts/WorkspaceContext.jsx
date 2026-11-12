import React, { createContext, useContext, useEffect } from "react"
import { useParams } from "react-router"
import useRequest from "../hooks/useRequest"
import { getWorkspaceById, getWorkspaceMembers } from "../services/workspaceService"

/*
Este contexto guarda a nivel de ruta los datos del workspace
determinado por el workspace_id de la url /workspace/:workspace_id

Consulta dos apis:
- /api/workspaces/:workspace_id          -> datos del workspace
- /api/workspaces/:workspace_id/members  -> lista de membresias
*/

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {

    const { workspace_id } = useParams()

    const {
        loading: workspace_loading,
        response: workspace_response,
        error: workspace_error,
        sendRequest: sendWorkspaceRequest
    } = useRequest()

    const {
        loading: members_loading,
        response: members_response,
        error: members_error,
        sendRequest: sendMembersRequest
    } = useRequest()

    useEffect(
        () => {
            sendWorkspaceRequest(
                () => getWorkspaceById(workspace_id)
            )
            sendMembersRequest(
                () => getWorkspaceMembers(workspace_id)
            )
        },
        [workspace_id]
    )

    /* Por ahora mostramos por consola los estados de las apis y el estado de carga */
    useEffect(
        () => {
            console.log('[Workspace API] Estado de carga:', workspace_loading)
            console.log('[Workspace API] Respuesta:', workspace_response)
            console.log('[Workspace API] Error:', workspace_error)
        },
        [workspace_loading, workspace_response, workspace_error]
    )

    useEffect(
        () => {
            console.log('[Members API] Estado de carga:', members_loading)
            console.log('[Members API] Respuesta:', members_response)
            console.log('[Members API] Error:', members_error)
        },
        [members_loading, members_response, members_error]
    )

    return (
        <WorkspaceContext.Provider
            value={
                {
                    workspace_loading,
                    workspace_response,
                    workspace_error,
                    members_loading,
                    members_response,
                    members_error
                }
            }
        >
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspaceContext() {
    return useContext(WorkspaceContext)
}
