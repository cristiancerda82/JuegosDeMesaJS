## ADDED Requirements

### Requirement: Schnapsen en la suite
El menú MUST incluir el Schnapsen junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Schnapsen se juega siempre entre 2. Como el resto de juegos con IA, el Schnapsen MUST poder jugarse en red.

#### Scenario: Empezar una partida de Schnapsen
- **WHEN** el jugador elige el Schnapsen en el menú y empieza
- **THEN** se abre su mesa con sus 5 cartas, el rival, el mazo y la carta vuelta

### Requirement: Mesa del Schnapsen
La mesa del Schnapsen MUST usar la mesa de bazas común, y mostrar además:
- el mazo con la carta vuelta, o que está cerrado;
- el triunfo;
- los puntos de la mano y las bazas de cada jugador, y los puntos de partida;
- el aviso de cada cante, cambio y cierre.

En su turno de salida, el jugador MUST tener los botones de cambiar la J, cantar cada pareja que pueda y cerrar el mazo, cuando estén permitidos. Al jugar, solo MUST poder elegir las cartas que permiten las reglas.

#### Scenario: Cantar desde la mesa
- **WHEN** el jugador sale con el K y la Q de un palo y pulsa su botón de cantar
- **THEN** se anuncia el cante y solo puede jugar el K o la Q de ese palo

#### Scenario: Cerrar desde la mesa
- **WHEN** el jugador pulsa «Cerrar»
- **THEN** la mesa muestra el mazo cerrado

### Requirement: Resumen de la mano y fin del Schnapsen
Al terminar cada mano, la mesa MUST mostrar quién la ganó y por qué (66, última baza o cierre), los puntos de la mano de cada uno, los puntos de partida que se apunta el ganador y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de partida de cada uno.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién la ganó y los puntos de partida que se apunta
