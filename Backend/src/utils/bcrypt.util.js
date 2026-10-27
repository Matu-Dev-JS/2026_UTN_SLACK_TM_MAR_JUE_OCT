import bcrypt from 'bcrypt'

export async function generateHash(data){
    const hash = await bcrypt.hash(data, 12)
    return hash
}


export async function compareHash(data, hash){
    //nos permite saber si un hash pertenece a cierto dato
    const result = await bcrypt.compare(data, hash)
    console.log("Resultado de la comparacion:", result)
    return result //True si es correcto, false si es incorrecto
}