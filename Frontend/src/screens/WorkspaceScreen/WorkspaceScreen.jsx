import React from 'react'
import { useWorkspaceContext } from '../../Contexts/WorkspaceContext'

/*
Pantalla del workspace /workspace/:workspace_id
Los datos del workspace y las membresias vienen del WorkspaceContext
cargado a nivel de ruta
*/

function WorkspaceScreen() {

  const {
    workspace_loading,
    workspace_response,
    workspace_error,
    members_loading,
    members_response,
    members_error
  } = useWorkspaceContext()

  // Por ahora la pantalla queda vacia
  return (
    <div>
    </div>
  )
}

export default WorkspaceScreen
