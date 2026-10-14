## ADDED Requirements

### Requirement: Corazones en la suite
El menú MUST incluir los Corazones junto al resto de juegos. Antes de empezar, sus opciones MUST permitir activar o desactivar el pase de cartas y elegir los puntos con los que termina la partida (100 o 50).

#### Scenario: Empezar una partida de Corazones
- **WHEN** el jugador elige los Corazones en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de los Corazones con la configuración elegida

### Requirement: Mesa de los Corazones
La mesa de los Corazones MUST reutilizar la mesa de bazas con 4 jugadores sin parejas.
- **Pase:** el jugador MUST elegir 3 cartas tocándolas y pulsar «Pasar», viendo a quién se las pasa. Después ve qué cartas ha recibido.
- **Información:** la mesa MUST mostrar los puntos de cada jugador en la mano y en la partida, y si los corazones están rotos.
- **Juego:** las cartas que no se pueden jugar MUST NOT poder jugarse.

#### Scenario: Pasar tres cartas
- **WHEN** en la fase de pase el jugador toca tres cartas y pulsa «Pasar»
- **THEN** esas cartas salen de su mano y, cuando todos han pasado, ve las tres que ha recibido

### Requirement: Resumen de la mano de Corazones
Al terminar cada mano, la mesa MUST mostrar los puntos de la mano y los totales de cada jugador, e indicar si alguien tiró la luna. La partida MUST esperar a que el jugador pulse «Siguiente mano».

#### Scenario: Fin de una mano de Corazones
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve los puntos de la mano y los totales, y la partida espera a que pulse «Siguiente mano»
