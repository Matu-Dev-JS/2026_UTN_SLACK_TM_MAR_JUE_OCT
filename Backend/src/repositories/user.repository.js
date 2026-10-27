/* 
Un repository es donde manejamos la comunicacion con nuestros datos (Generalmente la DB)
*/

import { pool } from "../config/mysql.config.js"
import UserDTO from "../dto/user.dto.js"
import User from "../models/user.model.js"

class UserRepository {

    async create(nombre, email, password) {
        await User.create({ nombre: nombre, email: email, password: password })
    }

    /* 
    INSERT INTO usuarios (nombre, email, password) VALUES ('pepe', 'pepe@gmail.com', 'pepe123')
    */
    //Version SQL
    /* async create (nombre, email, password){
        let query_sql = `INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)`
        
        //- pool.execute sanitiza los valores a inyectar en la query 
        //- devuelve un array con [resultado, tablas]
       
        const [result] = await pool.execute(
            query_sql,
            [
                nombre,
                email, 
                password
            ]
        )
        console.log('[UserRepository.create]:', result)
        return result.insertId
        
    } */

   /*  async get(){
        const [result] = await pool.execute(`SELECT * FROM usuarios`)
        console.log('[UserRepository.get]:', result)
        const result_formatted = result.map(
            (user)=> {
                return new UserDTO(
                    user.id,
                    user.nombre,
                    user.email,
                    user.password,
                    user.activo,
                    user.fecha_creacion
                )
            }
        )
        return result_formatted
    } */

 
    //MONGO DB
    async get() {
        const result = await User.find()
        return result
    }

    async getByCreationDate(min_date, max_date){
        const result = await User.find({
            fecha_creacion: {
                $gte: new Date(min_date), //Establece una fecha minima
                $lt: new Date(max_date) //Establece una fecha maxima
            }
        })
        return result
    }

    async getByName(name){
        const result = await User.find({
            nombre: name, 
            activo: true
        })

        return result
    }

    async getBySearchTerm(term){
        const result = await User.find({
            nombre: {
                $regex: term,
                $options: 'i' //Permite buscar de forma 'no case sensitive' (Sin diferenciar entre mayus y minus)
            }, 
            activo: true
        })
        .limit(5)

        return user
    }

    
    //MongoDB
   async getById (user_id){
        const result = await User.findById(user_id)
    
        return result
    }

    //MYSQL

    /* async getById(user_id){
        const [result] = await pool.execute(
            'SELECT * FROM usuarios WHERE id = ?',
            [user_id]
        )
        
        const user_found = result[0]
        console.log('[UserRepository.get]:', user_found)

        if(user_found){
            return new UserDTO(
                user_found.id,
                user_found.nombre,
                user_found.email,
                user_found.password,
                user_found.activo,
                user_found.fecha_creacion
            )
        }
        else{
            return null
        }
    } */

    async softDeleteById(user_id){
        const result = await User.findByIdAndUpdate(user_id, {activo: false})
        console.log(result)
    }

    async deleteById (user_id){
        const result = await User.findByIdAndDelete(user_id)
        console.log(result)
    }
    
    async  getByEmail (email){
    
        //Te devuelve null (si no encuentra) o un objeto con el resultado
        const result = await User.findOne({email: email})
        return result
    } 

    async updateById (user_id, update_data) {
        return await User.findByIdAndUpdate(
            user_id,
            update_data
        )
    }
    
}

//El UserRepostory es un sigleton, solo tiene una instancia
const user_repository = new UserRepository()

export default user_repository