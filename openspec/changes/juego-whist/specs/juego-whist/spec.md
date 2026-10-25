## ADDED Requirements

### Requirement: Reparto y triunfo del Whist
El Whist MUST jugarse con 4 jugadores en dos parejas (0 y 2 contra 1 y 3) y la baraja francesa de 52 cartas. En cada mano, el repartidor MUST dar 13 cartas a cada jugador, una a una, empezando por el de su izquierda, así que la última carta es para él. Esa carta MUST descubrirse: su palo es el triunfo de la mano, y todos la ven mientras siga en la mano del repartidor. El repartidor rota cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 13 cartas, y la carta del triunfo está en la mano del repartidor y la ven todos

#### Scenario: El triunfo se juega
- **WHEN** el repartidor juega la carta del triunfo
- **THEN** el palo sigue siendo el triunfo de la mano, y la carta ya no figura como carta del triunfo en su mano

### Requirement: Bazas del Whist
La primera baza la MUST abrir el jugador a la izquierda del repartidor. Cada jugador MUST seguir el palo de salida si tiene; si no, MAY jugar cualquier carta. La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida, con el As como la más alta. Quien gana una baza MUST abrir la siguiente.

#### Scenario: Seguir el palo
- **WHEN** salen corazones y el jugador tiene corazones
- **THEN** solo puede jugar corazones

#### Scenario: Fallar
- **WHEN** salen corazones, el triunfo es picas, y un jugador sin corazones juega el 2 de picas
- **THEN** gana la baza, salvo que otro juegue una pica más alta

### Requirement: Puntos de la mano del Whist
Al acabar las 13 bazas, la pareja que ha hecho más de 6 MUST sumar 1 punto por cada baza por encima de 6; la otra no suma nada. El resultado de la mano MUST registrar las bazas de cada pareja, los puntos que suma y el marcador tras la mano.

#### Scenario: Ocho bazas
- **WHEN** una pareja hace 8 bazas y la otra 5
- **THEN** la primera suma 2 puntos

### Requirement: Juegos y partida del Whist
Un juego MUST ganarlo la primera pareja que llega a 5 puntos al terminar una mano. Los puntos que sobren se pierden: los dos marcadores vuelven a 0 para el juego siguiente. La partida MUST terminar cuando una pareja gana dos juegos, y la gana esa pareja.

#### Scenario: Ganar un juego
- **WHEN** una pareja con 4 puntos hace 9 bazas
- **THEN** gana el juego, y el siguiente juego empieza 0 a 0

#### Scenario: Ganar la partida
- **WHEN** una pareja que ya ha ganado un juego gana otro
- **THEN** la partida termina y la gana esa pareja

### Requirement: Vista del jugador en el Whist
Cada jugador MUST ver:
- su mano;
- cuántas cartas tienen los demás;
- el palo del triunfo, y la carta del triunfo mientras el repartidor no la haya jugado;
- la baza en curso y la última baza;
- las cartas jugadas en la mano, y los palos que cada jugador no ha seguido en ella;
- las bazas de cada jugador, los puntos, los juegos ganados y el resultado de las manos anteriores.

Las manos ajenas MUST quedar ocultas, salvo la carta del triunfo.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** ve la carta del triunfo, pero ninguna otra carta de las manos ajenas
