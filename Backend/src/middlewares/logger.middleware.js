import RequestLog from '../models/requestLog.model.js'
import { encryptLogBody } from '../utils/logger-crypto.util.js'
import ENVIRONMENT from '../config/environment.config.js'

/*
Middleware de Logger (Oficina de registro de consultas)
Registra cada consulta que recibe el servidor en la coleccion RequestLog:
IP, user-agent, URL, endpoint, metodo, timestamp, status de respuesta, tiempo de ejecucion y user_id si requiere autenticacion.

Body:
- En consultas POST, PUT y DELETE se guarda el body CIFRADO con LOGGER_PRIVATE_KEY (AES-256-GCM)
- Por seguridad NO se registra el body (queda en null) en NINGUNA ruta bajo /api/auth
  (login, register, forgot-password, reset-password, verify-email, etc.), porque transportan
  credenciales, tokens de verificacion y tokens de restablecimiento
- En consultas GET no se registra el body
- En rutas sensibles tampoco se guarda la query string de la URL, porque puede incluir tokens
  (por ejemplo /api/auth/verify-email?verification_token=...)

El log se escribe en el evento 'finish' de la respuesta, es decir cuando ya fue enviada.
En ese momento el middleware de auth ya corrio, por lo que si la consulta requería
autenticacion podemos guardar el user_id (req.user); en rutas publicas queda en null.
*/

/* Metodos de escritura cuyos bodies se registran cifrados */
const LOG_BODY_METHODS = new Set(['POST', 'PUT', 'DELETE'])

/* Largo maximo del User-Agent que guardamos, para evitar logs gigantes */
const USER_AGENT_MAX_LENGTH = 512

/*
Rutas sensibles cuyo body NUNCA se registra, porque transportan credenciales o tokens.
Se excluye todo el arbol /api/auth (login, register, forgot-password, reset-password,
verify-email, resend, etc.), asi cualquier endpoint nuevo bajo esa ruta queda protegido
sin necesidad de agregarlo a mano.
*/
const LOG_BODY_EXCLUDED_PREFIXES = ['/api/auth']

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

/* Indica si la ruta esta dentro de un prefijo sensible (/api/auth o /api/auth/...) */
function esRutaSensible (path) {
    const path_normalizado = normalizarPath(path)

    return LOG_BODY_EXCLUDED_PREFIXES.some(prefijo => {
        return path_normalizado === prefijo || path_normalizado.startsWith(prefijo + '/')
    })
}

/* Decide si para esa consulta corresponde registrar el body cifrado */
function shouldLogBody (metodo, path) {
    if (!LOG_BODY_METHODS.has(metodo)) {
        return false
    }

    if (esRutaSensible(path)) {
        return false
    }

    return true
}

/* Para avisar una sola vez si falta la key y no llenar la consola de warnings */
let key_warning_emitido = false

function obtenerBodyEncriptado (request) {
    /*
    IMPORTANTE: se usa request.originalUrl y NO request.path.
    Express recorta el prefijo del router de req.url/req.path mientras la request esta
    dentro de el (dentro de /api/auth, request.path vale '/login'), y lo restaura recien
    al salir del router. El evento 'finish' se dispara cuando la response se envia, y en
    un caso exitoso eso ocurre TODAVIA dentro del router. Usar request.path hacia que
    /api/auth/login se comparara como '/login' y no coincidiera con la exclusion.
    request.originalUrl nunca se modifica, asi que es la fuente confiable.
    */
    if (!shouldLogBody(request.method, request.originalUrl)) {
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

            /*
            originalUrl nunca cambia, pero puede traer query string.
            Para el campo endpoint guardamos solo el path (sin query).
            */
            const ruta = request.originalUrl.split('?')[0]

            /*
            User-Agent del cliente. Se recorta para que un header gigante no engorde el log.
            Si el cliente no lo envia, queda en null.
            */
            const user_agent_header = request.headers['user-agent']
            const user_agent = user_agent_header
                ? user_agent_header.slice(0, USER_AGENT_MAX_LENGTH)
                : null

            RequestLog.create({
                ip: ip,
                user_agent: user_agent,
                //En rutas sensibles no guardamos la query string: puede traer tokens en la URL
                url: esRutaSensible(ruta) ? ruta : request.originalUrl,
                endpoint: ruta,
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
