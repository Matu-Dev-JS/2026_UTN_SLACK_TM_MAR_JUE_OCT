import React from 'react'
import useForm from '../../hooks/useForm'
import useRequest from '../../hooks/useRequest'
import { register } from '../../services/authService'
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
    <div>
      <h1>Registro de usuario</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre:</label>
          <input
            name='name'
            id='name'
            type='text'
            value={formState.name}
            onChange={handleChangeInput}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            name='email'
            id='email'
            type='email'
            value={formState.email}
            onChange={handleChangeInput}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            name='password'
            id='password'
            type='password'
            value={formState.password}
            onChange={handleChangeInput}
          />
        </div>
        {
          error
          &&
          !loading
          &&
          <span style={{ color: 'red' }}>{error}</span>
        }
        {
          loading
            ? <button type='submit' disabled={true} >Cargando...</button>
            : <button type='submit'>Registrarse</button>
        }
        {
          response && !loading && <span style={{ color: 'greenyellow' }}>Registro exitoso, revisa tu correo electronico para verificar la cuenta</span>
        }
      </form>
    </div>
  )
}
export default RegisterScreen