import express from 'express'
import { getUserById, getUsers } from '../controllers/user.controller.js'

const user_router = express.Router()

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lista todos los usuarios
 *     description: |
 *       Devuelve todos los documentos de la coleccion Usuario, tal como estan
 *       guardados en MongoDB (incluye el hash de la contrasena).
 *       NOTA: hoy no esta protegido por autenticacion, cualquier cliente puede
 *       consultar la lista completa.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *             example:
 *               message: Get users list
 *               ok: true
 *               status: 200
 *               data:
 *                 users:
 *                   - _id: 6aabff9a190ff6061955c889
 *                     nombre: maria
 *                     email: maria@mail.com
 *                     password: $2b$10$KIX8wJ0QyQ2wG6G6QoC4u.9mXlS7v1ZxP5X9cGvBqk3N2mR1sT6uK
 *                     fecha_creacion: '2026-09-17T14:56:26.249Z'
 *                     activo: true
 *                     email_verificado: true
 *       500:
 *         $ref: '#/components/responses/ServerError500'
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
user_router.get(
    '/',
    getUsers
)

/**
 * @openapi
 * /api/users/{user_id}:
 *   get:
 *     summary: Obtiene un usuario por su id
 *     description: |
 *       Busca el usuario por ObjectId de MongoDB y devuelve el documento
 *       completo (incluye el hash de la contrasena). NOTA: hoy no esta
 *       protegido por autenticacion.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId del usuario en MongoDB
 *         example: 6aabff9a190ff6061955c889
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 status: { type: 'integer' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               message: Get user details successfully
 *               status: 200
 *               ok: true
 *               data:
 *                 user:
 *                   _id: 6aabff9a190ff6061955c889
 *                   nombre: maria
 *                   email: maria@mail.com
 *                   password: $2b$10$KIX8wJ0QyQ2wG6G6QoC4u.9mXlS7v1ZxP5X9cGvBqk3N2mR1sT6uK
 *                   fecha_creacion: '2026-09-17T14:56:26.249Z'
 *                   activo: true
 *                   email_verificado: true
 *       404:
 *         description: No existe un usuario con ese id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 404
 *               message: User not found
 *       500:
 *         description: |
 *           Error inesperado. Si el id no tiene formato de ObjectId de MongoDB,
 *           Mongoose lanza CastError y el middleware responde 500 generico.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               ok: false
 *               status: 500
 *               message: Internal server error
 *       503:
 *         $ref: '#/components/responses/ServiceUnavailable503'
 */
user_router.get(
    '/:user_id',
    getUserById
)

export default user_router
