## ADDED Requirements

### Requirement: Skat en la suite
El menú MUST incluir el Skat junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el número de rondas (1, 2 o 3). El Skat se juega siempre con 3. Como el resto de juegos con IA, el Skat MUST poder jugarse en red.

#### Scenario: Empezar una partida de Skat
- **WHEN** el jugador elige el Skat en el menú y empieza
- **THEN** se abre su mesa con sus 10 cartas y dos rivales

### Requirement: Mesa del Skat
La mesa del Skat MUST usar la mesa de bazas común, y mostrar además:
- durante la subasta, quién puja a quién y el último valor;
- el solista, el juego declarado y sus anuncios;
- los puntos de las bazas del solista y de los defensores en la mano, y los puntos de la partida.

Cuando le toque, el jugador MUST tener los botones de:
- **subasta:** pujar el siguiente valor, aceptar o pasar;
- **el Skat:** coger el Skat o jugar de mano;
- **descarte:** descartarse de 2 cartas, una a una, tocando cada carta y después la mesa;
- **declarar:** cada juego posible y, si juega de mano, los anuncios.

Al jugar, solo MUST poder elegir las cartas que permiten las reglas. Si el solista juega ouvert, su mano MUST verse en la mesa junto a su nombre.

#### Scenario: Pujar desde la mesa
- **WHEN** al jugador le toca pujar y pulsa «18»
- **THEN** se anuncia su puja y le toca responder al otro

#### Scenario: Descartarse tras coger el Skat
- **WHEN** el jugador es el solista, coge el Skat y se descarta de 2 cartas tocando cada una y la mesa
- **THEN** vuelve a tener 10 cartas y puede declarar el juego

### Requirement: Resumen de la mano y fin del Skat
Al terminar cada mano, la mesa MUST mostrar el solista, el juego con sus anuncios, el Skat, los puntos de cartas del solista, el multiplicador y el valor, si ganó o perdió, y los puntos de la partida de cada uno, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de cada jugador.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra el juego, su valor y lo que suma o resta el solista
