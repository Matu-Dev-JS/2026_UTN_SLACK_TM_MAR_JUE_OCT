/* 
Interaccion con la API
*/

const API_URL = import.meta.env.VITE_APP_URL_BACKEND

export async function login (email, password){
    const response_http = await fetch(
        API_URL + '/api/auth/login',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }

    return response_body
}

/* 
JSON.stringify sirve para transformar un Objeto de JS en un JSON
*/


export async function register(username, email, password) {
    const response_http = await fetch(
        API_URL + '/api/auth/register',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        }
    )
    //Leemos el cuerpo de la respuesta como un JSON
    const response_body = await response_http.json()
    
    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/* 
Reenvio de verificacion: le pasamos el email al backend para que le re-cree
el token y le envie devuelta el mail con el link de verificacion
*/
export async function resendEmailVerification(email) {
    const response_http = await fetch(
        API_URL + '/api/auth/verify-email/' + encodeURIComponent(email) + '/resend',
        {
            method: 'GET'
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/* 
Verificamos el email enviando el token que llego por querystring desde el link del correo
*/
export async function verifyEmail(verification_token) {
    const response_http = await fetch(
        API_URL + '/api/auth/verify-email?verification_token=' + encodeURIComponent(verification_token),
        {
            method: 'GET'
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/* 
Solicitud de restablecimiento de contrasena: le pasamos el email al backend para que
(cuando el usuario exista) le envie un mail con un link para crear una contrasena nueva
*/
export async function forgotPassword(email) {
    const response_http = await fetch(
        API_URL + '/api/auth/forgot-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                email: email
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}

/* 
Restablecimiento de contrasena: enviamos el reset_token que llego por querystring
desde el link del mail junto con la nueva password
*/
export async function resetPassword(reset_token, password) {
    const response_http = await fetch(
        API_URL + '/api/auth/reset-password',
        {
            method: 'POST',
            headers: {
                'Content-Type': "application/json"
            },
            body: JSON.stringify({
                reset_token: reset_token,
                password: password
            })
        }
    )
    const response_body = await response_http.json()

    if(!response_body.ok){
        throw new Error(response_body.message)
    }
    return response_body
}