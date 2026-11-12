## ADDED Requirements

### Requirement: Briscola Chiamata en la suite
El menú MUST incluir la Briscola Chiamata junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el modo asistido. La partida es siempre a 5 manos. Como el resto de juegos con IA, MUST poder jugarse en red con 5 jugadores.

#### Scenario: Empezar una partida de Briscola Chiamata
- **WHEN** el jugador elige la Briscola Chiamata y empieza
- **THEN** se abre su mesa con sus 8 cartas, los otros cuatro jugadores y la subasta

### Requirement: Mesa de la Briscola Chiamata
La mesa de la Briscola Chiamata MUST mostrar:
- la mano del jugador y las de los demás boca abajo;
- lo que ha pujado cada uno, quién ganó la subasta y la puja;
- la carta llamada y el triunfo;
- el compañero del llamador cuando el jugador lo sabe, o que aún no se sabe;
- la baza en curso, los puntos de cada jugador en la mano y los puntos de partida de cada uno.

Cuando le toca, el jugador MUST tener:
- en la subasta, un botón por cada carta que puede pujar, una forma de pujar por puntos cuando ya se puede, y «Paso» si puede pasar;
- al ganar la subasta, un botón por palo con el nombre de la carta que llamaría.

Al acabar cada mano, la mesa MUST mostrar un resumen con la puja, la carta llamada, el compañero, los puntos del bando del llamador, si ganó y los puntos de partida de cada jugador, y esperar a que pulse «Siguiente mano».

#### Scenario: Pujar y llamar
- **WHEN** el jugador puja el As, gana la subasta y llama el As de oros
- **THEN** la mesa muestra que la carta llamada es el As de oros y que el triunfo es oros

#### Scenario: Saberse compañero
- **WHEN** un rival llama una carta que tiene el jugador
- **THEN** la mesa le dice que es el compañero del llamador

#### Scenario: Fin de la partida
- **WHEN** termina la quinta mano
- **THEN** sale la pantalla de fin con el ganador y los puntos de partida de cada jugador
