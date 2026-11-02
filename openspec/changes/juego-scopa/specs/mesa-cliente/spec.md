## ADDED Requirements

### Requirement: Scopa en la suite
El menú MUST incluir la Scopa junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y 2 jugadores o 4 en parejas (Scopone); la partida es siempre a 11. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Scopa
- **WHEN** el jugador elige la Scopa con 2 jugadores y empieza
- **THEN** se abre su mesa con su mano de 3 cartas y 4 cartas en la mesa

#### Scenario: Scopone
- **WHEN** el jugador elige 4 jugadores y empieza
- **THEN** se abre su mesa con su mano de 10 cartas, su compañero enfrente y la mesa vacía

### Requirement: Mesa de la Scopa
La mesa de la Scopa MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- la mesa y el mazo;
- las cartas recogidas y las scopas de cada bando, y los puntos de la partida;
- la última jugada con lo que capturó.

Al tocar una carta de su mano, si hay varias capturas posibles, el jugador MUST elegir las cartas de la mesa que se lleva; si solo hay una forma de jugarla, se juega directamente.

Al acabar cada mano, la mesa MUST mostrar un resumen con las cartas, los oros, el settebello, la primiera y las scopas de cada bando, y lo que anota cada uno.

#### Scenario: Elegir la captura
- **WHEN** el jugador juega un 5 y en la mesa hay dos cincos
- **THEN** elige cuál de los dos se lleva

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra la primiera de cada bando y los puntos de cada concepto

#### Scenario: Fin de la partida
- **WHEN** un bando llega a 11 con más puntos que el otro
- **THEN** sale la pantalla de fin con el bando ganador y los puntos de cada uno
