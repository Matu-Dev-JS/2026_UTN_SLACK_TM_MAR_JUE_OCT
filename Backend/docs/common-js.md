# Common JS

Los proyectos antiguos de node.js permitian la importacion y exportacion de modulos mediante common.js

## Exportacion
Para exportar marcabas una sola vez en el modulo que exporta el module.exports al final y le asignabas un objeto.

module.exports = {}

## Importacion
Para importar usamos require() y pasabamos como parametro la direccion relativa del modulo a importar.

require("./math.js")

esta funcion te devuelve el objeto de exportacion marcado en el modulo importado.