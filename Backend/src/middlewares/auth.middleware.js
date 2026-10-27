import jwt from 'jsonwebtoken'
import ENVIRONMENT from '../config/environment.config.js'
import ServerError from '../utils/error.util.js'

function authMiddleware (request, response, next){
    try{

        const auth_header = request.headers.authorization 
        if(!auth_header){
            throw new ServerError('Auth header is requered', 400)
        }
    
        const auth_token = auth_header.split(' ')[1] 
        if(!auth_token){
            throw new ServerError('Auth header is malformed', 400)
        }

        const {id, name, email} = jwt.verify(auth_token, ENVIRONMENT.JWT_SECRET_KEY)
        
        request.user = {
            id: id,
            name: name,
            email: email
        }

        next()
    }
    catch(error){
        //Si hubo algun fallo al verificar el token
        if(
            error instanceof jwt.JsonWebTokenError //Falla verificacion o esta mal escrito
            || 
            error instanceof jwt.NotBeforeError //Es un token del futuro
            ||
            error instanceof jwt.TokenExpiredError //Es un token expirado
        ){
            return response.status(401).send({
                ok:false,
                status: 401,
                message: 'Auth token is invalid!'
            })
        }
        
        if(error.status){
            return response.status(error.status).send(
                {
                    ok: false,
                    status: error.status,
                    message: error.message
                }
            )
        }

        console.log('[Middleware de Error]:', error)
        //Error generico
        return response.status(500).send(
            {
                ok: false,
                status: 500,
                message: 'Internal server error'
            }
        )
    }
}

export default authMiddleware