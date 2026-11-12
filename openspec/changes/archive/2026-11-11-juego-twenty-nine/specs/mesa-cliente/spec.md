## ADDED Requirements

### Requirement: Twenty-Nine en la suite
El menú MUST incluir el Twenty-Nine junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el modo asistido. La partida es siempre a 6 puntos de juego. Como el resto de juegos con IA, MUST poder jugarse en red con 4 jugadores por parejas.

#### Scenario: Empezar una partida de Twenty-Nine
- **WHEN** el jugador elige el Twenty-Nine y empieza
- **THEN** se abre su mesa con sus 4 primeras cartas, su compañero enfrente y la subasta

### Requirement: Mesa del Twenty-Nine
La mesa del Twenty-Nine MUST mostrar:
- la mano del jugador y las de los demás boca abajo, con el compañero enfrente;
- lo que ha pujado cada uno, quién ganó la subasta y la puja;
- el triunfo: el palo si se conoce, «oculto» si no, o «sin triunfo»;
- si la mano está doblada o redoblada;
- la baza en curso, los puntos de cada pareja en la mano y el marcador de puntos de juego.

Cuando le toca, el jugador MUST tener:
- en la subasta, botones con las pujas que puede hacer y «Paso»;
- al ganar la subasta, un botón por palo y «Sin triunfo»;
- para doblar o redoblar, «Doblar» o «Redoblar» y «No»;
- en las bazas, «Pedir el triunfo» cuando puede pedirlo y «Cantar la pareja» cuando puede cantarla.

Al acabar cada mano, la mesa MUST mostrar un resumen con la puja, el triunfo, los puntos de cada pareja, si se cumplió y el marcador, y esperar a que pulse «Siguiente mano».

#### Scenario: Pujar y elegir el triunfo
- **WHEN** el jugador puja, gana la subasta y elige corazones
- **THEN** la mesa le muestra que el triunfo es corazones, y a los demás que hay un triunfo oculto

#### Scenario: Fin de la partida
- **WHEN** una pareja llega a 6 puntos de juego
- **THEN** sale la pantalla de fin con la pareja ganadora y el marcador
