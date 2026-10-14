## ADDED Requirements

### Requirement: Pocha en la suite
El menú MUST incluir la Pocha junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (3 o 4), la duración (corta o completa) y si el repartidor puede cuadrar las apuestas.

#### Scenario: Empezar una partida de Pocha
- **WHEN** el jugador elige la Pocha en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Pocha con la configuración elegida

### Requirement: Mesa de la Pocha
La mesa de la Pocha MUST reutilizar la mesa de bazas, con 3 o 4 jugadores y sin parejas. Cuando le toca apostar, el jugador MUST ver un botón por cada apuesta posible y no ver la prohibida. Junto a cada jugador, la mesa MUST mostrar su apuesta y las bazas que lleva en la mano. MUST mostrar también el triunfo, el número de cartas de la mano y su posición en la partida, y los puntos de cada uno.

#### Scenario: Apostar desde la mesa
- **WHEN** al jugador le toca apostar en una mano de 3 cartas
- **THEN** ve botones para 0, 1, 2 y 3 bazas (menos la prohibida si es el repartidor) y, al pulsar uno, su apuesta queda a la vista de todos

### Requirement: Resultado de la mano de Pocha
Al terminar cada mano, la mesa MUST mostrar las apuestas, las bazas hechas, los puntos de la mano y los totales de cada jugador, marcando quién acertó. MUST esperar a que el jugador pulse «Siguiente mano» antes de repartir la siguiente.

#### Scenario: Fin de una mano
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve quién acertó, los puntos de la mano y los totales, y la partida espera a que pulse «Siguiente mano»
