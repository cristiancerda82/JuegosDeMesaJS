# juego-culo Specification

## Purpose
TBD - created by archiving change juego-culo. Update Purpose after archive.

## Requirements

### Requirement: Reparto del Culo
El Culo MUST jugarse con la baraja española de 40 cartas y de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta. En cada mano se MUST repartir todas las cartas una a una; en la primera mano empezando por el asiento 0, y en las siguientes por el culo de la mano anterior. Así, los primeros en recibir pueden tener una carta más.

El orden de las cartas, de menor a mayor, MUST ser: 3, 4, 5, 6, 7, sota, caballo, rey, As y 2. Los palos no cuentan.

#### Scenario: Reparto con 6 jugadores
- **WHEN** empieza una partida de 6 jugadores
- **THEN** los asientos 0 a 3 tienen 7 cartas y los asientos 4 y 5 tienen 6

#### Scenario: El 2 es la carta más alta
- **WHEN** se comparan un 2 y un As
- **THEN** el 2 es más alto

### Requirement: Rondas del Culo
Quien abre una ronda MUST jugar de 1 a 4 cartas del mismo valor; no puede pasar. Después, por turno, cada jugador que sigue en la mano MUST jugar el mismo número de cartas de un único valor más alto que el de la última jugada, o pasar. Pasar no saca al jugador de la ronda: si le vuelve a tocar, puede jugar.

Cuando, tras una jugada, todos los demás jugadores que siguen en la mano pasan seguidos, la ronda se MUST limpiar y abre la siguiente quien hizo esa jugada. Si quien jugó el último ya ha salido de la mano, abre el siguiente jugador después de él que siga en la mano.

En la primera mano MUST abrir quien tiene el 3 de oros; en las siguientes, el culo de la mano anterior.

#### Scenario: Superar con el mismo número de cartas
- **WHEN** la última jugada son dos cincos
- **THEN** jugar dos sietes es legal, y jugar un siete o tres sietes no lo es

#### Scenario: Igual no supera
- **WHEN** la última jugada es un caballo
- **THEN** jugar otro caballo no es legal

#### Scenario: Todos pasan
- **WHEN** el asiento 1 juega un rey y los otros tres jugadores pasan seguidos
- **THEN** la ronda se limpia y el asiento 1 abre la siguiente con lo que quiera

#### Scenario: Pasar y volver a jugar
- **WHEN** el asiento 2 pasa ante un 5, y el asiento 3 juega un 6 antes de que todos pasen
- **THEN** cuando vuelve a tocarle, el asiento 2 puede jugar un valor más alto que el 6

#### Scenario: Abre el 3 de oros
- **WHEN** empieza la primera mano y el asiento 2 tiene el 3 de oros
- **THEN** le toca abrir al asiento 2

### Requirement: Cortar con doses
Jugar doses MUST limpiar la ronda al instante, sin que los demás puedan responder, y abre la siguiente quien los jugó. Si con esos doses se quedó sin cartas, abre el siguiente jugador después de él que siga en la mano.

#### Scenario: Cortar
- **WHEN** la última jugada son dos ases y el asiento 0 juega dos doses
- **THEN** la ronda se limpia y el asiento 0 abre la siguiente

### Requirement: Salida y puestos del Culo
Quien se queda sin cartas MUST salir de la mano con el siguiente puesto libre, empezando por el primero. Cuando solo queda un jugador con cartas, la mano MUST terminar y ese jugador queda el último.

Los puestos MUST dar estos cargos:
- el primero, presidente; el último, culo;
- con 4 jugadores o más, el segundo, vicepresidente, y el penúltimo, viceculo;
- con 5 o 6, los del medio no tienen cargo.

Cada puesto MUST dar puntos: el último 0, el penúltimo 1, y así hasta el primero, que suma N − 1 con N jugadores.

#### Scenario: Fin de una mano de 4
- **WHEN** en una mano de 4 jugadores salen por orden los asientos 2, 0 y 3
- **THEN** la mano termina; el asiento 2 es presidente y suma 3 puntos, el 0 vicepresidente con 2, el 3 viceculo con 1 y el 1 culo con 0

#### Scenario: Sale quien jugó el último
- **WHEN** el asiento 1 juega sus últimas cartas, que no son doses, y los demás pasan
- **THEN** el asiento 1 ha salido y abre la ronda siguiente el siguiente jugador después de él que siga en la mano

### Requirement: Intercambio del Culo
Desde la segunda mano, tras repartir y antes de jugar, se MUST hacer el intercambio con los cargos de la mano anterior:
- el culo da sus 2 cartas más altas al presidente, y el presidente le devuelve 2 cartas a su elección;
- con 4 jugadores o más, el viceculo da su carta más alta al vicepresidente, y este le devuelve 1 carta a su elección.

Las cartas más altas se MUST dar solas, sin que el que las da elija. Si tiene varias empatadas, da cualquiera de ellas, porque los palos no cuentan. Primero devuelve el presidente y después el vicepresidente; el que devuelve puede elegir cualquier carta de su mano, también las que acaba de recibir. Hasta terminar el intercambio no se juega.

#### Scenario: Intercambio de 4 jugadores
- **WHEN** empieza la segunda mano, el culo tiene un 2 y un As como cartas más altas, y el presidente elige devolver un 3 y un 4
- **THEN** el presidente tiene el 2 y el As, el culo tiene el 3 y el 4, y el número de cartas de cada uno no cambia

#### Scenario: Sin intercambio en la primera mano
- **WHEN** empieza la primera mano
- **THEN** no hay intercambio y abre quien tiene el 3 de oros

### Requirement: Fin de la partida del Culo
La partida MUST durar 5 manos. Al terminar la quinta, gana quien más puntos ha sumado; los empates se MUST deshacer por el mejor puesto en la última mano. El resultado MUST registrar los puntos de cada jugador, su posición final y lo que pasó en cada mano: el orden de salida, los cargos y los puntos.

#### Scenario: Gana quien más suma
- **WHEN** tras 5 manos de 4 jugadores el asiento 3 suma 12 puntos y nadie más llega a 12
- **THEN** la partida termina y gana el asiento 3

#### Scenario: Empate a puntos
- **WHEN** tras 5 manos los asientos 0 y 1 empatan con más puntos que nadie y el asiento 1 quedó mejor en la última mano
- **THEN** gana el asiento 1

### Requirement: Vista del jugador en el Culo
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno de los demás;
- la jugada que hay que superar, con quién la hizo, y quién ha pasado desde entonces;
- todas las cartas jugadas en la mano, por quién y en qué orden;
- quién ha salido y con qué puesto, los cargos de la mano anterior, la mano que se juega y el marcador;
- si ha participado en el intercambio, las cartas que ha dado y las que ha recibido.

Las manos de los demás y las cartas que se han cambiado otros jugadores MUST quedar ocultas.

#### Scenario: El intercambio ajeno no se ve
- **WHEN** en una partida de 4 el presidente y el culo se cambian cartas y el vicepresidente pide su vista
- **THEN** ve que el intercambio se ha hecho, pero no qué cartas se cambiaron el presidente y el culo
