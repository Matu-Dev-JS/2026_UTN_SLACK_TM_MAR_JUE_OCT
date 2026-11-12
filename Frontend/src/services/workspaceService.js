const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function getAllWorkspaces(){
    const auth_token = localStorage.getItem('auth_token')
    const response_http = await fetch(
            API_URL + '/api/workspaces',
            {
                method: 'GET',
                headers: {
                    'Authorization': `bearer ${auth_token}`
                }
            }
        )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }

    return response_body
}

export async function getWorkspaceById(workspace_id){
    const auth_token = localStorage.getItem('auth_token')
    const response_http = await fetch(
            API_URL + `/api/workspaces/${workspace_id}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `bearer ${auth_token}`
                }
            }
        )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }

    return response_body
}

export async function getWorkspaceMembers(workspace_id){
    const auth_token = localStorage.getItem('auth_token')
    const response_http = await fetch(
            API_URL + `/api/workspaces/${workspace_id}/members`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `bearer ${auth_token}`
                }
            }
        )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }

    return response_body
}

export async function createWorkspace(name, description){
    const auth_token = localStorage.getItem('auth_token')
    const response_http = await fetch(
            API_URL + '/api/workspaces',
            {
                method: 'POST',
                headers: {
                    'Authorization': `bearer ${auth_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            }
        )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }

    return response_body
}