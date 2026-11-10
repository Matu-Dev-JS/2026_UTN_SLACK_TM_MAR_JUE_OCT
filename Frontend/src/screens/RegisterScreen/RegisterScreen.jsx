import React from 'react'
import { Link } from 'react-router'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { register } from '../../services/authService'
import TextField from '../../Components/Form/TextField'
import FormButton from '../../Components/Form/FormButton'
import Alert from '../../Components/Alert/Alert'

function RegisterScreen() {
  const initial_state = { name: '', email: '', password: '' }
  const { formState, handleChangeInput } = useForm(initial_state)
  const { loading, response, error, sendRequest } = useRequest()

  async function handleSubmit(event) {
    event.preventDefault()
    sendRequest(
      () => register(formState.name, formState.email, formState.password)
    )
    console.log('Usuario intenta registrarse', formState)
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
        <h1 className='form-title'>Registro de usuario</h1>
        <p className='form-subtitle'>Creá tu cuenta para empezar a usar la app</p>
        <form className='form-stack' onSubmit={handleSubmit}>
          <TextField
            name='name'
            label='Nombre:'
            type='text'
            value={formState.name}
            onChange={handleChangeInput}
            autoComplete='name'
          />
          <TextField
            name='email'
            label='Email:'
            type='email'
            value={formState.email}
            onChange={handleChangeInput}
            autoComplete='email'
          />
          <TextField
            name='password'
            label='Password:'
            type='password'
            value={formState.password}
            onChange={handleChangeInput}
            autoComplete='new-password'
          />
          {
            error
            &&
            !loading
            &&
            <Alert type='error'>{error}</Alert>
          }
          <FormButton loading={loading}>Registrarse</FormButton>
          {
            response
            &&
            !loading
            &&
            <Alert type='success'>
              Registro exitoso, revisa tu correo electronico para verificar la
              cuenta
            </Alert>
          }
        </form>
        <p className='form-footer'>
          ¿Ya tenés cuenta? <Link to='/login'>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterScreen
