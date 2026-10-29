import React, { useState } from 'react'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'
import useRequest from '../../hooks/useRequest'

/* 
Siguiendo las practicas implementadas la conectar el formulario de login con nuesta API REST
Desarrollar la implementacion del formulario de registro y la consulta a la API REST
*/

function LoginScreen() {
    
    const initial_state = {email: '', password: ''}
    const {formState, handleChangeInput} = useForm(initial_state)
    const {loading, response, error, sendRequest} = useRequest()
   

    async function handleSubmit (event){
        event.preventDefault()
        sendRequest(
            () => login(formState.email, formState.password)
        )
        console.log('Usuario intenta iniciar sesion', formState)
    }



    
    
    return (
        <div>
            <h1>Inciar sesion</h1>
            <form onSubmit={handleSubmit}>
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
                    <span style={{color: 'red'}}>{error}</span>
                }

                {
                    loading
                    ? <button type='submit' disabled={true} >Cargando...</button>
                    : <button type='submit'>Iniciar sesion</button>
                }
                

                {
                    response && !loading && <span style={{color: 'greenyellow'}}>Inicio de sesion exitoso</span>
                }
            </form>
        </div>
    )
}

export default LoginScreen