## ADDED Requirements

### Requirement: Pinacle en la suite
El menú MUST incluir el Pinacle junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir 2 jugadores (por defecto) o 4 por parejas, además del nivel de la IA.

#### Scenario: Empezar una partida de Pinacle por parejas
- **WHEN** el jugador elige el Pinacle en el menú, elige 4 jugadores y empieza
- **THEN** se abre la mesa del Pinacle con él, un compañero de la IA enfrente y dos rivales de la IA

### Requirement: Mesa del Pinacle
La mesa del Pinacle MUST mostrar:
- la mano del jugador boca arriba;
- las manos de los demás boca abajo, con su número de cartas y las cartas conocidas que se llevaron del montón;
- el mazo con su número de cartas;
- el montón de descartes con su carta de arriba;
- las combinaciones de cada bando, con los comodines en su puesto;
- los puntos de cada bando y si está barbelé.

Además:
- **Mano:** el jugador MUST poder ordenarla por palos o por números, y verla entera aunque crezca mucho al llevarse el montón, sin scroll horizontal en 360 × 640.
- **Montón:** el jugador MUST poder abrirlo para ver todas sus cartas.
- **Robar:** el jugador roba tocando el mazo o el montón; si no puede llevarse el montón, la mesa MUST decir por qué.
- **Bajar:** el jugador elige cartas de su mano y pulsa «Bajar» para formar una combinación nueva, o toca una combinación de su bando para añadirlas. Si un comodín puede ocupar más de un puesto, la mesa MUST preguntar cuál. Cuando la elección no forma una combinación legal, el botón MUST estar desactivado.
- **Cambiar un comodín:** con la carta natural elegida, tocar el comodín de la mesa MUST hacer el cambio, preguntando a qué extremo va si hay dos.
- **Descartar:** tocar una carta y el montón descarta esa carta.
- **Avisos:** la mesa MUST recordar que hay que bajar la carta de arriba del montón antes de descartar, y avisar del barbelé antes de descartar con una bajada de menos de 70.

#### Scenario: Bajar un grupo
- **WHEN** tras robar, el jugador elige tres reinas de su mano y pulsa «Bajar»
- **THEN** el grupo aparece en la zona de su bando y las reinas salen de su mano

#### Scenario: Elección que no es combinación
- **WHEN** el jugador elige 4♣, 9♥ y K♠
- **THEN** el botón «Bajar» está desactivado

#### Scenario: Mano grande en el móvil
- **WHEN** en una pantalla de 360 × 640 el jugador se lleva un montón de 30 cartas
- **THEN** ve todas las cartas de su mano sin scroll horizontal

### Requirement: Resumen de la mano de Pinacle
Al terminar cada mano del Pinacle, la mesa MUST mostrar para cada bando:
- quién cerró, o que se acabó el mazo;
- sus combinaciones con su valor, marcando las que tienen premio;
- los premios por cerrar y por cambiar comodines;
- lo que resta por las cartas en la mano y la penalización del barbelé, si la hubo;
- el total de la mano y los puntos acumulados.

La partida MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar los puntos de los dos bandos.

#### Scenario: Fin de una mano de Pinacle
- **WHEN** un jugador cierra
- **THEN** el jugador ve el desglose de los dos bandos y la partida espera a que pulse «Siguiente mano»
