## ADDED Requirements

### Requirement: Big Two en la suite
El menú MUST incluir el Big Two junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Big Two se juega siempre con 4. Como el resto de juegos con IA, el Big Two MUST poder jugarse en red.

#### Scenario: Empezar una partida de Big Two
- **WHEN** el jugador elige el Big Two en el menú y empieza
- **THEN** se abre su mesa con sus 13 cartas ordenadas y tres rivales

### Requirement: Mesa del Big Two
La mesa del Big Two MUST mostrar:
- los rivales, con cuántas cartas tienen, sus puntos y si han pasado en la ronda;
- la última jugada de la mesa, con quién la hizo y su tipo (por ejemplo, «Full»);
- abajo, la mano propia ordenada de menor a mayor.

En su turno, el jugador MUST marcar las cartas que quiere jugar tocándolas. Cuando las marcadas forman una jugada legal, MUST poder jugarlas con «Jugar». Si puede pasar, MUST tener el botón «Paso». La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Jugar una pareja
- **WHEN** el jugador marca dos cartas del mismo número que superan la pareja de la mesa y pulsa «Jugar»
- **THEN** su pareja pasa a ser la última jugada de la mesa

#### Scenario: Cartas que no forman jugada
- **WHEN** el jugador marca un 4 y un 9
- **THEN** «Jugar» está desactivado

### Requirement: Resumen de la mano y fin del Big Two
Al terminar cada mano, la mesa MUST mostrar quién se quedó sin cartas, las cartas que le quedaron a cada uno, los puntos que suman y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y la clasificación.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién ganó la mano y los puntos de cada jugador
