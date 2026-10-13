## ADDED Requirements

### Requirement: Reparto
Se juega con la baraja española de 40 cartas y de 2 a 4 jugadores. Se MUST repartir toda la baraja, una a una, empezando por el siguiente al repartidor. Con 2 jugadores, cada uno recibe 20 cartas. Con 3, uno recibe 14 y los otros 13. Con 4, cada uno recibe 10.

#### Scenario: Reparto de 3 jugadores
- **WHEN** empieza una mano de 3 jugadores
- **THEN** los jugadores tienen 14, 13 y 13 cartas, sin repetir ninguna

### Requirement: Salida con el 5 de oros
La mano MUST empezarla el jugador que tiene el 5 de oros, y su única jugada legal MUST ser ese 5 de oros.

#### Scenario: Primera jugada
- **WHEN** empieza una mano
- **THEN** el turno es de quien tiene el 5 de oros y solo puede jugar esa carta

### Requirement: Escaleras por palo
En la mesa, cada palo forma una escalera que empieza por su 5. Se MUST poder poner un 5 de un palo que aún no esté en la mesa. Se MUST poder alargar la escalera de un palo con la carta siguiente por arriba o por abajo de sus extremos, en el orden As, 2, 3, 4, 5, 6, 7, Sota, Caballo y Rey. Ninguna otra carta es legal.

#### Scenario: Alargar por arriba tras el 7
- **WHEN** la escalera de copas va del 4 al 7 y el jugador tiene la Sota y el 3 de copas
- **THEN** puede jugar la Sota de copas y el 3 de copas

#### Scenario: Palo sin abrir
- **WHEN** el 5 de espadas no está en la mesa y el jugador tiene el 6 de espadas
- **THEN** el 6 de espadas no es una jugada legal

### Requirement: Jugar es obligatorio
Si el jugador en turno tiene alguna carta legal, MUST jugar una. Si no tiene ninguna, su única acción legal MUST ser pasar. Después de jugar o pasar, el turno pasa al siguiente jugador.

#### Scenario: No se puede pasar con jugada
- **WHEN** el jugador en turno tiene una carta legal
- **THEN** pasar no está entre sus acciones legales

#### Scenario: Pasar
- **WHEN** el jugador en turno no tiene ninguna carta legal
- **THEN** su única acción legal es pasar y el turno pasa al siguiente

### Requirement: Fin de la mano y penalización
La mano MUST terminar en cuanto un jugador se queda sin cartas: ese jugador gana la mano. Cada uno de los demás MUST sumar a su total tantos puntos de penalización como cartas le quedan. El resultado de la mano MUST registrar quién ganó, las cartas que le quedaron a cada uno y los totales.

#### Scenario: Fin de una mano
- **WHEN** un jugador juega su última carta y a los otros les quedan 3 y 5
- **THEN** la mano termina, el ganador suma 0 y los otros suman 3 y 5 puntos

### Requirement: Partida a varias manos
La configuración MUST permitir jugar 1, 3 o 5 manos (3 por defecto). El reparto pasa al siguiente jugador en cada mano. Al terminar la última mano, gana la partida el jugador o los jugadores con menos puntos. La puntuación final de cada uno son sus puntos de penalización.

#### Scenario: Ganador de la partida
- **WHEN** termina la última mano y los totales son 4, 9 y 12
- **THEN** gana el jugador que tiene 4 puntos

### Requirement: Vista del jugador
La vista de cada jugador MUST mostrar su propia mano, el número de cartas de los demás, las escaleras de la mesa (los extremos de cada palo), de quién es el turno, la última acción de cada jugador, los resultados de las manos anteriores y los totales. MUST NOT mostrar las cartas en mano de los demás.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás
