## MODIFIED Requirements

### Requirement: Reparto y pase
La partida MUST jugarse con la baraja francesa y de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta. Para que el reparto salga igual, MUST quitarse:
- con 3 jugadores, el 2 de diamantes (17 cartas a cada uno);
- con 4, ninguna (13 a cada uno);
- con 5, el 2 de diamantes y el 2 de picas (10 a cada uno);
- con 6, el 2 y el 3 de diamantes y de picas (8 a cada uno).

En cada mano se MUST repartir todas las cartas que quedan.

Con 4 jugadores y el pase activado (por defecto), antes de jugar cada jugador MUST elegir 3 cartas de su mano, que recibe:
- en la primera mano, el jugador siguiente en el orden de juego;
- en la segunda, el anterior;
- en la tercera, el de enfrente;
- en la cuarta no hay pase, y vuelta a empezar.

Con 3, 5 o 6 jugadores no hay pase.

Las cartas pasadas MUST entregarse cuando los cuatro han elegido. Un jugador MUST NOT ver qué cartas han elegido los demás hasta recibir las suyas.

#### Scenario: Pase al siguiente
- **WHEN** en la primera mano el asiento 0 pasa el As, el Rey y la Q de picas
- **THEN** cuando los cuatro han elegido, esas tres cartas están en la mano del asiento 1 y no en la del 0

#### Scenario: Mano sin pase
- **WHEN** empieza la cuarta mano
- **THEN** se juega directamente, sin fase de pase

#### Scenario: Tres jugadores
- **WHEN** empieza una partida de 3 jugadores
- **THEN** cada uno tiene 17 cartas, el 2 de diamantes no está en ninguna mano y se juega sin pase

#### Scenario: Seis jugadores
- **WHEN** empieza una partida de 6 jugadores
- **THEN** cada uno tiene 8 cartas y no están el 2 ni el 3 de diamantes ni de picas

### Requirement: Puntuación de la mano
Al jugarse todas las bazas, cada jugador MUST sumar 1 punto por cada corazón y 13 por la Q de picas de las bazas que se llevó. Si un jugador se llevó los 26 puntos (tiró la luna), MUST sumar 0 y cada uno de los demás sumar 26. El resultado de la mano MUST registrar los puntos de cada jugador, quién tiró la luna y los totales.

#### Scenario: Puntos de una mano
- **WHEN** un jugador se lleva 5 corazones y la Q de picas
- **THEN** suma 18 puntos en esa mano

#### Scenario: Tirar la luna
- **WHEN** un jugador se lleva los 13 corazones y la Q de picas
- **THEN** él suma 0 y cada uno de los demás suma 26

#### Scenario: La luna con 5 jugadores
- **WHEN** en una partida de 5 un jugador tira la luna
- **THEN** cada uno de los otros cuatro suma 26
