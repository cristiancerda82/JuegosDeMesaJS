## ADDED Requirements

### Requirement: Butifarra en la suite
El menú MUST incluir la Butifarra junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el objetivo de la partida (51, 101 por defecto o 151) y el nivel de la IA. El jugador juega en el asiento 0, con un compañero de la IA enfrente y dos rivales de la IA. Como el resto de juegos con IA, la Butifarra MUST poder jugarse en red.

#### Scenario: Empezar una partida de Butifarra
- **WHEN** el jugador elige la Butifarra en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa de la Butifarra con 12 cartas en su mano, su compañero enfrente y la partida a 101

### Requirement: Mesa de la Butifarra
La mesa de la Butifarra MUST reutilizar la mesa de bazas de 4 jugadores por parejas. Además, MUST:
- **Elegir el triunfo:** cuando le toca, el jugador ve un botón por cada palo, uno de «Butifarra» y, si es el repartidor, uno de «Delegar».
- **Contros:** cuando le toca, el jugador ve «Contro», «Recontro» o «Sant Vicenç», según el paso, y «Paso».
- **Información de la mano:** muestra el triunfo (o «Butifarra»), quién lo eligió y si fue delegado, y el multiplicador.
- **Avisos:** muestra lo que deciden los demás jugadores, como el triunfo elegido, un delegado o un contro.
- **Puntos:** muestra los puntos de cada bando en la partida y el objetivo.

#### Scenario: Elegir el triunfo
- **WHEN** al jugador le toca elegir siendo el repartidor
- **THEN** ve los botones de los cuatro palos, «Butifarra» y «Delegar», y al pulsar uno la elección queda a la vista de todos

#### Scenario: Contro desde la mesa
- **WHEN** un rival elige el triunfo y al jugador le toca decidir el contro
- **THEN** ve «Contro» y «Paso» y, si dice contro, el multiplicador de la mano pasa a ×2

### Requirement: Resumen de la mano de Butifarra
Al terminar cada mano, la mesa MUST mostrar:
- el triunfo, quién lo eligió y el multiplicador;
- los puntos de cartas y las bazas de cada bando, y el total de la mano de cada uno;
- lo que se anota cada bando y los totales de la partida.

MUST esperar a que el jugador pulse «Siguiente mano» antes de repartir la siguiente. La pantalla de fin MUST mostrar los puntos de los dos bandos.

#### Scenario: Fin de una mano de Butifarra
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve los puntos de cada bando, lo que se anota el que pasó de 36 con su multiplicador y los totales, y la partida espera a que pulse «Siguiente mano»
