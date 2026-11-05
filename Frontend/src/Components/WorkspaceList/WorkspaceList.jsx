import useWorkspaceList from '../../hooks/useWorkspaceList'

export default function WorkspaceList() {

    const {
        workspaces_error, 
        workspaces_loading, 
        workspaces_response, 
        reloadWorkspaces
    } = useWorkspaceList()



    if (workspaces_loading) {
        return <span>Cargando...</span>
    }
    else if (workspaces_error) {
        return <div>
            <span className='error-text'>Error: {workspaces_error}</span>
            <button onClick={reloadWorkspaces}> Recargar </button>
        </div>
    }
    else if (!workspaces_response) {
        return <div>
            <span className='error-text'>Error: Ocurrio un problema al obtener la lista de espacios de trabajo</span>
            <button onClick={reloadWorkspaces}> Recargar </button>
        </div>
    }
    else if (workspaces_response.data.workspaces.length === 0) {
        return <p>Aún no creaste ningún espacio de trabajo</p>
    }
    else {
        return <div>
            {workspaces_response.data.workspaces.map((workspace) => (
                <Link key={workspace.id} to={`/workspace/${workspace._id}`}>
                    {workspace.nombre}
                </Link>
            ))}
        </div>
    }
}
