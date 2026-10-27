## ADDED Requirements

### Requirement: Cribbage en la suite
El menú MUST incluir el Cribbage junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Cribbage se juega siempre con 2. Como el resto de juegos con IA, el Cribbage MUST poder jugarse en red.

#### Scenario: Empezar una partida de Cribbage
- **WHEN** el jugador elige el Cribbage en el menú y empieza
- **THEN** se abre su mesa con sus 6 cartas, el rival y el tablero de puntos a 0

### Requirement: Mesa del Cribbage
La mesa del Cribbage MUST mostrar:
- un tablero con el avance de cada jugador hasta 121 y sus puntos;
- el rival, con cuántas cartas tiene;
- quién reparte, el crib y el starter cuando se descubre;
- la cuenta y las cartas jugadas desde que empezó;
- el aviso de lo que sumó la última jugada (por ejemplo, «15 por 2»);
- abajo, la mano propia.

Al echar al crib, el jugador MUST marcar 2 cartas tocándolas y pulsar «Al crib». Al jugar las cartas, MUST tocar una carta que quepa y después la mesa. Si no le cabe ninguna, MUST tener el botón «Go». La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Echar dos cartas al crib
- **WHEN** el jugador marca 2 cartas y pulsa «Al crib»
- **THEN** le quedan 4 cartas y el crib muestra sus cartas

#### Scenario: Decir go
- **WHEN** al jugador no le cabe ninguna carta
- **THEN** su único botón es «Go»

### Requirement: Recuento y fin del Cribbage
Al terminar cada mano, la mesa MUST mostrar, en el orden en que se cuentan, la mano del que no reparte, la del repartidor y el crib, cada una con sus cartas, el starter y el desglose (quinces, parejas, escaleras, color y nobs). También MUST mostrar los puntos del juego de las cartas y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último recuento y los puntos de cada uno.

#### Scenario: Recuento tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra las dos manos y el crib con su desglose y los totales
