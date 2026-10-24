## ADDED Requirements

### Requirement: Rummy 500 en la suite
El menú MUST incluir el Rummy 500 junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 4 (por defecto, 2), y el nivel de la IA. Como el resto de juegos con IA, el Rummy 500 MUST poder jugarse en red.

#### Scenario: Empezar una partida de Rummy 500
- **WHEN** el jugador elige el Rummy 500 en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Rummy 500 con 13 cartas en su mano y un rival de la IA

### Requirement: Mesa del Rummy 500
La mesa del Rummy 500 MUST mostrar:
- la mano del jugador boca arriba, que se puede ordenar por palos o por números;
- los rivales con su número de cartas y sus puntos;
- el mazo con su número de cartas y el descarte abierto en abanico, con todas sus cartas;
- las combinaciones de la mesa, marcando las cartas que puso cada jugador;
- la carta obligada pendiente, si la hay.

Como en el Remigio, el jugador juega su turno así:
- **Robar:** toca el mazo, o toca una carta del descarte para cogerla con todas las de encima. Las cartas del descarte desde las que no se puede coger no responden.
- **Bajar:** elige cartas y pulsa «Bajar». Si la elección no es una combinación, el botón está desactivado.
- **Añadir:** con una carta elegida, toca una combinación de la mesa.
- **Descartar:** elige una carta y pulsa «Descartar», o la arrastra al descarte.

La mesa MUST caber en 360 × 640 sin scroll horizontal con 4 jugadores.

#### Scenario: Coger varias del descarte
- **WHEN** el jugador toca una carta del descarte que tiene otras dos encima y puede usar
- **THEN** las tres pasan a su mano y la mesa le avisa de que tiene que usar la de más abajo

#### Scenario: Bajar una escalera
- **WHEN** tras robar, el jugador elige el 4, el 5 y el 6 de diamantes y pulsa «Bajar»
- **THEN** la escalera aparece en la mesa marcada como suya y las cartas salen de su mano

### Requirement: Resumen de la mano y fin del Rummy 500
Al terminar cada mano, la mesa MUST mostrar quién cerró (o que se acabó el mazo) y, de cada jugador, los puntos bajados, los que le quedaron en la mano, los de la mano y el total, y esperar a que pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar los puntos de cada jugador ordenados y el resumen de la última mano.

#### Scenario: Fin de una mano de Rummy 500
- **WHEN** un rival descarta su última carta
- **THEN** el jugador ve el resumen con los puntos de cada uno, y la partida espera a que pulse «Siguiente mano»
