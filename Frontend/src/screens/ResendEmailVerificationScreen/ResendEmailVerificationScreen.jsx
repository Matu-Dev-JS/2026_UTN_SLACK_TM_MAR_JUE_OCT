import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { resendEmailVerification } from '../../services/authService'
import TextField from '../../Components/Form/TextField'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

/*
Aca llega el usuario que no recibio (o le expiro) el mail de verificacion.
Ingresa su email y le reenviamos el correo con un nuevo link de verificacion.
*/

function ResendEmailVerificationScreen() {
  const initial_state = { email: '' }
  const { formState, handleChangeInput } = useForm(initial_state)
  const { loading, response, error, sendRequest } = useRequest()

  async function handleSubmit(event) {
    event.preventDefault()
    sendRequest(
      () => resendEmailVerification(formState.email)
    )
  }

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
        <h1 className='form-title'>Reenviar verificacion</h1>
        <p className='form-subtitle'>Ingresa tu correo para recibir un nuevo link de verificacion</p>
        <form className='form-stack' onSubmit={handleSubmit}>
          <TextField
            name='email'
            label='Email:'
            type='email'
            value={formState.email}
            onChange={handleChangeInput}
            autoComplete='email'
          />
          {
            error
            &&
            !loading
            &&
            <Alert type='error'>{error}</Alert>
          }
          <FormButton loading={loading}>Reenviar correo</FormButton>
          {
            response
            &&
            !loading
            &&
            <Alert type='success'>
              {response.message}
            </Alert>
          }
        </form>
        <p className='form-footer'>
          ¿Ya verificaste tu cuenta? <Link to='/login'>Inicia sesion</Link>
        </p>
      </div>
    </div>
  )
}

export default ResendEmailVerificationScreen
