## ADDED Requirements

### Requirement: Tressette en la suite
El menú MUST incluir el Tressette junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4 en parejas y a 21. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Tressette
- **WHEN** el jugador elige el Tressette en el menú y empieza
- **THEN** se abre su mesa con su mano de 10 cartas y su compañero enfrente

### Requirement: Mesa del Tressette
La mesa del Tressette MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- la baza en curso;
- los puntos de cartas de cada pareja en la mano, con los tercios, y los puntos de la partida de cada pareja.

Al acabar cada mano, la mesa MUST mostrar un resumen con los puntos de cartas de cada pareja, quién se llevó la última baza, lo que anota cada una y los puntos de la partida.

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano en la que su pareja hace 5 puntos y un tercio con la última baza
- **THEN** el resumen muestra que su pareja anota 5, que la otra anota 6 y que su pareja se llevó la última baza

#### Scenario: Fin de la partida
- **WHEN** una pareja llega a 21 con más puntos que la otra
- **THEN** sale la pantalla de fin con la pareja ganadora y los puntos de cada una
