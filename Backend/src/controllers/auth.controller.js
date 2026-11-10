/*
El controller es la capa HTTP: lee lo que llega en el request,
delega la logica de negocio a la capa de servicios
y arma la response para el cliente.
*/

import * as auth_services from "../services/auth.services.js"

/* 
Para enviar en una request HTTP info a una API usamos el body

Las consultas (request) tipo GET NO TIENEN body
El body puede ser de distintos tipos de dato:
    Hoy vamos a usar JSON, para poder usar JSON nuestra API debe estar preparada para recibir ese tipo de informacion
*/

export async function register(request, response) {

    console.log("[REGISTER]", request.body)
    const { username, email, password } = request.body

    //Toda la logica de negocio vive en la capa de servicios
    await auth_services.registerUser(username, email, password)

    return response.status(201).send({
        ok: true,
        status: 201,
        message: "User registered successfully"
    })
}


/* 
Cuando un usuario inicia sesion debemos darle una credencial firmada que nos permita indicar quien es ese usuario para que mas adelante el usuario nos devuelva dicha credencial y poder confiar en ella

Para poder crear esta credencial firmada usamos JWT (JsonWebTokens)
Los JWT son objetos de JS (JSON) pasados a string (HS256) con una firma


*/

export async function login(request, response) {
    const { email, password } = request.body;

    //El servicio valida, compara la password y crea el token de acceso
    const auth_token = await auth_services.loginUser(email, password)

    return response.status(200).send({
        ok: true,
        message: "You have logged in successfully",
        status: 200,
        data: {
            auth_token
        }
    });
}


export async function verifyEmail (request, response){
    const {verification_token} = request.query

    //El servicio valida el token, busca al usuario y lo marca como verificado
    await auth_services.verifyUserEmail(verification_token)

    return response.status(200).send(
        {
            ok: true, 
            status: 200,
            message: 'Usuario verificado exitosamente'
        }
    )
}


export async function resendVerificationEmail (request, response){
    //El email llega como path param: /api/auth/verify-email/:email/resend
    const {email} = request.params

    //El servicio valida el email y decide si corresponde reenviar el mail
    await auth_services.resendVerificationEmail(email)

    return response.status(200).send(
        {
            ok: true,
            status: 200,
            message: 'Se enviara un mail con los pasos para verificar en caso de que esta cuenta sea real'
        }
    )
}
