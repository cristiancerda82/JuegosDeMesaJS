# juego-tressette Specification

## Purpose
TBD - created by archiving change juego-tressette. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Tressette
El Tressette MUST jugarse entre 4, en parejas: los asientos 0 y 2 contra 1 y 3. Se usa la baraja española de 40 cartas. El orden, de mayor a menor, MUST ser 3, 2, As, rey, caballo, sota, 7, 6, 5 y 4. En cada mano, cada jugador MUST recibir 10 cartas y no queda mazo. El repartidor de la primera mano es el asiento 3 y pasa al siguiente en cada mano. Sale el jugador siguiente al repartidor.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 10 cartas, no quedan cartas y sale el jugador siguiente al repartidor

### Requirement: Bazas del Tressette
No hay triunfo. Cada jugador MUST seguir el palo de salida si puede; si no, MAY jugar cualquier carta. La baza la MUST ganar la carta más alta del palo de salida. El ganador sale en la siguiente baza.

#### Scenario: El 3 gana al As
- **WHEN** sale el As de copas y otro jugador echa el 3 de copas
- **THEN** gana el 3 de copas, que es la carta más alta del palo

#### Scenario: Sin palo no se gana
- **WHEN** salen oros y un jugador sin oros echa el 3 de espadas
- **THEN** no gana la baza, porque no es del palo de salida

#### Scenario: Seguir el palo
- **WHEN** salen bastos y el jugador tiene bastos
- **THEN** solo puede jugar bastos

### Requirement: Puntos de la mano del Tressette
Las cartas MUST valer: el As 1 punto; el 3, el 2, el rey, el caballo y la sota, un tercio de punto; las demás, nada. Quien gana la última baza MUST sumar 1 punto más para su pareja. Al acabar las 10 bazas, cada pareja suma los puntos de las cartas de sus bazas y MUST anotar solo los puntos enteros, sin los tercios sobrantes. Entre las dos parejas siempre suman 11.

#### Scenario: Tercios sobrantes
- **WHEN** una pareja se lleva 2 Ases, 7 cartas de un tercio y la última baza
- **THEN** tiene 5 puntos y un tercio, y anota 5; la otra anota 6

#### Scenario: Todas las bazas
- **WHEN** una pareja se lleva las 10 bazas
- **THEN** anota 11 y la otra 0

### Requirement: Partida del Tressette
Al acabar cada mano, si alguna pareja tiene 21 puntos o más y más que la otra, la partida MUST terminar y gana esa pareja. Si las dos llegan a 21 con los mismos puntos, o ninguna llega, se reparte otra mano.

#### Scenario: Fin de la partida
- **WHEN** una pareja con 15 puntos anota 7 en una mano y la otra queda en 19
- **THEN** la partida termina y gana la pareja con 22

#### Scenario: Las dos pasan de 21
- **WHEN** tras una mano una pareja tiene 23 y la otra 21
- **THEN** gana la pareja con 23

#### Scenario: Empate por encima de 21
- **WHEN** tras una mano las dos parejas tienen 22
- **THEN** se reparte otra mano

### Requirement: Vista del Tressette
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno;
- la baza en curso y la última baza;
- las cartas jugadas en la mano y los palos que cada uno no ha seguido;
- los puntos de cartas de cada pareja en la mano, con los tercios;
- los resultados de las manos anteriores y los puntos de la partida.

Cada jugador MUST NOT ver las manos de los demás.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás, pero no cuáles
