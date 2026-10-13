# juego-siete-y-media Specification

## Purpose
TBD - created by archiving change juego-siete-y-media. Update Purpose after archive.

## Requirements

### Requirement: Valor de las cartas
Se juega con la baraja española de 40 cartas. Del As al 7, cada carta MUST valer su número. La Sota, el Caballo y el Rey MUST valer medio punto. El valor de una jugada es la suma de sus cartas.

#### Scenario: Siete y media
- **WHEN** un jugador tiene el 7 de oros y el Rey de copas
- **THEN** su jugada vale 7,5

### Requirement: Jugadores, banca y fichas
La partida MUST admitir de 2 a 4 jugadores. Cada jugador empieza con las fichas iniciales de la configuración (50 por defecto). En cada mano, un jugador es la banca y los demás son puntos. El asiento 0 es la banca en la primera mano. Por defecto, la banca pasa en cada mano al jugador siguiente en el orden de turno.

#### Scenario: Primera mano
- **WHEN** empieza una partida de 3 jugadores
- **THEN** el asiento 0 es la banca, los asientos 1 y 2 son puntos y todos tienen 50 fichas

### Requirement: Apuestas
Al empezar cada mano, cada punto MUST apostar, en orden de turno desde el siguiente a la banca, un número entero de fichas entre 1 y el menor de la apuesta máxima de la configuración (10 por defecto) y sus fichas. La banca no apuesta. Las apuestas MUST ser visibles para todos.

#### Scenario: Apuesta limitada por las fichas
- **WHEN** un punto con 4 fichas va a apostar y la apuesta máxima es 10
- **THEN** solo puede apostar de 1 a 4 fichas

### Requirement: Reparto y carta tapada
Cuando todos los puntos han apostado, se MUST barajar la baraja completa y dar una carta boca abajo a cada jugador, empezando por el siguiente a la banca. Esa carta solo la ve su dueño hasta que se destapa al final de la mano. Las cartas que se piden después llegan boca arriba y las ven todos.

#### Scenario: La carta tapada del rival
- **WHEN** se pide la vista de un jugador durante una mano
- **THEN** ve su carta tapada y las cartas boca arriba de todos, pero no la carta tapada de los demás ni el orden del mazo

### Requirement: Turno de los puntos
Por turnos, desde el siguiente a la banca, cada punto MUST poder pedir carta o plantarse. Pedir le da la carta de arriba del mazo, boca arriba, y sigue en su turno. Si su jugada pasa de 7,5, se pasa: pierde su apuesta, que pasa a la banca en el acto, y su turno termina. Si llega exactamente a 7,5, se planta solo. Plantarse termina su turno.

#### Scenario: Pasarse
- **WHEN** un punto con 6 pide carta y le sale un 3
- **THEN** su jugada vale 9, se pasa, la banca cobra su apuesta y el turno pasa al siguiente

#### Scenario: Plantarse
- **WHEN** un punto con 5,5 se planta
- **THEN** conserva su jugada y el turno pasa al siguiente jugador

### Requirement: Turno de la banca
La banca MUST jugar después de todos los puntos, pidiendo cartas o plantándose del mismo modo. Si todos los puntos se pasaron, la mano termina sin que juegue la banca.

#### Scenario: Todos pasados
- **WHEN** todos los puntos de una mano se han pasado
- **THEN** la mano termina sin turno de la banca y la banca se queda con todas las apuestas

### Requirement: Liquidación de la mano
Al terminar la mano se MUST destapar la carta tapada de todos los jugadores y liquidar cada punto que no se pasó. Si la banca se pasó, o el punto tiene más que la banca, la banca le paga su apuesta. En cualquier otro caso, incluido el empate, el punto pierde su apuesta y la cobra la banca. Si está activado el pago doble (por defecto sí), un punto que gana con siete y media natural (exactamente dos cartas: un 7 y una figura) cobra el doble de su apuesta. Si a la banca no le alcanzan las fichas, MUST pagar en orden de turno hasta quedarse sin fichas.

#### Scenario: La banca gana los empates
- **WHEN** un punto se planta con 6 y la banca se planta con 6
- **THEN** el punto pierde su apuesta y la cobra la banca

#### Scenario: La banca se pasa
- **WHEN** la banca se pasa y quedan dos puntos plantados
- **THEN** la banca paga su apuesta a cada uno de los dos

#### Scenario: Siete y media natural
- **WHEN** con el pago doble activado un punto que apostó 5 gana con un 7 y una Sota
- **THEN** cobra 10 fichas de la banca

### Requirement: Cambio de banca
La configuración MUST permitir que la banca rote cada mano (por defecto) o que la banca la conserve el mismo jugador hasta que un punto le gane con siete y media. En ese caso, la banca pasa a ese punto y, si son varios, al primero en el orden de turno. Un jugador sin fichas MUST NOT ser banca ni punto.

#### Scenario: La banca pasa a la siete y media
- **WHEN** con la banca por siete y media un punto le gana con 7,5
- **THEN** ese punto es la banca en la mano siguiente

### Requirement: Fin de la partida
La partida MUST terminar cuando se juega el número de manos de la configuración (10 por defecto) o cuando algún jugador se queda sin fichas. Gana el jugador o los jugadores con más fichas. La puntuación final de cada jugador son sus fichas.

#### Scenario: Quiebra
- **WHEN** al liquidar una mano un jugador se queda sin fichas
- **THEN** la partida termina y ganan los que tienen más fichas

#### Scenario: Partida a 10 manos
- **WHEN** termina la décima mano y todos tienen fichas
- **THEN** la partida termina y gana quien tiene más fichas

### Requirement: Resultado visible de cada mano
Cada mano terminada MUST quedar registrada con la banca, las cartas destapadas de todos, el valor de cada jugada, quién se pasó y las fichas que ganó o perdió cada jugador, y las fichas de todos tras la mano. Ese registro MUST estar en la vista de todos los jugadores.

#### Scenario: Registro de la mano
- **WHEN** termina una mano
- **THEN** la vista de cada jugador incluye las cartas destapadas de todos y la variación de fichas de cada uno
