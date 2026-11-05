import React, { useEffect, useState } from 'react'
import useRequest from '../../hooks/useRequest'
import { getAllWorkspaces } from '../../services/workspaceService'
import {Link} from 'react-router'
import WorkspaceList from '../../Components/WorkspaceList/WorkspaceList'

function HomeScreeen() {

  

  return (
    <div>
      <h1>Bienvenido a slack!</h1>
      <div>
        <h2>Mis espacios de trabajo:</h2>
        <WorkspaceList/>
      </div>
    </div>
  )
}

export default HomeScreeen