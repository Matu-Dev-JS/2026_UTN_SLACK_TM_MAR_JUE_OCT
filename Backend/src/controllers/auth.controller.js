import ENVIRONMENT from "../config/environment.config.js"
import mailer_transporter from "../config/mailer.config.js"
import user_repository from "../repositories/user.repository.js"
import { compareHash, generateHash } from "../utils/bcrypt.util.js"
import ServerError from "../utils/error.util.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


/* 
Para enviar en una request HTTP info a una API usamos el body

Las consultas (request) tipo GET NO TIENEN body
El body puede ser de distintos tipos de dato:
    Hoy vamos a usar JSON, para poder usar JSON nuestra API debe estar preparada para recibir ese tipo de informacion
*/

export async function register(request, response) {

    console.log("[REGISTER]", request.body)
    const { username, email, password } = request.body

    if (!username || !email || !password) {
        throw new ServerError(
            "Email, password and username is required",
            400
        )
    }

    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        throw new ServerError(
            "Email is incorrect",
            400
        )
    }

    //Validar si el mail ya esta registrado
    const user_already_exist = await user_repository.getByEmail(email)
    if (user_already_exist) {
        throw new ServerError(
            'Email is already used',
            400
        )
    }

    /* 
    Encriptamos la password para que en DB se guarde un dato irreversible 
    Viendo el dato irreversible es IMPROBABLE que se sepa el dato original
    */
    const password_hash = await generateHash(password)

    await user_repository.create(username, email, password_hash)


    const verify_email_token = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: '7d' // -> expira en 7 dias
        }
    )

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Verifica tu cuenta",
            html: `
                <body>
                    <h1>Bienvenido a nuestra plataforma</h1>
                    <p>Necesitamos verificar este correo electronico</p>
                    <a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email/${verify_email_token}'>
                    Click aqui para verifcar tu cuenta
                    </a>
                </body>
            `
        }
    )

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
    if (
        !email || !password || typeof email !== "string" || typeof password !== "string"
    ) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }


    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { 
        throw new ServerError(
            "Email is incorrect",
            400
        );
    }

    const user = await user_repository.getByEmail(email)

    if (!user) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }

    //Compara el hash guardado en DB contra la contraseña que nos envió por body el cliente.
    const isPasswordValid = await compareHash(password, user.password); 
    if (!isPasswordValid) {
        throw new ServerError(
            "Invalid email or password",
            401
        );
    }


    if(!user.email_verificado){
        throw new ServerError(
            'Email no verificado',
            403
        )
    }


    /* Crear un token firmado de sesion */

    const auth_token = jwt.sign(
        {
            //Aca va a info que queres guardar en la credencial
            id: user._id,
            name: user.nombre,
            email: user.email
        },
        ENVIRONMENT.JWT_SECRET_KEY //Firmamos con esto
    )


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
    const {verify_email_token} = request.params
    //Verificar el token
    const {email} = jwt.verify(
        verify_email_token,
        ENVIRONMENT.JWT_SECRET_KEY
    )

    const user_found = await user_repository.getByEmail(email)

    //Si no existe el usuario error
    if(!user_found){
        throw new ServerError('Usuario no encontrado', 404)
    }

    if(!user_found.activo){
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    //Si ya estas verificado deja de intentar verificarte
    if(user_found.email_verificado){
        throw new ServerError('Ya estas verificado', 400)
    }

    //Actualizamos al usuario para verificarlo
    await user_repository.updateById(
        user_found._id, 
        {
            email_verificado: true
        }
    )

    return response.status(200).send(
        {
            ok: true, 
            status: 200,
            message: 'Usuario verificado exitosamente'
        }
    )
}