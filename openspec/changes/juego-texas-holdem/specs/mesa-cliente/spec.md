## ADDED Requirements

### Requirement: Texas Hold'em en la suite
El menú MUST incluir el Texas Hold'em junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Texas Hold'em MUST poder jugarse en red.

#### Scenario: Empezar una partida de Texas Hold'em
- **WHEN** el jugador elige el Texas Hold'em en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus dos cartas, tres rivales de la IA y las ciegas puestas

### Requirement: Mesa del Texas Hold'em
La mesa del Texas Hold'em MUST mostrar:
- los rivales, con sus fichas, su apuesta en la ronda, si se han retirado o van all-in y quién tiene el botón; sus cartas, tapadas salvo en el showdown;
- en el centro, las cartas comunes, el bote y los botes secundarios, y las ciegas y la mano;
- abajo, las dos cartas propias, sus fichas y su apuesta.

En su turno, el jugador MUST ver los botones «Retirarse», «Pasar» o «Igualar N», y «Apostar» o «Subir», con un selector de cantidad entre el mínimo y todas sus fichas y atajos para el mínimo, medio bote, el bote y all-in. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Igualar desde la mesa
- **WHEN** al jugador le toca con una apuesta de 6 que igualar y pulsa «Igualar 6»
- **THEN** su apuesta en la ronda pasa a 6 y sus fichas bajan en lo que puso

#### Scenario: Subir con el atajo del bote
- **WHEN** al jugador le toca, pulsa el atajo «Bote» y después «Subir»
- **THEN** sube a la cantidad que da el bote

### Requirement: Resumen de la mano y fin del Texas Hold'em
Al terminar cada mano, la mesa MUST mostrar las cartas comunes, las manos enseñadas con el nombre de su jugada y quién se lleva cada bote y cuánto, y esperar a que el jugador pulse «Siguiente mano». Si la mano se ganó sin showdown, MUST decir quién se llevó el bote sin enseñar. Al terminar la partida, la pantalla de fin MUST mostrar la clasificación por orden de eliminación.

#### Scenario: Showdown en la mesa
- **WHEN** dos jugadores llegan al river y se enseñan las manos
- **THEN** el resumen muestra las dos manos, su jugada (por ejemplo «Doble pareja») y quién gana el bote
