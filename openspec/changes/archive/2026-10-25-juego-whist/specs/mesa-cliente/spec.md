## ADDED Requirements

### Requirement: Whist en la suite
El menú MUST incluir el Whist junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre con 4 jugadores en parejas, con el compañero enfrente. Como el resto de juegos con IA, el Whist MUST poder jugarse en red.

#### Scenario: Empezar una partida de Whist
- **WHEN** el jugador elige el Whist en el menú y empieza
- **THEN** se abre su mesa con sus 13 cartas, el compañero enfrente, los rivales a los lados y el triunfo a la vista

### Requirement: Mesa del Whist
La mesa del Whist MUST mostrar:
- los demás jugadores con cuántas cartas tienen;
- la baza en curso en el centro;
- el triunfo: su palo y, mientras el repartidor no la juegue, la carta;
- quién reparte, las bazas que lleva cada pareja en la mano, y los puntos y los juegos de cada pareja.

En su turno, el jugador MUST poder jugar una carta legal tocándola; las que no puede jugar MUST verse apagadas. La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Jugar una carta
- **WHEN** al jugador le toca y toca una carta del palo de salida
- **THEN** la carta pasa a la baza en curso

### Requirement: Resumen de la mano y fin del Whist
Al terminar cada mano, la mesa MUST mostrar las bazas de cada pareja, los puntos que suma, el marcador y los juegos, y avisar si alguna pareja ha ganado un juego. Después MUST esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar los juegos ganados por cada pareja.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano en la que una pareja hizo 8 bazas
- **THEN** el resumen muestra 8 bazas y 2 puntos para esa pareja
