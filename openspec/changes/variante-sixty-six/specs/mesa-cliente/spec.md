## ADDED Requirements

### Requirement: Sixty-six en la suite
El menú MUST incluir el Sixty-six como una entrada propia junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 2 y a 7 puntos de partida. Como el resto de juegos con IA, MUST poder jugarse en red.

La mesa, el resumen de cada mano y la pantalla de fin MUST ser los del Schnapsen, con el botón «Cambiar el 9» en lugar de «Cambiar la J». Su guía «¿Cómo se juega?» MUST explicar las reglas del Sixty-six.

#### Scenario: Empezar una partida de Sixty-six
- **WHEN** el jugador elige el Sixty-six en el menú y empieza
- **THEN** se abre la mesa con su mano de 6 cartas, la carta vuelta y el mazo con 12 cartas (las 11 boca abajo y la vuelta, como cuenta la mesa del Schnapsen)

#### Scenario: Cambiar el 9 desde la mesa
- **WHEN** en el Sixty-six el jugador sale con el 9 del triunfo y el mazo abierto
- **THEN** tiene el botón «Cambiar el 9», y al pulsarlo se queda la carta vuelta
