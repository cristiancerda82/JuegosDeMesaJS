## ADDED Requirements

### Requirement: Durak en la suite
El menú MUST incluir el Durak junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (de 2 a 6) y el nivel de la IA. Como el resto de juegos con IA, el Durak MUST poder jugarse en red.

#### Scenario: Empezar una partida de Durak
- **WHEN** el jugador elige el Durak en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 6 cartas, un rival, el mazo y la carta del triunfo

### Requirement: Mesa del Durak
La mesa del Durak MUST mostrar:
- los rivales, con cuántas cartas tienen, quién ataca y quién defiende, y quién ha salido;
- el mazo con cuántas cartas quedan y la carta del triunfo debajo, o el palo del triunfo cuando ya no queda mazo;
- la mesa, con cada carta de ataque y encima la que la gana;
- cuántas cartas hay en el descarte;
- abajo, la mano propia.

En su turno, el jugador MUST jugar tocando una carta de su mano y después la mesa, como en el resto de juegos. Al defender, MUST haber un botón «Me las llevo»; al echar, un botón «Paso». La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Defender desde la mesa
- **WHEN** el jugador defiende y toca una carta que gana el ataque y luego la mesa
- **THEN** su carta queda encima de la de ataque

#### Scenario: Llevarse las cartas desde la mesa
- **WHEN** el jugador defiende y pulsa «Me las llevo»
- **THEN** las cartas de la mesa pasan a su mano

### Requirement: Fin del Durak
Al terminar la partida, la pantalla de fin MUST decir quién es el durak (o que ha habido empate) y el orden en que salieron los demás.

#### Scenario: Pantalla de fin
- **WHEN** termina una partida de Durak
- **THEN** la pantalla de fin muestra quién es el durak y el orden de salida
