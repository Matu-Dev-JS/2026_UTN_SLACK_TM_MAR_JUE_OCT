import React from 'react'
import './Alert.css'

/*
  Mensaje inline de feedback para el usuario (errores del servidor,
  confirmaciones, avisos). Se renderiza en el flujo del formulario,
  no como modal.

  Uso:
    <Alert type="error">El correo ya esta registrado</Alert>
    <Alert type="success">Registro exitoso</Alert>
*/
function Alert({ type = 'info', children }) {
  return (
    <div role='status' className={`alert alert--${type}`}>
      {children}
    </div>
  )
}

export default Alert
