## ADDED Requirements

### Requirement: Ocho loco en la suite
El menú MUST incluir el Ocho loco junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 5 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Ocho loco MUST poder jugarse en red.

#### Scenario: Empezar una partida de Ocho loco
- **WHEN** el jugador elige el Ocho loco en el menú y empieza con 4 jugadores
- **THEN** se abre su mesa con 5 cartas en la mano, tres rivales de la IA y una carta en el descarte

### Requirement: Mesa del Ocho loco
La mesa del Ocho loco MUST mostrar:
- los rivales con su número de cartas y su última acción;
- el mazo con su número de cartas;
- el descarte con la carta de arriba y el palo que toca, destacado cuando lo eligió un 8;
- la mano propia, con las cartas jugables destacadas en su turno;
- los puntos de cada jugador.

En su turno, el jugador:
- toca una carta jugable para jugarla;
- al jugar un 8, elige el palo entre cuatro botones;
- si no tiene jugables, pulsa «Robar»; con la carta robada, puede jugarla o pulsar «Pasar».

Al terminar cada mano, MUST verse un resumen con quién la ganó, los puntos de lo que le quedó a cada uno y los totales, antes de repartir la siguiente. La mesa MUST caber en 360 × 640 sin scroll horizontal con 5 jugadores.

#### Scenario: Jugar un 8 desde la mesa
- **WHEN** el jugador toca un 8 de su mano y elige corazones
- **THEN** el 8 queda arriba del descarte y la mesa muestra que toca corazones

#### Scenario: Robar y pasar desde la mesa
- **WHEN** el jugador no tiene jugables, pulsa «Robar» y la carta robada no casa
- **THEN** la carta entra en su mano y solo puede pulsar «Pasar»

### Requirement: Fin del Ocho loco
Al terminar, la pantalla de fin MUST mostrar quién llegó a 100 y los puntos de cada jugador.

#### Scenario: Ganar el Ocho loco
- **WHEN** el jugador llega a 100 puntos al ganar una mano
- **THEN** ve la pantalla de victoria con los puntos de todos
