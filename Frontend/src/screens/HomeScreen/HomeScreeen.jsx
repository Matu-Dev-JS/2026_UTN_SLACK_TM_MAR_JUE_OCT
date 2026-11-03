import React, { useEffect, useState } from 'react'
import useRequest from '../../hooks/useRequest'
import { getAllWorkspaces } from '../../services/workspaceService'

function HomeScreeen() {

  /* 
  Llamar por HTTP (con fetch) a GET /api/workspaces y renderizar la lista de espacios de trabajo en este componente, si hay espacios de trabajo mostrar un mensaje tipo "Aun no creaste ningun espacio de trabajo"
  Mostrar "cargando..." mientras la request aun se este haciendo
  En caso de haber algun fallo mostrar "Error: {error}"

  PROTIP: 
    - Usar el useRequest para manejar los estados de respuesta de la API
    - Cargar la funcion getAllWorkspaces solo 1 vez (para evitar re-rendering infinito)
  */

  const {response, error, loading, sendRequest} = useRequest()

  //Con este efecto me aseguro que sendRequest solo se ejecute una vez
  useEffect(
    () => {
      sendRequest(
        () => getAllWorkspaces()
      )
    },
    []
  )
  console.log(response, error, loading)
 
  return (
    <div>
      <h1>Bienvenido a slack!</h1>
    </div>
  )
}

export default HomeScreeen