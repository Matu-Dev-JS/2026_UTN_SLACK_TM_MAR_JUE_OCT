import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resetPassword } from '../../services/authService'
import TextField from '../../Components/Form/TextField'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

/*
Esta pantalla se abre desde el link del correo de restablecimiento.
El link trae el reset_token por querystring. El usuario ingresa su nueva
contrasena dos veces (para confirmar), validamos que coincidan y ahi
enviamos el token + la nueva password a la API.
*/

function ResetPasswordScreen() {
  const [searchParams] = useSearchParams()
  const reset_token = searchParams.get('reset_token')

  const initial_state = { password: '', confirm_password: '' }
  const { formState, handleChangeInput } = useForm(initial_state)
  const { loading, response, error, sendRequest } = useRequest()
  const [confirmation_error, setConfirmationError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    //Los dos campos de contrasena deben ser identicos
    if (formState.password !== formState.confirm_password) {
      setConfirmationError('Las contrasenas no coinciden')
      return
    }

    setConfirmationError(null)
    sendRequest(
      () => resetPassword(reset_token, formState.password)
    )
  }

  //Si el restablecimiento fue exitoso, esperamos un momento y redirigimos a /login
  useEffect(
    () => {
      if (response) {
        const timeout = setTimeout(() => navigate('/login'), 3000)
        return () => clearTimeout(timeout)
      }
    },
    [response]
  )

  return (
    <div className='form-screen'>
      <div className='form-card'>
        <img
          className='form-logo'
          alt='Slack'
          height='26'
          title='Slack'
          src='https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg'
        />
        <h1 className='form-title'>Restablecer contrasena</h1>
        <p className='form-subtitle'>Ingresa tu nueva contrasena para volver a acceder a tu cuenta</p>
        {
          reset_token
          ?
          <form className='form-stack' onSubmit={handleSubmit}>
            <TextField
              name='password'
              label='Nueva contrasena:'
              type='password'
              value={formState.password}
              onChange={handleChangeInput}
              autoComplete='new-password'
            />
            <TextField
              name='confirm_password'
              label='Confirmar contrasena:'
              type='password'
              value={formState.confirm_password}
              onChange={handleChangeInput}
              autoComplete='new-password'
            />
            {
              confirmation_error
              &&
              <Alert type='error'>{confirmation_error}</Alert>
            }
            {
              error
              &&
              !loading
              &&
              <Alert type='error'>{error}</Alert>
            }
            <FormButton loading={loading} loadingText='Restableciendo…'>Restablecer contrasena</FormButton>
            {
              response
              &&
              !loading
              &&
              <Alert type='success'>
                ¡Contrasena restablecida con exito! Te redirigimos a la pagina de inicio de sesion en unos segundos...
              </Alert>
            }
          </form>
          :
          <div className='form-stack'>
            <Alert type='error'>
              No encontramos el token de restablecimiento en el link. Pedi un nuevo correo desde esta pantalla.
            </Alert>
          </div>
        }
        <p className='form-footer'>
          ¿No te llegó el mail? <Link to='/forgot-password'>Pedir un nuevo link</Link>
        </p>
      </div>
    </div>
  )
}

export default ResetPasswordScreen
