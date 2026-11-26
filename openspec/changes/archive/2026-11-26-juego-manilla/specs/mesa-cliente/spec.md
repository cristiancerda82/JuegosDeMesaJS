## ADDED Requirements

### Requirement: Manilla en la suite
El menú MUST incluir la Manilla junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido y los puntos de la partida (40 o 20). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Manilla
- **WHEN** el jugador elige la Manilla y empieza
- **THEN** se abre su mesa con sus 12 cartas, su compañero enfrente y el pinte a la vista

### Requirement: Mesa de la Manilla
La mesa de la Manilla MUST mostrar:
- la mano del jugador, ordenada por palos, y las de los demás boca abajo;
- el pinte boca arriba en la mano de quien reparte, mientras no lo juega;
- el triunfo y el pinte, los puntos de cada pareja en la mano, el marcador y quién reparte;
- la baza en curso y a quién le toca.

La mesa MUST dejar jugar solo las cartas permitidas por las obligaciones. Al terminar cada mano, MUST mostrar un resumen con:
- los puntos de cartas, las bazas y el total de cada pareja;
- el pinte, y si se anotó o por qué no;
- lo que se anota cada pareja y el total de la partida.

La pantalla de fin MUST mostrar el resumen de la última mano y cuántas manos se jugaron.

#### Scenario: El pinte a la vista
- **WHEN** reparte un rival y aún no ha jugado el pinte
- **THEN** el jugador ve el pinte boca arriba en la mano de ese rival y su palo como triunfo

#### Scenario: Resumen de la mano
- **WHEN** termina una mano
- **THEN** sale el resumen con los puntos de cada pareja, el pinte y lo que se anota cada una
