## ADDED Requirements

### Requirement: Siete y media en la suite
El menú MUST incluir la Siete y media junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (2, 3 o 4), el número de manos, las fichas iniciales, la apuesta máxima, el pago doble de la siete y media natural y cómo cambia la banca.

#### Scenario: Empezar una partida de Siete y media
- **WHEN** el jugador elige la Siete y media en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Siete y media con la configuración elegida

### Requirement: Mesa de la Siete y media
La mesa MUST mostrar quién es la banca, las fichas y la apuesta de cada jugador, las cartas de cada jugador (la tapada boca abajo, salvo la propia, y las pedidas boca arriba) y el valor de la jugada propia. Cuando le toca apostar, el jugador MUST poder elegir su apuesta dentro de los límites y confirmarla. En su turno MUST poder pedir carta o plantarse con botones. La mesa MUST anunciar cuando un jugador pide, se planta o se pasa.

#### Scenario: Turno completo desde la mesa
- **WHEN** el jugador apuesta 5 fichas, pide una carta y se planta
- **THEN** su apuesta queda en la mesa, la carta pedida aparece boca arriba en su jugada y el turno pasa al siguiente

### Requirement: Resultado de la mano de Siete y media
Al terminar cada mano, la mesa MUST mostrar las cartas destapadas de todos, el valor de cada jugada, quién se pasó, cuántas fichas ganó o perdió cada jugador y sus fichas tras la mano. MUST esperar a que el jugador pulse "Siguiente mano" antes de empezar la siguiente.

#### Scenario: Fin de una mano
- **WHEN** la banca se planta y se liquida la mano
- **THEN** el jugador ve las jugadas destapadas de todos con su valor y las fichas ganadas o perdidas, y la partida espera a que pulse "Siguiente mano"
