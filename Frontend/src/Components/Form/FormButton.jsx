import React from 'react'
import './Form.css'

/*
  Boton primario de formulario. Cuando `loading` es true queda
  deshabilitado y muestra un spinner con texto de progreso, sin
  cambiar de tamaño (mismo ancho/alto) para no mover el layout.

  Uso:
    <FormButton loading={loading}>Registrarse</FormButton>
*/
function FormButton({ loading = false, disabled = false, loadingText = 'Cargando…', children }) {
  return (
    <button
      type='submit'
      className={`form-btn${loading ? ' form-btn--loading' : ''}`}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <span className='form-btn__spinner' aria-hidden='true'></span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default FormButton
