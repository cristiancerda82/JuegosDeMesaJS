## ADDED Requirements

### Requirement: Mus en la suite
El menú MUST incluir el Mus junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir entre ocho y cuatro reyes, los puntos de cada juego (30 o 40) y cuántos juegos hacen falta para ganar la partida (1, 2 de 3 o 3 de 5).

#### Scenario: Empezar una partida de Mus
- **WHEN** el jugador elige el Mus en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Mus con la configuración elegida, con el jugador abajo, su compañero enfrente y los rivales a los lados

### Requirement: Mesa del Mus
La mesa del Mus MUST permitir al jugador:
- pedir mus o cortarlo;
- elegir de 1 a 4 cartas tocándolas y descartarlas;
- en su turno de un lance, apostar con botones que muestran solo las acciones legales (pasar, envidar, subir, quiero, no quiero, órdago).

La mesa MUST mostrar:
- el marcador de piedras y juegos de cada pareja;
- quién es mano;
- el lance en curso y el estado de los lances ya jugados;
- el envite pendiente;
- las declaraciones de pares y juego;
- lo último que ha dicho cada jugador.

#### Scenario: Descartar
- **WHEN** en la fase de descarte el jugador toca dos cartas y pulsa «Descartar»
- **THEN** esas dos cartas se cambian por dos nuevas del mazo

#### Scenario: Contestar un envite
- **WHEN** un rival envida a Grande y le toca contestar al jugador
- **THEN** ve los botones «Quiero», «No quiero», de subida y de órdago, y no ve el de pasar

### Requirement: Conteo de la mano en la mesa
Al terminar cada mano, la mesa MUST mostrar un panel con las cartas de los cuatro jugadores y, por cada lance, quién lo ganó y las piedras que cobró cada pareja, y el marcador tras el conteo. Si la mano terminó por un órdago, el panel MUST indicarlo. La partida MUST esperar a que el jugador pulse «Siguiente mano».

#### Scenario: Fin de una mano
- **WHEN** termina el conteo de una mano
- **THEN** el jugador ve las cartas de todos, las piedras de cada lance y el marcador, y la partida espera a que pulse «Siguiente mano»
