## ADDED Requirements

### Requirement: IA del Barbu con el número del dominó elegido
Con la opción del número elegido, la IA básica del Barbu MUST:
- al elegir el número, quedarse con el que más cartas le deja soltar: las que tiene de ese número más las seguidas a ellas en su palo, hacia arriba y hacia abajo; a igualdad, el más cercano al 8, y si no, el más bajo;
- al decidir si elige el dominó, valorarlo con el mejor número;
- al jugar el dominó, contar las filas desde el número elegido.

Con la opción, la IA básica MUST cumplir las mismas garantías y ganar a jugadores al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Elige el número con más cartas
- **WHEN** con la opción la IA elige el número, y tiene tres sietes, el 8 y el 6 de picas, y una sola carta de cada uno de los demás números
- **THEN** elige el 7

#### Scenario: Partidas con el número elegido
- **WHEN** se juegan partidas de Barbu con la opción entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal
