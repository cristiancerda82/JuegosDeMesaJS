## ADDED Requirements

### Requirement: Sueca en la suite
El menú MUST incluir la Sueca junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4 en parejas. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Sueca
- **WHEN** el jugador elige la Sueca en el menú y empieza
- **THEN** se abre su mesa con su mano de 10 cartas, su compañero enfrente y el triunfo

### Requirement: Mesa de la Sueca
La mesa de la Sueca MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- el triunfo y la carta del triunfo del repartidor mientras no la juegue;
- la baza en curso;
- los puntos de cartas de cada pareja en la mano y los juegos de cada pareja.

Al acabar cada mano, la mesa MUST mostrar un resumen con los puntos de cada pareja, los juegos que gana y los juegos de cada una.

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano en la que su pareja hace 95 puntos
- **THEN** el resumen muestra 95 a 25 y que su pareja gana 2 juegos

#### Scenario: Fin de la partida
- **WHEN** una pareja llega a 4 juegos
- **THEN** sale la pantalla de fin con la pareja ganadora y los juegos de cada una
