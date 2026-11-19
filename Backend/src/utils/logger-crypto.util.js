import crypto from 'node:crypto'
import ENVIRONMENT from '../config/environment.config.js'

/*
Util de encriptacion para el logger (AES-256-GCM)

El LOGGER_PRIVATE_KEY del .env puede ser cualquier texto: se deriva una clave
de 32 bytes con SHA-256 para que siempre sea valida para AES-256.

Formato del payload encriptado (base64): IV (12 bytes) + AuthTag (16 bytes) + datos cifrados
El AuthTag garantiza que nadie pueda alterar el dato cifrado sin que falle la desencriptacion.

Como desencriptar un body guardado en los logs:
    import { decryptLogBody } from '../utils/logger-crypto.util.js'
    const body = decryptLogBody('valor_base64_del_campo_body_encriptado')
o por terminal (en la carpeta Backend):
    npm run descifrar-log:db -- <id_del_log>
*/

function deriveKey() {
    return crypto.createHash('sha256').update(String(ENVIRONMENT.LOGGER_PRIVATE_KEY)).digest()
}

function encryptLogBody(body) {
    if (!ENVIRONMENT.LOGGER_PRIVATE_KEY) {
        throw new Error('LOGGER_PRIVATE_KEY no esta definida en el .env')
    }

    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(), iv)

    const datos_cifrados = Buffer.concat([
        cipher.update(JSON.stringify(body), 'utf8'),
        cipher.final()
    ])
    const auth_tag = cipher.getAuthTag()

    return Buffer.concat([iv, auth_tag, datos_cifrados]).toString('base64')
}

function decryptLogBody(payload_encriptado) {
    if (!ENVIRONMENT.LOGGER_PRIVATE_KEY) {
        throw new Error('LOGGER_PRIVATE_KEY no esta definida en el .env')
    }

    const payload = Buffer.from(payload_encriptado, 'base64')

    const iv = payload.subarray(0, 12)
    const auth_tag = payload.subarray(12, 28)
    const datos_cifrados = payload.subarray(28)

    const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(), iv)
    decipher.setAuthTag(auth_tag)

    const datos_descifrados = Buffer.concat([
        decipher.update(datos_cifrados),
        decipher.final()
    ]).toString('utf8')

    return JSON.parse(datos_descifrados)
}

export { encryptLogBody, decryptLogBody }
