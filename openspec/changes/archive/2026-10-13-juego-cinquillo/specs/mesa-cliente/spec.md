## ADDED Requirements

### Requirement: Cinquillo en la suite
El menú MUST incluir el Cinquillo junto al resto de juegos. Sus opciones MUST permitir elegir, antes de empezar, el número de jugadores (2, 3 o 4) y el número de manos (1, 3 o 5).

#### Scenario: Empezar una partida de Cinquillo
- **WHEN** el jugador elige el Cinquillo en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Cinquillo con la configuración elegida

### Requirement: Mesa del Cinquillo
La mesa MUST mostrar en el centro una fila por palo con su escalera, colocada en su sitio del As al Rey, y los huecos donde se puede jugar. La mano propia MUST resaltar las cartas jugables. El jugador MUST poder jugar una carta arrastrándola a la mesa, tocándola y tocando la mesa, o con doble toque. Cuando solo pueda pasar, la mesa MUST ofrecer un botón «Paso». La mesa MUST anunciar qué juega o si pasa cada rival, y mostrar cuántas cartas le quedan a cada uno.

#### Scenario: Jugar y pasar desde la mesa
- **WHEN** el jugador toca una carta jugable y después la mesa, y en un turno posterior no tiene jugada
- **THEN** la carta aparece en su sitio en la escalera de su palo y, más tarde, el botón «Paso» le permite pasar el turno

### Requirement: Resultado de la mano de Cinquillo
Al terminar cada mano, la mesa MUST mostrar quién ganó, las cartas que le quedaron a cada jugador, los puntos de la mano y los totales. MUST esperar a que el jugador pulse «Siguiente mano» antes de repartir la siguiente.

#### Scenario: Fin de una mano
- **WHEN** un rival se queda sin cartas
- **THEN** el jugador ve quién ganó, las cartas que le quedaron a cada uno y los totales, y la partida espera a que pulse «Siguiente mano»
