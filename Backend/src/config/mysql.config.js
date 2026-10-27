import mysql from 'mysql2/promise' //Nos traemos a promise para trabajar con async await
import ENVIRONMENT from './environment.config.js'


export const pool = mysql.createPool({
    host: ENVIRONMENT.MYSQL_DB_HOST,
    user: ENVIRONMENT.MYSQL_DB_USER,
    password: ENVIRONMENT.MYSQL_DB_PASSWORD,
    database: ENVIRONMENT.MYSQL_DB_NAME,
    port: ENVIRONMENT.MYSQL_DB_PORT,
    connectionLimit: 3, /* Cuantas conexiones como maximo podemos establecer */
    waitForConnections: true, /* Si llegamos al limite de conexiones, esperar a que alguna se libere (En vez de tirar error) */
    queueLimit: 0 /* Infinitas consultas pueden esperar en la cola de espera */
})

export async function testMysqlConnection (){
    try{
        await pool.query('SELECT 1')

        console.log('MYSQL conectado correctamente')
        return 
    }
    catch (error){
        console.error('ERROR en la conexion con MYSQL ', error)
        return 
    }
}

/* 
Esto es una conexion a la DB individual, todas las consultas a tu DB desde esta api se ejecutan desde esta conexion

const connection = mysql.createConnection(
    {
        host: ENVIRONMENT.MYSQL_DB_HOST,
        user: ENVIRONMENT.MYSQL_DB_USER,
        password: ENVIRONMENT.MYSQL_DB_PASSWORD,
        database: ENVIRONMENT.MYSQL_DB_NAME,
        port: ENVIRONMENT.MYSQL_DB_PORT
    }
)

connection.connect(
    //Que hacer cuando se haya intentado conectar
    (error) => {
        //Si hay error
        if(error){
            console.error('Error de conexion:', error)
            return 
        }

        console.log("Conexion a MySQL exitosa")
    }
    
)

export default connection 
*/