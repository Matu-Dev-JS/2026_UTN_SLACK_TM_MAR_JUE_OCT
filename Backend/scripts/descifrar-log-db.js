/*
Script para desencriptar el body_encriptado de un log guardado en la coleccion RequestLog.

Uso (desde la carpeta Backend):
    node scripts/descifrar-log-db.js                         # lista los logs que tienen body guardado
    node scripts/descifrar-log-db.js <id>                    # desencripta el body de ese documento
    node scripts/descifrar-log-db.js <id> --json             # idem, pero imprime el JSON crudo
    node scripts/descifrar-log-db.js --all                   # desencripta todos los que tengan body

Requiere LOGGER_PRIVATE_KEY en el .env (la misma clave con la que se encriptaron los logs).

Nota: los logs generados despues del fix ya NO guardan body en rutas /api/auth.
Esto sirve para auditar registros viejos que si lo tengan guardado.
*/
import mongoose from 'mongoose'
import connectMongoDB from '../src/config/mongo.config.js'
import RequestLog from '../src/models/requestLog.model.js'
import { decryptLogBody } from '../src/utils/logger-crypto.util.js'

const argumentos = process.argv.slice(2)
const imprimir_json = argumentos.includes('--json')
const todos = argumentos.includes('--all')
const id = argumentos.find(arg => !arg.startsWith('--')) ?? null

function desencriptar (doc) {
    let body

    try {
        body = decryptLogBody(doc.body_encriptado)
    }
    catch (error) {
        console.error(`  [${doc._id}] No se pudo desencriptar: ${error.message}`)
        return
    }

    console.log(`\n[${doc._id}] ${doc.metodo} ${doc.url}`)
    console.log(`  status: ${doc.status_code} | fecha: ${doc.timestamp?.toISOString?.() ?? doc.timestamp}`)
    console.log('  body:', imprimir_json ? JSON.stringify(body) : JSON.stringify(body, null, 4))
}

async function main () {
    await connectMongoDB()

    /* Sin id ni --all: mostramos que hay disponible para elegir */
    if (!id && !todos) {
        const documentos = await RequestLog.find({ body_encriptado: { $ne: null } })
            .select('_id metodo url timestamp')
            .lean()

        console.log(`Logs con body guardado: ${documentos.length}`)
        documentos.forEach(doc => {
            console.log(`  - ${doc._id} | ${doc.metodo} ${doc.url} | ${doc.timestamp?.toISOString?.() ?? doc.timestamp}`)
        })
        console.log('\nDesencriptar uno: node scripts/descifrar-log-db.js <id>')
        return
    }

    const filtro = todos
        ? { body_encriptado: { $ne: null } }
        : { _id: id, body_encriptado: { $ne: null } }

    if (!todos) {
        if (!/^[a-f0-9]{24}$/i.test(id)) {
            console.error(`El id "${id}" no parece un ObjectId de MongoDB (24 caracteres hexadecimales).`)
            process.exitCode = 1
            return
        }
        /* Evitamos un CastError feo si el id es invalido */
        if (!mongoose.isValidObjectId(id)) {
            console.error(`El id "${id}" no es valido.`)
            process.exitCode = 1
            return
        }
    }

    const documentos = await RequestLog.find(filtro).lean()

    if (documentos.length === 0) {
        console.log('No se encontro ningun log con body guardado para ese criterio.')
        return
    }

    documentos.forEach(desencriptar)
}

main()
    .catch(error => {
        console.error('Error leyendo los logs:', error.message)
        process.exitCode = 1
    })
    .finally(async () => {
        await mongoose.disconnect()
    })
