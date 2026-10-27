
/* 

JS es un lenguaje programacion
En JS existen 2 tipos de funciones: Sincronica / Asincronica
Las diferenciamos porque en su declaracion llevan el async o no
*/
/* 
En JS las promises (promesas) se inventaron para poder manejar procesos asincronicos
Basicamente son un objeto con un estado interno
Ese estado puede ser:
    - pending: El proceso esta ocurriendo aun 
    - resolved: El proceso finalizo exitosamente
    - rejected: El proceso se interrumpio y finalizo
*/


/* async function getUsers() {
    try {
        console.log("Obteniendo usuarios")
        //mediante fetch podemos emitir consultas HTTP
        const result = await fetch(
            'https://jsonplaceholder.typicode.com/users',
            {
                method: 'GET'
            }
        )
        //Transformamos el contenido de la respuesta en JSON
        const content = await result.json()
        console.log("El contenido del fetch es:", content[0].name)
    }
    catch (error) {
        console.log("Hubo un error:", error)
    }
}

getUsers()
console.log('Operacion importante') */
