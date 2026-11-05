## ADDED Requirements

### Requirement: Bourré en la suite
El menú MUST incluir el Bourré junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. La partida es siempre de 15 manos con 100 fichas. Como el resto de juegos con IA, MUST poder jugarse en red con 5 jugadores.

#### Scenario: Empezar una partida de Bourré
- **WHEN** el jugador elige el Bourré y empieza
- **THEN** se abre su mesa con su mano de 5 cartas, la vuelta, el bote y sus fichas

### Requirement: Mesa del Bourré
La mesa del Bourré MUST mostrar:
- la mano del jugador y las de los rivales boca abajo;
- la vuelta y el triunfo;
- el bote, las fichas de cada uno y quién juega o pasa;
- en el cambio, cuántas cartas cambió cada uno;
- la baza en curso y las bazas de cada uno;
- la mano en curso de las 15.

Cuando le toca, el jugador MUST tener:
- para decidir, los botones «Jugar» y «Pasar»;
- en el cambio, tocar las cartas que se descarta y luego «Cambiar» (o «No cambiar»).

Al acabar cada mano, la mesa MUST mostrar un resumen con:
- quién se lleva el bote o si se queda;
- quién hizo bourré;
- las bazas, lo que gana o paga cada uno y sus fichas.

#### Scenario: Jugar y cambiar
- **WHEN** el jugador toca «Jugar» y luego, en su turno de cambio, marca 2 cartas y toca «Cambiar»
- **THEN** sigue con 5 cartas, dos de ellas nuevas

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra quién se lleva el bote y las fichas de cada uno

#### Scenario: Fin de la partida
- **WHEN** acaba la mano 15 o solo queda un jugador con fichas
- **THEN** sale la pantalla de fin con el ganador y las fichas de cada uno
