## ADDED Requirements

### Requirement: Blackjack en la suite
El menú MUST incluir el Blackjack junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (de 1 a 4; 2 por defecto), el número de manos (5, 10 o 20; 10 por defecto) y el nivel de la IA. Como el resto de juegos con IA, el Blackjack MUST poder jugarse en red.

#### Scenario: Empezar una partida de Blackjack
- **WHEN** el jugador elige el Blackjack en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con la banca, un rival de la IA y los botones para apostar

### Requirement: Mesa del Blackjack
La mesa del Blackjack MUST mostrar:
- arriba, la banca con sus cartas (la tapada con su dorso) y su valor cuando se conoce;
- cada jugador con sus manos, el valor de cada una, su apuesta y sus fichas, con la mano que se juega destacada;
- las manos jugadas y las que quedan.

En la apuesta, el jugador MUST ver botones con las apuestas legales (de 2 a 20). En su turno, MUST ver los botones «Pedir», «Plantarse» y, cuando se pueda, «Doblar» y «Separar». Al terminar cada mano MUST verse un resumen con las cartas de la banca y lo que gana o pierde cada mano, antes de la siguiente. La mesa MUST caber en 360 × 640 sin scroll horizontal con 4 jugadores.

#### Scenario: Pedir desde la mesa
- **WHEN** al jugador le toca y pulsa «Pedir»
- **THEN** recibe una carta y el valor de su mano se actualiza

#### Scenario: Separar desde la mesa
- **WHEN** el jugador tiene una pareja y pulsa «Separar»
- **THEN** la mesa muestra sus dos manos y destaca la que juega

### Requirement: Fin del Blackjack
Al terminar, la pantalla de fin MUST mostrar las fichas de cada jugador ordenadas de más a menos y el resumen de la última mano.

#### Scenario: Ganar el Blackjack
- **WHEN** acaba la última mano y el jugador es quien más fichas tiene
- **THEN** ve la pantalla de victoria con las fichas de todos
