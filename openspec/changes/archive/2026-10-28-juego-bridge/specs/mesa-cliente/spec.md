## ADDED Requirements

### Requirement: Bridge en la suite
El menú MUST incluir el Bridge junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y los ciclos de Chicago (1, 2 o 3); se juega siempre entre 4, el jugador con la IA de compañero. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Bridge
- **WHEN** el jugador elige el Bridge en el menú y empieza
- **THEN** se abre su mesa con su mano de 13 cartas, la vulnerabilidad de la mano y la caja de subasta

### Requirement: Mesa del Bridge
La mesa del Bridge MUST mostrar:
- la mano del jugador, los asientos de los demás con cuántas cartas tienen, y la baza en curso en el centro;
- durante la subasta, una caja con el historial de declaraciones por asiento y, en el turno del jugador, una rejilla con las pujas posibles y los botones de pasar, doblar y redoblar cuando se puedan;
- durante el carteo, el contrato con el declarante y el doblo, la vulnerabilidad, las bazas de cada pareja y el marcador;
- la mano del muerto boca arriba en su asiento, desde que se descubre.

Cuando el jugador es el declarante y le toca al muerto, MUST poder tocar las cartas del muerto para jugarlas, y solo esas; cuando el jugador es el muerto, MUST ver cómo juega su compañero sin poder jugar. Al acabar cada mano, MUST mostrarse un resumen con el contrato, si se cumplió, las bazas y los puntos de cada pareja.

#### Scenario: Pujar
- **WHEN** le toca al jugador en la subasta y toca 1 sin triunfo en la rejilla
- **THEN** la puja aparece en el historial y le toca al siguiente

#### Scenario: Jugar por el muerto
- **WHEN** el jugador es el declarante y le toca al muerto
- **THEN** las cartas jugables del muerto se resaltan y, al tocar una, se juega en la baza

#### Scenario: Fin de la partida
- **WHEN** termina el último ciclo
- **THEN** sale la pantalla de fin con la pareja ganadora y los puntos de cada mano
