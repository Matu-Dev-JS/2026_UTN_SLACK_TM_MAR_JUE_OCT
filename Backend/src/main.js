import connectMongoDB from "./config/mongo.config.js";

//connectMongoDB()


import express from 'express'
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
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
Registra cada consulta en la coleccion RequestLog (IP, User-Agent, URL, endpoint, metodo, timestamp, status, tiempo de ejecucion y user_id si requiere autenticacion)
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
    HECHO: no se registra el body en ninguna ruta /api/auth (login, register, forgot-password, reset-password, verify-email) ni la query string de esas rutas

- Whitelist/Blacklist 

    Whitelist (Lista Blanca)
        Permir ciertas IPs o dominios me consulten
        Sirve cuando vos sabes que usuario exactamente o que usuarios van a consultar tu servicio
            EJ: 
                - Damos un servicio de informacion de cierto DNI, nuestros clientes compran el servicio para integrarlo en sus aplicaciones, nosotros cobramos por consulta (1000 = 10USD) entonces para seguridad del cliente le pedimos que nos proporcione las IPS desde las va a consultar. Guardamos esas IPs y cuando nos llegue la consulta a su nombre checkeamos que sea de la lista de IPs permitidas, si no lo es, rechazamos la consulta y no cobramos.

    Blacklist (Lista Negra)
        No permitir que ciertas IPs o dominios me consulten
        Sirve cuando recibis ataques DDoS (Denegacion de servicio) junto con el logger podemos detectar IPs sospechosas y automaticamente sumarlas a una lista negras de IPS que ya no responderemos. Podemos marcar IPs bloqueadas temporales o definitivas

- API keys
- Rate limit
- Manejo de archivos
*/