import connectMongoDB from "./config/mongo.config.js";

//connectMongoDB()


import express from 'express'
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
import auth_router from "./routes/auth.router.js";
import user_router from "./routes/user.router.js";
import workspace_router from "./routes/workspace.router.js";
import cors from 'cors'
import ENVIRONMENT from "./config/environment.config.js";


const PORT = ENVIRONMENT.PORT
const app = express()


app.use(cors())
app.use(express.json())

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

