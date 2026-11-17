import RequestLog from '../models/requestLog.model.js'
import { encryptLogBody } from '../utils/logger-crypto.util.js'
import ENVIRONMENT from '../config/environment.config.js'

/*
Middleware de Logger (Oficina de registro de consultas)
Registra cada consulta que recibe el servidor en la coleccion RequestLog:
IP, URL, endpoint, metodo, timestamp, status de respuesta, tiempo de ejecucion y user_id si requiere autenticacion.

Body:
- En consultas POST, PUT y DELETE se guarda el body CIFRADO con LOGGER_PRIVATE_KEY (AES-256-GCM)
- Por seguridad NO se registra el body (queda en null) en login, registro y reset de contrasena
- En consultas GET no se registra el body

El log se escribe en el evento 'finish' de la respuesta, es decir cuando ya fue enviada.
En ese momento el middleware de auth ya corrio, por lo que si la consulta requería
autenticacion podemos guardar el user_id (req.user); en rutas publicas queda en null.
*/

/* Metodos de escritura cuyos bodies se registran cifrados */
const LOG_BODY_METHODS = new Set(['POST', 'PUT', 'DELETE'])

/* Endpoints sensibles cuyo body NUNCA se registra, contengan credenciales o tokens */
const LOG_BODY_EXCLUDED_ENDPOINTS = new Set([
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password'
])

/*
Normaliza el path para compararlo contra la lista de exclusiones:
minusculas y sin slash final, porque el router de Express acepta /api/auth/login,
/api/auth/login/ y /API/AUTH/LOGIN como la misma ruta
*/
function normalizarPath (path) {
    const sin_query = path.split('?')[0]
    const sin_slash_final = sin_query.replace(/\/+$/, '')
    return sin_slash_final.toLowerCase()
}

/* Decide si para esa consulta corresponde registrar el body cifrado */
function shouldLogBody (metodo, path) {
    if (!LOG_BODY_METHODS.has(metodo)) {
        return false
    }

    if (LOG_BODY_EXCLUDED_ENDPOINTS.has(normalizarPath(path))) {
        return false
    }

    return true
}

/* Para avisar una sola vez si falta la key y no llenar la consola de warnings */
let key_warning_emitido = false

function obtenerBodyEncriptado (request) {
    if (!shouldLogBody(request.method, request.path)) {
        return null
    }

    if (!request.body || Object.keys(request.body).length === 0) {
        return null
    }

    if (!ENVIRONMENT.LOGGER_PRIVATE_KEY) {
        if (!key_warning_emitido) {
            console.warn('[Logger]: Hay bodies que no se registran porque LOGGER_PRIVATE_KEY no esta definida en el .env')
            key_warning_emitido = true
        }
        return null
    }

    try {
        return encryptLogBody(request.body)
    }
    catch (error) {
        console.error('[Logger]: Error encriptando el body:', error.message)
        return null
    }
}

function loggerMiddleware (request, response, next) {

    const inicio = Date.now()

    response.on('finish', () => {

        try {
            //Priorizamos la IP real detras de un proxy, si no hay usamos la de la conexion
            const ip = request.headers['x-forwarded-for']?.split(',')[0].trim() || request.ip

            RequestLog.create({
                ip: ip,
                url: request.originalUrl,
                endpoint: request.path,
                metodo: request.method,
                fk_id_usuario: request.user?.id ?? null,
                status_code: response.statusCode,
                body_encriptado: obtenerBodyEncriptado(request),
                tiempo_ejecucion_ms: Date.now() - inicio,
                timestamp: new Date()
            }).catch(error => {
                //Si falla el log NO afectamos la respuesta del usuario
                console.error('[Logger]: Error guardando el log de la consulta:', error.message)
            })
        }
        catch (error) {
            console.error('[Logger]: Error armando el log de la consulta:', error.message)
        }
    })

    next()
}

export default loggerMiddleware
export { shouldLogBody }
