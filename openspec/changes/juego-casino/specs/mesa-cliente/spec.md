## ADDED Requirements

### Requirement: Casino en la suite
El menú MUST incluir el Casino junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (2, 3 o 4), si con 4 se juega en parejas, y el nivel de la IA. Como el resto de juegos con IA, el Casino MUST poder jugarse en red.

#### Scenario: Empezar una partida de Casino
- **WHEN** el jugador elige el Casino en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 4 cartas, un rival y 4 cartas en la mesa

### Requirement: Mesa del Casino
La mesa del Casino MUST mostrar:
- los rivales, con cuántas cartas tienen y cuántas han recogido;
- la mesa: las cartas sueltas y cada construcción como un montón con su valor, su dueño y la marca de múltiple;
- el mazo, con cuántas cartas quedan, y los puntos;
- abajo, la mano propia.

En su turno, el jugador MUST tocar una carta de su mano para ver las jugadas que puede hacer con ella (recoger, cada construcción posible y dejar), con las cartas de la mesa que se llevaría o usaría resaltadas, y elegir una. Si la carta solo tiene una jugada, MUST hacerla al tocar la mesa. La mesa MUST caber en 360 × 640 sin scroll horizontal con 4 jugadores.

#### Scenario: Recoger desde la mesa
- **WHEN** el jugador toca un 8, que puede recoger un 8 de la mesa, y elige «Recoger»
- **THEN** el 8 de la mesa sale de ella y su cuenta de recogidas sube en 2

#### Scenario: Construir desde la mesa
- **WHEN** el jugador toca un 3, con un 5 en la mesa y un 8 en la mano, y elige «Construir 8»
- **THEN** aparece en la mesa una construcción de 8 suya con el 5 y el 3

### Requirement: Resumen de la mano y fin del Casino
Al terminar cada mano, la mesa MUST mostrar el desglose de puntos de cada jugador o pareja (cartas, picas, Big Casino, Little Casino, Ases y barridas) y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último desglose y la clasificación.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién se llevó las cartas, las picas, el Big Casino y el Little Casino, y los totales
