/*
Script para desencriptar el campo body_encriptado de los logs del logger.

Uso (desde la carpeta Backend):
    node scripts/descifrar-log.js "valor_base64_del_campo_body_encriptado"

Para sacar el valor, buscan el documento en la coleccion RequestLog y copian
el contenido del campo body_encriptado (incluyendo las comillas si vienen del
shell, mejor sin comillas internas).
*/
import { decryptLogBody } from '../src/utils/logger-crypto.util.js'

const payload = process.argv[2]

if (!payload) {
    console.error('Falta el valor encriptado. Uso: node scripts/descifrar-log.js "valor_base64"')
    process.exit(1)
}

try {
    console.log(JSON.stringify(decryptLogBody(payload), null, 4))
}
catch (error) {
    console.error('No se pudo desencriptar el valor:', error.message)
    process.exit(1)
}
