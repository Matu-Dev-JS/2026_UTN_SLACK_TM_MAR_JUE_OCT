import express from 'express'
import { login, register, verifyEmail, resendVerificationEmail } from '../controllers/auth.controller.js'

const auth_router = express.Router()

/* 
Validacion del email del usuario
*/
auth_router.post('/register', register)

/* 
Cuando un usuario inicia sesion debemos crear de alguna forma la sesion
*/
auth_router.post('/login', login)

auth_router.get('/verify-email',  verifyEmail)

/*
Reenvio de verificacion: recibimos un email valido y le re-creamos
un token para enviarle devuelta el mail de verificacion
*/
auth_router.get('/verify-email/:email/resend',  resendVerificationEmail)

export default auth_router