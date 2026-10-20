## ADDED Requirements

### Requirement: Remigio en la suite
El menú MUST incluir el Remigio junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 5 (por defecto, 2), y el nivel de la IA. Como el resto de juegos con IA, el Remigio MUST poder jugarse en red.

#### Scenario: Empezar una partida de Remigio
- **WHEN** el jugador elige el Remigio en el menú, elige 4 jugadores y empieza
- **THEN** se abre la mesa del Remigio con 7 cartas en su mano y tres rivales de la IA

### Requirement: Mesa del Remigio
La mesa del Remigio MUST mostrar:
- la mano del jugador boca arriba, que se puede ordenar por palos o por números;
- los rivales con su número de cartas y sus puntos;
- el mazo con su número de cartas y el montón con su carta de arriba;
- las combinaciones de cada jugador, con los comodines en su puesto.

El jugador juega su turno así:
- **Robar:** toca el mazo o el montón.
- **Bajar:** elige cartas y pulsa «Bajar». Si un comodín puede ocupar más de un puesto, la mesa pregunta cuál. Si la elección no es una combinación, el botón está desactivado.
- **Añadir:** toca una combinación de cualquier jugador con cartas elegidas. Solo es posible si ya ha bajado en la mano.
- **Cambiar un comodín:** con la carta natural elegida, toca el comodín de la mesa.
- **Descartar:** toca una carta y el montón.

#### Scenario: Bajar una escalera
- **WHEN** tras robar, el jugador elige el 4, el 5 y el 6 de oros y pulsa «Bajar»
- **THEN** la escalera aparece en su zona de la mesa y las cartas salen de su mano

#### Scenario: Añadir a la combinación de un rival
- **WHEN** el jugador ya ha bajado, elige el 7 de copas y toca la escalera del 4 al 6 de copas de un rival
- **THEN** el 7 de copas se añade a esa escalera

### Requirement: Resumen de la mano de Remigio
Al terminar cada mano, la mesa MUST mostrar:
- quién cerró y si fue con remigio;
- los puntos de la mano de cada jugador, con las cartas que le quedaron;
- los totales, marcando a los eliminados.

MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por puntos.

#### Scenario: Fin de una mano de Remigio
- **WHEN** un rival cierra con remigio
- **THEN** el jugador ve que fue remigio, sus puntos dobles y los totales, y la partida espera a que pulse «Siguiente mano»
