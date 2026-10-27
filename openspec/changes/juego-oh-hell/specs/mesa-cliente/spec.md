## ADDED Requirements

### Requirement: Oh Hell en la suite
El menú MUST incluir el Oh Hell junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el número de jugadores, de 3 a 7. Como el resto de juegos con IA, el Oh Hell MUST poder jugarse en red.

#### Scenario: Empezar una partida de Oh Hell
- **WHEN** el jugador elige el Oh Hell con 4 jugadores y empieza
- **THEN** se abre su mesa con sus 12 cartas, tres rivales y la carta del triunfo

### Requirement: Mesa del Oh Hell
La mesa del Oh Hell MUST usar la mesa de bazas común, y mostrar además:
- la carta del triunfo;
- las cartas de la mano en curso y la suma de las apuestas;
- la apuesta y las bazas de cada jugador;
- los puntos de cada uno.

En su turno de apostar, el jugador MUST tener un botón por cada apuesta permitida, y si es el repartidor, MUST ver cuál no puede hacer.

#### Scenario: Apostar desde la mesa
- **WHEN** al jugador le toca apostar y pulsa «2»
- **THEN** su apuesta se ve junto a su nombre

#### Scenario: Apuesta prohibida
- **WHEN** el jugador es el repartidor
- **THEN** no tiene el botón de la apuesta que haría cuadrar la suma, y la mesa le dice cuál es

### Requirement: Resumen de la mano y fin del Oh Hell
Al terminar cada mano, la mesa MUST mostrar, para cada jugador, su apuesta, sus bazas, si acertó, los puntos de la mano y el total, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y la clasificación por puntos.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen marca quién acertó y lo que suma cada uno
