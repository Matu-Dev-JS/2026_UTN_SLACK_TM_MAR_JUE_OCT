import useWorkspaceList from '../../hooks/useWorkspaceList'
import { Link } from 'react-router'
import { FaArrowRight } from 'react-icons/fa6'
import './WorkspaceList.css'

const WORKSPACE_AVATAR_URL = 'https://a.slack-edge.com/80588/img/avatars-teams/ava_0018-88.png'

/*
Colores para los recuadros de iniciales de los miembros.
El color se elige de forma deterministica a partir del nombre,
asi que cada miembro siempre tiene el mismo color.
*/
const MEMBER_COLORS = ['#2BAC76', '#1264A3', '#E01E5A', '#ECB22E', '#611F69', '#E8912D', '#0EB07D', '#C239B3']

function getMemberColor(member_name) {
    let hash = 0
    for (let i = 0; i < member_name.length; i++) {
        hash = (hash + member_name.charCodeAt(i)) % MEMBER_COLORS.length
    }
    return MEMBER_COLORS[hash]
}

export default function WorkspaceList() {

    const {
        workspaces_error, 
        workspaces_loading, 
        workspaces_response, 
        reloadWorkspaces
    } = useWorkspaceList()

    return (
        <div className='workspace-list-card'>
            <div className='workspace-list-header'>
                <h2>Espacios de trabajo</h2>
            </div>

            <div className='workspace-list-body'>
                {workspaces_loading && <span className='workspace-list-message'>Cargando...</span>}

                {!workspaces_loading && workspaces_error && (
                    <div className='workspace-list-message'>
                        <span className='error-text'>Error: {workspaces_error}</span>
                        <button onClick={reloadWorkspaces}> Recargar </button>
                    </div>
                )}

                {!workspaces_loading && !workspaces_error && !workspaces_response && (
                    <div className='workspace-list-message'>
                        <span className='error-text'>Error: Ocurrio un problema al obtener la lista de espacios de trabajo</span>
                        <button onClick={reloadWorkspaces}> Recargar </button>
                    </div>
                )}

                {!workspaces_loading && !workspaces_error && workspaces_response && workspaces_response.data.workspaces.length === 0 && (
                    <p className='workspace-list-message'>Aún no creaste ningún espacio de trabajo</p>
                )}

                {!workspaces_loading && !workspaces_error && workspaces_response && workspaces_response.data.workspaces.length > 0 && (
                    <>
                        <h3 className='workspace-list-section-title'>Listo para comenzar</h3>
                        <ul className='workspace-list-items'>
                            {workspaces_response.data.workspaces.map((workspace) => (
                                <li key={workspace.workspace_id}>
                                    <Link
                                        className='workspace-item'
                                        to={`/workspace/${workspace.workspace_id}`}
                                    >
                                        <img
                                            className='workspace-item-avatar'
                                            src={WORKSPACE_AVATAR_URL}
                                            alt={`Avatar de ${workspace.workspace_nombre}`}
                                        />

                                        <div className='workspace-item-info'>
                                            <span className='workspace-item-name'>{workspace.workspace_nombre}</span>
                                            <span className='workspace-item-members'>
                                                {workspace.members.map((member) => (
                                                    <span
                                                        key={member.member_id}
                                                        className='workspace-member-initial'
                                                        style={{ backgroundColor: getMemberColor(member.member_nombre) }}
                                                        title={member.member_nombre}
                                                    >
                                                        {member.member_nombre.charAt(0).toUpperCase()}
                                                    </span>
                                                ))}
                                                <span className='workspace-item-members-count'>
                                                    {workspace.members.length === 1
                                                        ? '1 miembro'
                                                        : `${workspace.members.length} miembros`}
                                                </span>
                                            </span>
                                        </div>

                                        <span className='workspace-item-arrow' aria-hidden='true'>
                                            <FaArrowRight/>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

            <div className='workspace-list-footer'>
                <Link className='workspace-list-footer-link' to='/workspaces/new'>Crea un nuevo espacio de trabajo</Link>
                <span className='workspace-list-footer-help'>
                    ¿No puedes ver tu espacio de trabajo? <Link to='/login'>Prueba con otro correo electrónico</Link>
                </span>
            </div>
        </div>
    )
}
