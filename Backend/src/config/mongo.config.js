import mongoose from "mongoose";
import ENVIRONMENT from "./environment.config.js";

async function connectMongoDB () {
    try{
        await mongoose.connect(
            `${ENVIRONMENT.MONGO_DB_URI}/${ENVIRONMENT.MONGO_DB_NAME}`
        )
        console.log('Conexion a MongoDB exitosa!')
    }
    catch(error){
        console.error('Error critico al conectar al MongoDB', error.message)

        /* Crasheo controlado */
        process.exit(1) 
    }
}

export default connectMongoDB



