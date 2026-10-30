## ADDED Requirements

### Requirement: Baraja y reparto de la Sueca
La Sueca MUST jugarse entre 4, en parejas: los asientos 0 y 2 contra 1 y 3. Se usan 40 cartas francesas: A, 2 a 7, J, Q y K de cada palo. El orden, de mayor a menor, MUST ser A, 7, K, J, Q, 6, 5, 4, 3 y 2. En cada mano, cada jugador MUST recibir 10 cartas. La última carta del repartidor se enseña a todos: su palo es el triunfo de la mano, y la carta sigue en la mano del repartidor, a la vista, hasta que la juega. El repartidor de la primera mano es el asiento 3 y pasa al siguiente en cada mano. Sale el jugador siguiente al repartidor.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 10 cartas, no quedan cartas y el triunfo es el palo de la carta del repartidor que se ve

#### Scenario: Carta del triunfo
- **WHEN** el repartidor juega la carta del triunfo
- **THEN** deja de verse en su mano, y el triunfo sigue siendo el mismo hasta el final de la mano

### Requirement: Bazas de la Sueca
Cada jugador MUST seguir el palo de salida si puede; si no, MAY jugar cualquier carta. La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida. El ganador sale en la siguiente baza.

#### Scenario: El 7 gana al Rey
- **WHEN** sale el Rey de picas y otro jugador echa el 7 de picas, sin triunfos en la baza
- **THEN** gana el 7 de picas

#### Scenario: Fallar
- **WHEN** salen corazones, el triunfo es tréboles y un jugador sin corazones echa el 2 de tréboles
- **THEN** gana la baza, salvo que alguien eche un triunfo más alto

#### Scenario: Seguir el palo
- **WHEN** salen diamantes y el jugador tiene diamantes
- **THEN** solo puede jugar diamantes

### Requirement: Puntos de la mano de la Sueca
Las cartas MUST valer: A 11, 7 10, K 4, J 3 y Q 2; las demás, nada. En total suman 120. Al acabar las 10 bazas, cada pareja suma los puntos de las cartas de sus bazas. La pareja que más tiene MUST ganar juegos:
- con 61 a 90 puntos, 1 juego;
- con 91 a 119, 2 juegos;
- con los 120, 4 juegos.

Con 60 a 60, nadie MUST ganar juegos.

#### Scenario: Una mano normal
- **WHEN** una pareja hace 75 puntos
- **THEN** gana 1 juego

#### Scenario: Más de 90
- **WHEN** una pareja hace 95 puntos
- **THEN** gana 2 juegos

#### Scenario: Todas
- **WHEN** una pareja se lleva los 120 puntos
- **THEN** gana 4 juegos

#### Scenario: Empate
- **WHEN** cada pareja hace 60 puntos
- **THEN** ninguna gana juegos y se reparte la siguiente mano

### Requirement: Partida de la Sueca
La partida MUST terminar cuando una pareja llega a 4 juegos o más; esa pareja gana.

#### Scenario: Fin de la partida
- **WHEN** una pareja con 3 juegos gana otro
- **THEN** la partida termina y gana esa pareja

### Requirement: Vista de la Sueca
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno;
- el triunfo y la carta del triunfo mientras el repartidor no la juegue;
- la baza en curso y la última baza;
- las cartas jugadas en la mano y los palos que cada uno no ha seguido;
- los puntos de cartas de cada pareja en la mano;
- los resultados de las manos anteriores y los juegos.

Cada jugador MUST NOT ver las manos de los demás, salvo la carta del triunfo del repartidor.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás y la carta del triunfo, pero no el resto
