## MODIFIED Requirements

### Requirement: Corazones en la suite
El menú MUST incluir los Corazones junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (de 3 a 6, 4 por defecto), activar o desactivar el pase de cartas (solo con 4) y elegir los puntos con los que termina la partida (100 o 50). En red, la sala MUST tener tantos asientos como jugadores.

#### Scenario: Empezar una partida de Corazones
- **WHEN** el jugador elige los Corazones en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de los Corazones con la configuración elegida

#### Scenario: Corazones de 3
- **WHEN** el jugador elige 3 jugadores y empieza
- **THEN** se abre la mesa con dos rivales, su mano de 17 cartas y sin pase, y la opción de pase no se ve

### Requirement: Mesa de los Corazones
La mesa de los Corazones MUST reutilizar la mesa de bazas con el número de jugadores de la partida (de 3 a 6), sin parejas.
- **Pase:** el jugador MUST elegir 3 cartas tocándolas y pulsar «Pasar», viendo a quién se las pasa. Después ve qué cartas ha recibido.
- **Información:** la mesa MUST mostrar los puntos de cada jugador en la mano y en la partida, y si los corazones están rotos.
- **Juego:** las cartas que no se pueden jugar MUST NOT poder jugarse.

#### Scenario: Pasar tres cartas
- **WHEN** en la fase de pase el jugador toca tres cartas y pulsa «Pasar»
- **THEN** esas cartas salen de su mano y, cuando todos han pasado, ve las tres que ha recibido
