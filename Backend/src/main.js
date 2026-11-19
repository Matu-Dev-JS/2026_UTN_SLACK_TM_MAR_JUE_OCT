import connectMongoDB from "./config/mongo.config.js";

//connectMongoDB()


import express from 'express'
import errorHandlerMiddleware from "./middlewares/Error.middleware.js";
import loggerMiddleware from "./middlewares/logger.middleware.js";
import auth_router from "./routes/auth.router.js";
import user_router from "./routes/user.router.js";
import workspace_router from "./routes/workspace.router.js";
import cors from 'cors'
import ENVIRONMENT from "./config/environment.config.js";
import swaggerUi from "swagger-ui-express";
import openapiSpec from "./docs/openapi.config.js";


const PORT = ENVIRONMENT.PORT
const app = express()


app.use(cors())
app.use(express.json())

/*
Documentacion con Swagger UI
- UI interactiva:  GET /api/docs
- Spec descargable: GET /api/docs/openapi.json
*/
app.get('/api/docs/openapi.json', (request, response) => {
    response.json(openapiSpec)
})
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec))

app.use(async (req, res, next) => {
    try {
        await connectMongoDB();
        next();
    } catch (error) {
        console.error("Error conectando MongoDB:", error);

        res.status(503).json({
            message: "No se pudo conectar a la base de datos"
        });
    }
});


/*
Middleware de Logger
Registra cada consulta en la coleccion RequestLog (IP, URL, endpoint, metodo, timestamp, status, tiempo de ejecucion y user_id si requiere autenticacion)
Se monta despues de la conexion a MongoDB y antes de los routers, para que el logger tenga acceso a la DB y pueda registrar todas las consultas
*/
app.use(loggerMiddleware);


app.use('/api/auth', auth_router)
app.use('/api/users', user_router)
app.use('/api/workspaces', workspace_router)

app.use(
    errorHandlerMiddleware
)


app.listen(
    PORT,
    () => {
        console.log(
            `El servidor se esta escuchando correctamente en http://localhost:${PORT}`
        )
    }
)

/* 
- Documentacion con swagger UI (Hecho)
- Logger: Sirve para registrar el flujo de consultas del servidor (no vamos a registrar el body, si se quisiera podrian hacerlo pero encriptando)
    HECHO parcialmente, se registran datos sensibles en rutas sensibles (register, login y reset-password)

- Whitelist/Blacklist 
- API keys
- Rate limit
- Manejo de archivos
*/