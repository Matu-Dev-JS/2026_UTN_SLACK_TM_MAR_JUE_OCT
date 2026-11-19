import mongoose from 'mongoose'

/*
Modelo de log de consultas del servidor (Logger).
Registra el flujo de consultas que recibe la API:
IP, URL, endpoint, metodo, timestamp, status de respuesta y tiempo de ejecucion.
El body solo se guarda cifrado (AES-256-GCM) en POST/PUT/DELETE, y NUNCA en rutas
bajo /api/auth ni en GET (ver logger.middleware.js).
*/
const requestLog_schema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true
        },
        user_agent: {
            type: String,
            default: null /* Navegador/cliente que hizo la consulta (header User-Agent). Se recorta a 512 caracteres */
        },
        url: {
            type: String,
            required: true /* URL completa consultada (incluye query string) */
        },
        endpoint: {
            type: String,
            required: true /* Ruta consultada sin query string */
        },
        metodo: {
            type: String,
            required: true
        },
        fk_id_usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            default: null /* Null en consultas publicas (sin autenticacion) */
        },
        status_code: {
            type: Number,
            required: true
        },
        body_encriptado: {
            type: String,
            default: null /* Body cifrado (AES-256-GCM) solo en POST/PUT/DELETE; null en GET y en endpoints excluidos por seguridad */
        },
        tiempo_ejecucion_ms: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
)

export const REQUEST_LOG_COLLECTION_NAME = 'RequestLog'
const RequestLog = mongoose.model(REQUEST_LOG_COLLECTION_NAME, requestLog_schema)
export default RequestLog
