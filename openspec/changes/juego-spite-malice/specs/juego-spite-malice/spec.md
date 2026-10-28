## ADDED Requirements

### Requirement: Baraja y reparto del Spite and Malice
El Spite and Malice MUST jugarse con 2 jugadores y dos barajas francesas sin comodines (104 cartas). Al empezar, cada jugador MUST recibir un *montón* de 20 cartas, de las que solo la de arriba está boca arriba, y 5 cartas en la mano. El resto MUST formar el *mazo*, boca abajo. Empieza el jugador 0.

#### Scenario: Reparto
- **WHEN** empieza la partida
- **THEN** cada jugador tiene un montón de 20 cartas con la de arriba a la vista y 5 cartas en la mano, y quedan 54 en el mazo

### Requirement: Escaleras del Spite and Malice
En el centro MUST haber hasta 4 *escaleras* comunes. Una escalera MUST empezar con un As y subir de uno en uno: As, 2, 3… hasta la Q. Un K MUST poder jugarse en cualquier escalera, o para empezar una, valiendo la carta que haga falta. Cuando una escalera llega a la Q, MUST salir de la mesa y guardarse aparte, y su sitio queda libre.

#### Scenario: Empezar una escalera
- **WHEN** hay un sitio libre en el centro y el jugador tiene un As
- **THEN** puede empezar una escalera con él, pero no con otra carta que no sea un As o un K

#### Scenario: El K como comodín
- **WHEN** una escalera va por el 5 y el jugador juega un K en ella
- **THEN** la escalera va por el 6

#### Scenario: Escalera completa
- **WHEN** se juega la Q en una escalera que va por la J
- **THEN** la escalera sale de la mesa y su sitio queda libre

### Requirement: El turno del Spite and Malice
Al empezar su turno, el jugador MUST robar del mazo hasta tener 5 cartas en la mano. Después MAY jugar a las escaleras, una a una, la carta de arriba de su montón, cualquier carta de su mano o la carta de arriba de cualquiera de sus 4 descartes. Si vacía la mano, MUST robar otras 5 y puede seguir jugando. El turno MUST terminar descartando una carta de la mano en uno de sus 4 descartes, sobre cualquier carta. Si no tiene cartas en la mano ni puede robar, MUST pasar el turno. Cuando juega la carta de arriba de su montón, la siguiente MUST quedar boca arriba.

Si el mazo se acaba y hay que robar, las escaleras completas MUST barajarse y formar el mazo nuevo.

#### Scenario: Robar al empezar
- **WHEN** un jugador empieza su turno con 2 cartas en la mano
- **THEN** roba 3 y tiene 5

#### Scenario: Vaciar la mano
- **WHEN** un jugador juega su última carta de la mano a una escalera
- **THEN** roba otras 5 y sigue en su turno

#### Scenario: Terminar el turno
- **WHEN** un jugador descarta una carta en uno de sus descartes
- **THEN** le toca al rival

#### Scenario: Jugar desde el montón
- **WHEN** un jugador juega la carta de arriba de su montón
- **THEN** su montón tiene una carta menos y la siguiente queda a la vista

### Requirement: Fin del Spite and Malice
La partida MUST terminar en cuanto un jugador vacía su montón, y la gana él. Si el mazo y las escaleras completas se acaban y los dos jugadores pasan seguidos sin poder mover, la partida MUST terminar en empate.

#### Scenario: Vaciar el montón
- **WHEN** un jugador juega la última carta de su montón
- **THEN** gana la partida

### Requirement: Vista del jugador en el Spite and Malice
Cada jugador MUST ver:
- su mano y cuántas cartas tiene el rival;
- cuántas cartas quedan en cada montón y la carta de arriba de cada uno;
- todas las cartas de los descartes de los dos;
- las escaleras del centro, con su carta de arriba y el valor por el que van;
- cuántas cartas hay en el mazo y en las escaleras completas.

La mano del rival, las cartas boca abajo de los montones y el mazo MUST quedar ocultos.

#### Scenario: Cartas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene las cartas de la mano del rival, ni las boca abajo de los montones, ni las del mazo
