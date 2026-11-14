## ADDED Requirements

### Requirement: Póker de cinco cartas en la suite
El menú MUST incluir el Póker de cinco cartas junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido y el número de jugadores (de 2 a 6). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Póker de cinco cartas
- **WHEN** el jugador elige el Póker de cinco cartas con 6 jugadores y empieza
- **THEN** se abre su mesa con sus cinco cartas y los cinco rivales

### Requirement: Mesa del Póker de cinco cartas
La mesa del Póker de cinco cartas MUST mostrar, como la del Texas Hold'em:
- las cartas del jugador;
- las fichas y la apuesta de cada uno;
- los botes;
- el botón y las ciegas;
- a quién le toca.

Además, MUST mostrar cuántas cartas cambió cada jugador (o que va servido) y el As que enseñó.

En las rondas de apuestas, el jugador MUST tener las acciones del Texas Hold'em. En el descarte, MUST poder:
- marcar y desmarcar cartas, solo en combinaciones que se pueden cambiar;
- confirmar el cambio con un botón que dice cuántas cambia, o que va servido.

Al acabar cada mano, la mesa MUST mostrar un resumen con:
- las manos enseñadas;
- quién se lleva cada bote;
- las fichas de cada uno.

#### Scenario: Cambiar dos cartas
- **WHEN** en el descarte el jugador marca dos cartas y toca «Cambiar 2»
- **THEN** recibe dos cartas nuevas y su asiento muestra que cambió dos

#### Scenario: El cuarto solo con As
- **WHEN** el jugador tiene marcadas tres cartas y no tiene un As entre las otras dos
- **THEN** no puede marcar una cuarta

#### Scenario: Fin de la partida
- **WHEN** solo un jugador queda con fichas
- **THEN** sale la pantalla de fin con el ganador y el orden de eliminación
