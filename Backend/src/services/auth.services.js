/*
La capa de servicios concentra la LOGICA DE NEGOCIO de cada endpoint:
aqui decidimos que se puede hacer y que no (validaciones, reglas, tokens, mails).

El controller solo se encarga de HTTP (leer request, responder response)
y delega toda esta logica acá.
*/

import ENVIRONMENT from "../config/environment.config.js"
import mailer_transporter from "../config/mailer.config.js"
import user_repository from "../repositories/user.repository.js"
import { compareHash, generateHash } from "../utils/bcrypt.util.js"
import ServerError from "../utils/error.util.js"
import { verificationEmailTemplate, resetPasswordEmailTemplate } from "../utils/email-templates.js"
import jwt from 'jsonwebtoken'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* 
Email invalido / campos faltantes: son errores de negocio que las validaciones
de ambos endpoints comparten, asi que los centralizamos aca
*/
function validateEmail(email) {
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
        throw new ServerError(
            'Email is incorrect',
            400
        )
    }
}

/* 
Helper interno: genera el token de verificacion (JWT de 7 dias)
y envia el mail con el link apuntando al FRONTEND /verify-email?verification_token=...
*/
async function sendVerificationEmailTo(email) {
    const verification_email_token = jwt.sign(
        {
            email: email
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: '7d' // -> expira en 7 dias
        }
    )

    const verification_email_url =
        ENVIRONMENT.URL_FRONTEND
        + '/verify-email?verification_token='
        + verification_email_token

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Verifica tu cuenta",
            html: verificationEmailTemplate(verification_email_url)
        }
    )
}

/* 
Helper interno: genera el token de restablecimiento (JWT de 1 hora)
y envia el mail con el link apuntando al FRONTEND /reset-password?reset_token=...
El token viaja con un "purpose" para que no se pueda usar un token de
verificacion de email como token de reseteo (y viceversa).
*/
async function sendPasswordResetEmailTo(email) {
    const reset_password_token = jwt.sign(
        {
            email: email,
            purpose: 'password_reset'
        },
        ENVIRONMENT.JWT_SECRET_KEY,
        {
            expiresIn: '1h' // -> expira en 1 hora
        }
    )

    const reset_password_url =
        ENVIRONMENT.URL_FRONTEND
        + '/reset-password?reset_token='
        + reset_password_token

    await mailer_transporter.sendMail(
        {
            to: email,
            from: ENVIRONMENT.GMAIL_USER,
            subject: "Restablece tu contrasena",
            html: resetPasswordEmailTemplate(reset_password_url)
        }
    )
}

/* 
REGISTER (lógica del endpoint POST /api/auth/register)
1. valida los datos
2. valida que el email no este usado
3. encripta la password
4. crea el usuario
5. envia el mail de verificacion
*/
export async function registerUser(username, email, password) {
    if (!username || !email || !password) {
        throw new ServerError(
            "Email, password and username is required",
            400
        )
    }

    validateEmail(email)

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

    await sendVerificationEmailTo(email)
}

/* 
LOGIN (lógica del endpoint POST /api/auth/login)
1. valida los datos
2. busca al usuario por email
3. compara la password contra el hash guardado en DB
4. valida que el email este verificado
5. crea el token de acceso (sesion) y lo devuelve al controller
*/
export async function loginUser(email, password) {
    if (
        !email
        || !password
        || typeof email !== "string"
        || typeof password !== "string"
    ) {
        throw new ServerError(
            "Email and password are required",
            400
        );
    }

    validateEmail(email)

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

    if (!user.email_verificado) {
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

    return auth_token
}

/* 
VERIFY EMAIL (lógica del endpoint GET /api/auth/verify-email?verification_token=...)
1. valida que llegue el token
2. decodifica/valida el JWT
3. busca al usuario
4. valida que este activo y no este ya verificado
5. marca el email como verificado
*/
export async function verifyUserEmail(verification_token) {
    if (!verification_token) {
        throw new ServerError('Token de verificacion requerido', 400)
    }

    let token_payload
    try {
        //Verificar el token
        token_payload = jwt.verify(
            verification_token,
            ENVIRONMENT.JWT_SECRET_KEY
        )
    }
    catch (error) {
        throw new ServerError('El token de verificacion es invalido o expiro', 400)
    }

    const user_found = await user_repository.getByEmail(token_payload.email)

    //Si no existe el usuario error
    if (!user_found) {
        throw new ServerError('Usuario no encontrado', 404)
    }

    if (!user_found.activo) {
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    //Si ya estas verificado deja de intentar verificarte
    if (user_found.email_verificado) {
        throw new ServerError('Ya estas verificado', 400)
    }

    //Actualizamos al usuario para verificarlo
    await user_repository.updateById(
        user_found._id,
        {
            email_verificado: true
        }
    )
}

/* 
RESEND VERIFICATION EMAIL (lógica del endpoint GET /api/auth/verify-email/:email/resend)
1. valida el formato del email
2. busca al usuario y SOLO envia el mail si existe, esta activo y no esta verificado
3. respondemos SIEMPRE lo mismo: no revelamos si el email esta registrado,
    desactivado o ya verificado, para que nadie pueda "descubrir" que cuentas existen.
*/
export async function resendVerificationEmail(email) {
    validateEmail(email)

    const user_found = await user_repository.getByEmail(email)

    if (
        user_found
        && user_found.activo
        && !user_found.email_verificado
    ) {
        //Re-creamos el token de verificacion y reenviamos el mail
        await sendVerificationEmailTo(email)
    }
}

/* 
FORGOT PASSWORD (lógica del endpoint POST /api/auth/forgot-password)
1. valida el formato del email
2. busca al usuario y SOLO envia el mail si existe y esta activo
3. respondemos SIEMPRE lo mismo: no revelamos si el email esta registrado,
    igual que en el reenvio de verificacion, para que nadie pueda
    "descubrir" que cuentas existen.
*/
export async function forgotPassword(email) {
    validateEmail(email)

    const user_found = await user_repository.getByEmail(email)

    if (user_found && user_found.activo) {
        //Generamos el token de reseteo y enviamos el mail con el link
        await sendPasswordResetEmailTo(email)
    }
}

/* 
RESET PASSWORD (lógica del endpoint POST /api/auth/reset-password)
1. valida que lleguen el token y la nueva password
2. decodifica/valida el JWT (aca el vencimiento de 1 hora hace su trabajo)
3. valida que el token sea especifico para resetear password
4. busca al usuario y valida que este activo
5. encripta la nueva password y la guarda en DB
   (la comparacion de password/confirmacion la hace el FRONTEND)
*/
export async function resetPassword(reset_token, password) {
    if (!reset_token || typeof reset_token !== 'string') {
        throw new ServerError('Token de restablecimiento requerido', 400)
    }

    if (!password || typeof password !== 'string') {
        throw new ServerError('La nueva contrasena es requerida', 400)
    }

    let token_payload
    try {
        //Verificar el token
        token_payload = jwt.verify(
            reset_token,
            ENVIRONMENT.JWT_SECRET_KEY
        )
    }
    catch (error) {
        throw new ServerError('El token de restablecimiento es invalido o expiro', 400)
    }

    //Un token de verificacion de email no debe poder usarse para resetear la password
    if (token_payload.purpose !== 'password_reset') {
        throw new ServerError('El token de restablecimiento es invalido', 400)
    }

    const user_found = await user_repository.getByEmail(token_payload.email)

    //Si no existe el usuario error
    if (!user_found) {
        throw new ServerError('Usuario no encontrado', 404)
    }

    if (!user_found.activo) {
        throw new ServerError('Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error', 403)
    }

    //Encriptamos la nueva password para que en DB se guarde un dato irreversible
    const password_hash = await generateHash(password)

    await user_repository.updateById(
        user_found._id,
        {
            password: password_hash
        }
    )
}
