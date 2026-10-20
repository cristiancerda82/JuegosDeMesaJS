## ADDED Requirements

### Requirement: Julepe en la suite
El menú MUST incluir el Julepe junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- el número de jugadores, de 3 a 6 (por defecto, 4);
- el número de manos: 6, 12 (por defecto) o 20;
- el nivel de la IA.

Como el resto de juegos con IA, el Julepe MUST poder jugarse en red.

#### Scenario: Empezar una partida de Julepe
- **WHEN** el jugador elige el Julepe en el menú, elige 6 jugadores y empieza
- **THEN** se abre la mesa del Julepe con 5 cartas en su mano y cinco rivales de la IA

### Requirement: Mesa de bazas con 5 y 6 jugadores
La mesa de bazas MUST admitir 5 y 6 jugadores. Los rivales se reparten así: uno a la derecha, uno a la izquierda y los demás arriba, en el orden de juego (antihorario). Sus nombres son «Rival 1», «Rival 2»… Con 2, 3 y 4 jugadores la mesa no cambia. En 360 × 640 MUST verse entera sin scroll horizontal.

#### Scenario: Seis jugadores en el móvil
- **WHEN** en una pantalla de 360 × 640 empieza una partida de Julepe de 6 jugadores
- **THEN** se ven los cinco rivales y la mano propia sin scroll horizontal

### Requirement: Mesa del Julepe
La mesa del Julepe MUST mostrar:
- la carta de triunfo a la vista;
- el bote;
- las fichas de cada jugador;
- quién juega y quién pasa;
- las bazas de cada uno en la mano;
- el número de la mano.

Según la fase:
- **Decidir:** el jugador ve «Juego» y «Paso». Si está obligado, solo «Juego».
- **Descartar:** el jugador marca las cartas que quiere cambiar y pulsa «Cambiar N» (o «No cambio»). Los demás ven cuántas cartas cambió cada uno.
- **Jugar:** los que pasaron aparecen apagados, sin cartas.

#### Scenario: Descartar desde la mesa
- **WHEN** el jugador juega la mano, marca dos cartas y pulsa «Cambiar 2»
- **THEN** esas dos cartas salen de su mano y entran dos del mazo

### Requirement: Resumen de la mano de Julepe
Al terminar cada mano, la mesa MUST mostrar:
- quién jugó;
- las bazas de cada uno;
- lo que cobró y lo que pagó de julepe cada uno;
- el bote;
- las fichas tras la mano, marcando a los eliminados.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por fichas.

#### Scenario: Fin de una mano de Julepe
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve quién cobró y quién pagó julepe y las fichas de cada uno, y la partida espera a que pulse «Siguiente mano»
