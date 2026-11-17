import express from 'express'
import { login, register, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js'

const auth_router = express.Router()

/*
Validacion del email del usuario
*/

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registra un usuario y envia el mail de verificacion
 *     description: |
 *       Crea el usuario con la contrasena encriptada (bcrypt) y envia un mail
 *       con un link de verificacion (JWT de 7 dias). La cuenta queda con
 *       `email_verificado: false` hasta confirmar el mail.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: maria
 *                 description: Nombre de usuario (se guarda como `nombre`)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@mail.com
 *                 description: Debe cumplir el formato de email y ser unico
 *               password:
 *                 type: string
 *                 example: pepe123
 *                 description: Contrasena en texto plano (se guarda como hash bcrypt)
 *     responses:
 *       201:
 *         description: Usuario registrado y mail de verificacion enviado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               ok: true
 *               status: 201
 *               message: User registered successfully
 *       400:
 *         description: Campos faltantes, email con formato invalido o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campos_requeridos:
 *                 summary: Falta alguno de los tres campos
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email, password and username is required
 *               formato_invalido:
 *                 summary: Email con formato invalido
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email is incorrect
 *               email_duplicado:
 *                 summary: El email ya esta registrado
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email is already used
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
auth_router.post('/register', register)

/*
Cuando un usuario inicia sesion debemos crear de alguna forma la sesion
*/

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesion y devuelve el token de sesion
 *     description: |
 *       Valida las credenciales contra la DB, exige que el email este verificado
 *       y firma un JWT de sesion (id, name, email). El token no expira: el
 *       frontend lo guarda y lo envia en `Authorization: bearer <token>`.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@mail.com
 *               password:
 *                 type: string
 *                 example: pepe123
 *     responses:
 *       200:
 *         description: Login exitoso. Devuelve el token de sesion en `data.auth_token`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     auth_token:
 *                       type: string
 *                       description: JWT de sesion firmado (sin expiracion)
 *             example:
 *               ok: true
 *               message: You have logged in successfully
 *               status: 200
 *               data:
 *                 auth_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2...
 *       400:
 *         description: Credenciales faltantes o email con formato invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campos_requeridos:
 *                 summary: Falta email o password (o no son strings)
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email and password are required
 *               formato_invalido:
 *                 summary: Email con formato invalido
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Email is incorrect
 *       401:
 *         description: El email no esta registrado o la contrasena es incorrecta
 *           (mismo mensaje en ambos casos, para no revelar que cuentas existen)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 401
 *               message: Invalid email or password
 *       403:
 *         description: La cuenta existe y la contrasena es valida, pero el email no fue verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: Email no verificado
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
auth_router.post('/login', login)

/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     summary: Verifica el email del usuario con el token del mail
 *     description: |
 *       Endpoint publico al que llega el usuario desde el link del mail
 *       (`{URL_FRONTEND}/verify-email?verification_token=...`). Valida el JWT
 *       de 7 dias, busca al usuario y lo marca con `email_verificado: true`.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: verification_token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT de verificacion recibido por mail (expira en 7 dias)
 *     responses:
 *       200:
 *         description: Email verificado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Usuario verificado exitosamente
 *       400:
 *         description: Token faltante, invalido/expirado, o el usuario ya estaba verificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               token_requerido:
 *                 summary: No se envio el query param
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Token de verificacion requerido
 *               token_invalido:
 *                 summary: El token no es un JWT valido o expiro
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de verificacion es invalido o expiro
 *               ya_verificado:
 *                 summary: El usuario ya habia verificado su email
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Ya estas verificado
 *       403:
 *         description: El usuario existe pero esta desactivado de la plataforma
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error
 *       404:
 *         description: Ningun usuario corresponde al email del token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Usuario no encontrado
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
auth_router.get('/verify-email',  verifyEmail)

/**
 * @openapi
 * /api/auth/verify-email/{email}/resend:
 *   get:
 *     summary: Reenvia el mail de verificacion
 *     description: |
 *       Valida el formato del email y, SOLO si el usuario existe, esta activo
 *       y no esta verificado, genera un nuevo JWT de 7 dias y reenvia el mail.
 *       La respuesta siempre es la misma (no se revela si la cuenta existe),
 *       como medida anti-enumeracion de cuentas.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email de la cuenta a re-verificar
 *         example: maria@mail.com
 *     responses:
 *       200:
 *         description: |
 *           Respuesta uniforme: se envia el mail solo si corresponde.
 *           Nunca se revela si el email esta registrado, desactivado o ya verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Se enviara un mail con los pasos para verificar en caso de que esta cuenta sea real
 *       400:
 *         description: Email con formato invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 400
 *               message: Email is incorrect
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
auth_router.get('/verify-email/:email/resend',  resendVerificationEmail)

/*
Restablecimiento de contrasena:
1. el usuario pide el mail con el link: POST /api/auth/forgot-password
2. el usuario envia el token + nueva password: POST /api/auth/reset-password
*/

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Pide el mail de restablecimiento de contrasena
 *     description: |
 *       Si el email existe y el usuario esta activo, envia un mail con un link
 *       que contiene un JWT de restablecimiento (1 hora, con `purpose: password_reset`).
 *       La respuesta siempre es la misma (no se revela si la cuenta existe).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@mail.com
 *     responses:
 *       200:
 *         description: Respuesta uniforme; el mail solo se envia si la cuenta existe y esta activa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Se enviara un mail con los pasos para restablecer la contrasena en caso de que esta cuenta sea real
 *       400:
 *         description: Email con formato invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 400
 *               message: Email is incorrect
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
auth_router.post('/forgot-password', forgotPassword)

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablece la contrasena con el token del mail
 *     description: |
 *       Valida el JWT de restablecimiento (1 hora y `purpose: password_reset`,
 *       un token de verificacion de email NO sirve aca), busca al usuario,
 *       encripta la nueva contrasena con bcrypt y la guarda. La comparacion
 *       password/confirmacion la hace el frontend.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reset_token, password]
 *             properties:
 *               reset_token:
 *                 type: string
 *                 description: JWT recibido por mail (query `reset_token` del link del frontend)
 *               password:
 *                 type: string
 *                 example: nuevaPassword123
 *                 description: Nueva contrasena en texto plano (se guarda como hash bcrypt)
 *     responses:
 *       200:
 *         description: Contrasena restablecida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             example:
 *               ok: true
 *               status: 200
 *               message: Contrasena restablecida exitosamente, ya podes iniciar sesion con tu nueva contrasena
 *       400:
 *         description: Token o contrasena faltantes, token invalido/expirado, o token de otro proposito
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               token_requerido:
 *                 summary: Falta el token
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: Token de restablecimiento requerido
 *               password_requerida:
 *                 summary: Falta la nueva contrasena
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: La nueva contrasena es requerida
 *               token_invalido:
 *                 summary: Token expirado o no firmado por el backend
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de restablecimiento es invalido o expiro
 *               token_proposito_incorrecto:
 *                 summary: Se uso un token de otro proposito (ej. verificacion de email)
 *                 value:
 *                   ok: false
 *                   status: 400
 *                   message: El token de restablecimiento es invalido
 *       403:
 *         description: El usuario existe pero esta desactivado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 403
 *               message: Usuario esta desactivado de la plataforma, contactate con soporte si consideras que esto es un error
 *       404:
 *         description: Ningun usuario corresponde al email del token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: Usuario no encontrado
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
auth_router.post('/reset-password', resetPassword)

export default auth_router
