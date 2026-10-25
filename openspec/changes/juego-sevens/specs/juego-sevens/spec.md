## ADDED Requirements

### Requirement: Reparto y salida del Sevens
El Sevens MUST jugarse con la baraja francesa de 52 cartas y de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta. En cada mano se MUST repartir toda la baraja, una a una, empezando por el jugador a la izquierda del repartidor, así que algunos pueden tener una carta más. La mano MUST abrirla quien tiene el 7 de diamantes, y su única jugada legal MUST ser ese 7. El repartidor rota cada mano.

#### Scenario: Reparto de 5 jugadores
- **WHEN** empieza una mano de 5 jugadores
- **THEN** dos jugadores tienen 11 cartas y tres tienen 10, sin repetir ninguna

#### Scenario: Primera jugada
- **WHEN** empieza una mano
- **THEN** el turno es de quien tiene el 7 de diamantes y solo puede jugar esa carta

### Requirement: Escaleras del Sevens
En la mesa, cada palo MUST formar una escalera que empieza por su 7. Se MUST poder poner el 7 de un palo que aún no está en la mesa, y alargar la escalera de un palo con la carta siguiente a uno de sus extremos, en el orden As, 2… 10, J, Q y K. Ninguna otra carta es legal.

#### Scenario: Alargar por los dos lados
- **WHEN** la escalera de corazones va del 5 al 9 y el jugador tiene el 4 y el 10 de corazones
- **THEN** puede jugar el 4 y el 10 de corazones

#### Scenario: Palo sin abrir
- **WHEN** el 7 de picas no está en la mesa y el jugador tiene el 8 de picas
- **THEN** el 8 de picas no es una jugada legal

### Requirement: Jugar es obligatorio en el Sevens
Si el jugador en turno tiene alguna carta legal, MUST jugar una. Si no tiene ninguna, su única acción legal MUST ser pasar. Después de jugar o pasar, el turno pasa al siguiente jugador.

#### Scenario: No se puede pasar con jugada
- **WHEN** el jugador en turno tiene una carta legal
- **THEN** pasar no está entre sus acciones legales

### Requirement: Fin de la mano y partida del Sevens
La mano MUST terminar en cuanto un jugador se queda sin cartas. Cada uno de los demás MUST sumar 1 punto por cada carta que le queda. El resultado de la mano MUST registrar quién se quedó sin cartas, las cartas que le quedaron a cada uno y los totales.

Al terminar una mano en la que alguien llega a 50 puntos o más, la partida MUST terminar: gana el jugador o los jugadores con menos puntos.

#### Scenario: Fin de una mano
- **WHEN** un jugador juega su última carta y a los otros les quedan 3, 5 y 8
- **THEN** la mano termina, y los otros suman 3, 5 y 8 puntos

#### Scenario: Fin de la partida
- **WHEN** termina una mano y los totales quedan en 52, 30, 41 y 19
- **THEN** la partida termina y gana el jugador que tiene 19 puntos

### Requirement: Vista del jugador en el Sevens
La vista de cada jugador MUST mostrar su mano, el número de cartas de los demás, los extremos de la escalera de cada palo, de quién es el turno, quién reparte, la última acción, los resultados de las manos anteriores y los totales. MUST NOT mostrar las cartas en mano de los demás.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás
