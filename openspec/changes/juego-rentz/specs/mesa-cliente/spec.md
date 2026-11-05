## ADDED Requirements

### Requirement: Rentz en la suite
El menú MUST incluir el Rentz junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. La partida es siempre de 28 manos. Como el resto de juegos con IA, MUST poder jugarse en red con 4 jugadores.

#### Scenario: Empezar una partida de Rentz
- **WHEN** el jugador elige el Rentz y empieza
- **THEN** se abre su mesa con su mano de 8 cartas y la elección del contrato

### Requirement: Mesa del Rentz
La mesa del Rentz MUST mostrar:
- la mano del jugador y las de los tres rivales boca abajo;
- el contrato de la mano y quién lo eligió;
- la mano en curso de las 28;
- la baza en curso o las filas del dominó;
- los puntos de la mano de cada uno y el marcador.

Cuando le toca elegir, el jugador MUST ver un botón por cada contrato que le queda. En el dominó, si no puede poner, MUST tener el botón «Pasar».

Al acabar cada mano, la mesa MUST mostrar un resumen con el contrato, lo que anota cada uno y el marcador.

#### Scenario: Elegir un contrato
- **WHEN** el jugador toca «Sin damas»
- **THEN** empieza la mano de sin damas y sale él

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra el contrato y lo que anota cada uno

#### Scenario: Fin de la partida
- **WHEN** acaba la mano 28
- **THEN** sale la pantalla de fin con el ganador y el marcador de cada uno
