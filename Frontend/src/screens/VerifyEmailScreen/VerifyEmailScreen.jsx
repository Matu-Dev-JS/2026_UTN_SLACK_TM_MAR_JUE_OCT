import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import useRequest from '../../hooks/useRequest'
import { verifyEmail } from '../../services/authService'
import Alert from '../../Components/Alert/Alert'

/*
Esta pantalla se abre desde el link del correo de verificacion.
El link trae el verification_token por querystring y aca lo enviamos a la API
para verificar la cuenta. Si se verifica bien, redirigimos a /login.
*/

function VerifyEmailScreen() {
  const [searchParams] = useSearchParams()
  const verification_token = searchParams.get('verification_token')
  const { loading, response, error, sendRequest } = useRequest()
  const navigate = useNavigate()

  //Cuando la pantalla monta con un token, mandamos la consulta a la API
  useEffect(
    () => {
      if (verification_token) {
        sendRequest(() => verifyEmail(verification_token))
      }
    },
    [verification_token]
  )

  //Si la verificacion fue exitosa, esperamos un momento para mostrar el mensaje y redirigimos a /login
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
        <h1 className='form-title'>Verificacion de email</h1>
        <p className='form-subtitle'>Estamos verificando tu cuenta, esperá un momento</p>

        <div className='form-stack'>
          {
            !verification_token
            &&
            <Alert type='error'>
              No encontramos el token de verificacion en el link
            </Alert>
          }
          {
            loading
            &&
            <Alert type='info'>Verificando tu email...</Alert>
          }
          {
            error
            &&
            !loading
            &&
            <Alert type='error'>
              {error} Volvé a iniciar sesion para recibir un nuevo correo de verificacion.
            </Alert>
          }
          {
            response
            &&
            !loading
            &&
            <Alert type='success'>
              ¡Email verificado con exito! Te redirigimos a la pagina de inicio de sesion en unos segundos...
            </Alert>
          }
        </div>

        <p className='form-footer'>
          Si no sos redirigido, <a href='/login'>iniciá sesion aca</a>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmailScreen
