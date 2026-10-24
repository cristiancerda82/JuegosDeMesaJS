## ADDED Requirements

### Requirement: Gin Rummy en la suite
El menú MUST incluir el Gin Rummy junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. Como el resto de juegos con IA, el Gin Rummy MUST poder jugarse en red.

#### Scenario: Empezar una partida de Gin Rummy
- **WHEN** el jugador elige el Gin Rummy en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con su mano de 10 cartas, el mazo, el descarte y el botón para pasar la primera carta

### Requirement: Mesa del Gin Rummy
La mesa del Gin Rummy MUST mostrar:
- arriba, el rival con el número de cartas que tiene y, a la vista, las que cogió del descarte;
- en el centro, el mazo con las cartas que quedan y el descarte con su carta de arriba;
- abajo, la mano propia ordenada con sus combinaciones juntas y marcadas, y sus puntos sueltos;
- los puntos y manos ganadas de cada jugador.

Como en el Chinchón, el jugador MUST robar tocando (o arrastrando) el mazo o el descarte, y descartar eligiendo una carta de su mano y pulsando «Descartar» o arrastrándola al descarte. Con la carta elegida MUST ver también el botón «Cerrar» (o «¡Gin!» si cierra sin puntos sueltos), activo solo si con esa carta se puede cerrar. Al terminar cada mano MUST verse un resumen con las dos manos destapadas, lo colocado y los puntos, antes de la siguiente. La mesa MUST caber en 360 × 640 sin scroll horizontal con 11 cartas en la mano.

#### Scenario: Robar y descartar desde la mesa
- **WHEN** al jugador le toca, toca el mazo, elige una carta de su mano y pulsa «Descartar»
- **THEN** roba una carta y la carta elegida pasa al descarte

#### Scenario: Cerrar desde la mesa
- **WHEN** el jugador elige una carta con la que puede cerrar y pulsa «Cerrar»
- **THEN** la mano termina y ve el resumen con las dos manos destapadas

### Requirement: Fin del Gin Rummy
Al terminar, la pantalla de fin MUST mostrar el marcador final de cada jugador desglosado (puntos, bonos por mano, bono de partida y si se dobla) y el resumen de la última mano.

#### Scenario: Ganar el Gin Rummy
- **WHEN** acaba la mano en la que el jugador llega a 100
- **THEN** ve la pantalla de victoria con el marcador final desglosado
