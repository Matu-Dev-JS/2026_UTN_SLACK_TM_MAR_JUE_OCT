
/* 

NO TODOS LOS ERRORES SON IGUALES, EN BACKEND VAMOS A TENER 2 GRANDES TIPOS DE ERROR:
- Incontrolables => API RESPONDE 500 Internal server error
- Controlados => Son errores que si estan contemplados API lanzara el ServerError con mensaje y estatus

*/

/* 
Un server error son errores contemplados del lado del servidor
Los vamos a diferenciar de los errores comunes porque tienen status
*/
class ServerError extends Error{
    constructor(message, status){
        super(message)
        this.status = status
    }
}

export default ServerError

/* 
throw sirve para lanzar errores en JS
*/

/* export function saludar(nombre){
    try{
        if(!nombre){

            //Lanzo un error propio, con su propio mensaje
            throw new Error('Nombre no es valido')
        }

    }
    catch(error){
        console.error(error)
    }
} */

