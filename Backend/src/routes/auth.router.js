import express from 'express'
import { login, register, verifyEmail } from '../controllers/auth.controller.js'

const auth_router = express.Router()

/* 
Validacion del email del usuario
*/
auth_router.post('/register', register)

/* 
Cuando un usuario inicia sesion debemos crear de alguna forma la sesion
*/
auth_router.post('/login', login)

auth_router.get('/verify-email/:verify_email_token',  verifyEmail)

export default auth_router