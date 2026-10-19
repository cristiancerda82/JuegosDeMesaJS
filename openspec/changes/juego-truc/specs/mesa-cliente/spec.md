## ADDED Requirements

### Requirement: Truc en la suite
El menú MUST incluir el Truc junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- 2 jugadores o 4 en parejas (por defecto, 2);
- la partida a dos cames (por defecto) o a una;
- el nivel de la IA.

Como el resto de juegos con IA, el Truc MUST poder jugarse en red.

#### Scenario: Empezar una partida de Truc
- **WHEN** el jugador elige el Truc en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Truc con 3 cartas en su mano y un rival de la IA

### Requirement: Mesa del Truc
La mesa del Truc MUST reutilizar la mesa de bazas.
- **Botones en su turno:** cuando puede, el jugador ve «Envit», el truc que toque («Truc», «Retruc», «Quatre val» o «Joc fora») y «Me'n vaig».
- **Botones al responder:** ante una apuesta, ve «Vull», «No vull», la subida que toque («Torne», «Falta» o la del truc) y, si el envit va primero, «Envit».
- **Información:** muestra lo que vale la mano, el envit aceptado o pendiente, las bazas ganadas y pardas de cada bando, y las piedras y cames de cada bando.
- **Avisos:** avisa de lo que dicen los demás jugadores y, al aceptarse un envit, de los puntos de cada bando.

#### Scenario: Responder a un truc
- **WHEN** el rival de la IA truca
- **THEN** el jugador ve «Vull», «No vull», «Retruc» y «Me'n vaig» y, al pulsar «Vull», la mano pasa a valer 2

### Requirement: Resumen de la mano de Truc
Al terminar cada mano, la mesa MUST mostrar:
- el envit (nivel, si se quiso, puntos de cada bando y quién lo ganó);
- el truc (lo que valía la mano y quién la ganó, o quién se fue);
- las piedras de cada bando, y si se cerró una came.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar las cames de los dos bandos.

#### Scenario: Fin de una mano de Truc
- **WHEN** termina una mano con un envit querido y un truc
- **THEN** el jugador ve los puntos de envit de cada bando, lo que cobra cada uno y las piedras de la came, y la partida espera a que pulse «Siguiente mano»
