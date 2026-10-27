import dotenv from 'dotenv'

/* 
Carga en process.env las variables de entorno definidas en el archivo .env
*/
dotenv.config()

const ENVIRONMENT = {
    MONGO_DB_URI: process.env.MONGO_DB_URI,
    MONGO_DB_NAME: process.env.MONGO_DB_NAME,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    URL_BACKEND: process.env.URL_BACKEND,
    MYSQL_DB_HOST: process.env.MYSQL_DB_HOST,
    MYSQL_DB_USER: process.env.MYSQL_DB_USER,
    MYSQL_DB_PASSWORD: process.env.MYSQL_DB_PASSWORD,
    MYSQL_DB_PORT: process.env.MYSQL_DB_PORT,
    MYSQL_DB_NAME: process.env.MYSQL_DB_NAME,
    PORT: process.env.PORT
}

export default ENVIRONMENT