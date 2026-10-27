import connectMongoDB from "./config/mongo.config.js";
import { testMysqlConnection } from "./config/mysql.config.js";

connectMongoDB()
/* testMysqlConnection() */

import express from 'express'
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
import auth_router from "./routes/auth.router.js";
import user_router from "./routes/user.router.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import workspace_repository from "./repositories/workspace.repository.js";
import member_repository from "./repositories/member.repository.js";
import workspace_router from "./routes/workspace.router.js";
import mailer_transporter from "./config/mailer.config.js";
import ENVIRONMENT from "./config/environment.config.js";
import user_repository from "./repositories/user.repository.js";
import cors from 'cors'


const PORT = 8080

const app = express()

/* 
Deshabilita la cors policy = cualquiera puede consultar
*/
app.use(cors())

app.use(express.json())


/* 
Todas las consultas que lleguen a /api/auth las manejara el auth_router
*/
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


/* mailer_transporter.sendMail(
    {
        to: "mati.dev.gimenez@gmail.com",
        from: ENVIRONMENT.GMAIL_USER,
        subject: 'Mail de prueba',
        html: `
        <body>
            <h1>Esto es un mail de prueba</h1>
        </body>
        `
    }
) */

/* user_repository.create('test-1', 'test-1@gmail.com', 'test123') */

//user_repository.get()

/* user_repository.getById(3) */