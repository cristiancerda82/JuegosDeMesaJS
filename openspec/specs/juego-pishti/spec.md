# juego-pishti Specification

## Purpose
TBD - created by archiving change juego-pishti. Update Purpose after archive.

## Requirements

### Requirement: Baraja y repartos del Pishti
El Pishti MUST jugarse con la baraja francesa de 52 cartas, entre 2 jugadores o entre 4 en parejas (los asientos 0 y 2 contra 1 y 3).

Al empezar cada mano:
- se MUST poner 4 cartas en el montón de la mesa: 3 tapadas y la de arriba a la vista;
- cada jugador MUST recibir 4 cartas.

Cuando todos se quedan sin cartas y queda mazo, MUST repartirse otras 4 a cada uno: 6 repartos por mano con 2 jugadores y 3 con 4.

Sale el jugador siguiente al repartidor, y el turno sigue en orden también tras cada reparto. El repartidor de la primera mano es el último asiento y pasa al siguiente en cada mano.

#### Scenario: Reparto con 2
- **WHEN** empieza una mano con 2 jugadores
- **THEN** cada uno tiene 4 cartas, el montón tiene 4 (3 tapadas) y quedan 40 en el mazo

#### Scenario: Reparto con 4
- **WHEN** empieza una mano con 4 jugadores
- **THEN** cada uno tiene 4 cartas, el montón tiene 4 (3 tapadas) y quedan 32 en el mazo

#### Scenario: Siguiente reparto
- **WHEN** con 2 jugadores los dos juegan su cuarta carta
- **THEN** cada uno recibe otras 4 y quedan 32 en el mazo

### Requirement: Jugar en el Pishti
En su turno, el jugador MUST echar una carta de su mano sobre el montón:
- si es del mismo número que la carta de arriba, MUST llevarse el montón entero, tapadas incluidas;
- si es una J y el montón no está vacío, MUST llevarse el montón entero;
- si no, la carta MUST quedarse arriba del montón.

La carta jugada y el montón capturado van, boca abajo, al montón de su bando. Las cartas tapadas siguen sin verse aunque se capturen.

#### Scenario: Por número
- **WHEN** arriba del montón hay un 7 y el jugador echa otro 7
- **THEN** se lleva el montón entero

#### Scenario: Con la J
- **WHEN** arriba del montón hay un 4 y el jugador echa una J
- **THEN** se lleva el montón entero

#### Scenario: Sin captura
- **WHEN** arriba del montón hay un 4 y el jugador echa un 9
- **THEN** el 9 queda arriba del montón

#### Scenario: Montón vacío
- **WHEN** el montón está vacío y el jugador echa una J
- **THEN** la J queda en el montón

### Requirement: Pishti
Si el montón tiene una sola carta y el jugador se la lleva con otra del mismo número, su bando MUST anotar un pishti: 10 puntos, o 20 si las dos son J. Llevarse con una J un montón de una sola carta que no es J MUST NOT ser pishti.

#### Scenario: Pishti
- **WHEN** el montón tiene solo un 5 y el jugador echa otro 5
- **THEN** su bando anota un pishti de 10 puntos

#### Scenario: Pishti de J
- **WHEN** el montón tiene solo una J y el jugador echa otra J
- **THEN** su bando anota un pishti de 20 puntos

#### Scenario: La J sobre una carta sola
- **WHEN** el montón tiene solo un 5 y el jugador echa una J
- **THEN** se lleva el 5, pero no es pishti

### Requirement: Fin de la mano y puntos del Pishti
Cuando nadie tiene cartas y no queda mazo, las cartas del montón MUST ir al bando del último que se llevó un montón, y cada bando MUST anotar:
- **Cartas:** 3 puntos si tiene más cartas que el otro; con empate, nadie.
- **Ases y J:** 1 punto por cada uno.
- **2 de tréboles:** 2 puntos.
- **10 de diamantes:** 3 puntos.
- **Pishtis:** los de la mano.

#### Scenario: Puntos de las cartas
- **WHEN** un bando tiene 30 cartas con dos Ases, una J y el 10 de diamantes, y ningún pishti
- **THEN** anota 3 por las cartas, 3 por los Ases y la J y 3 por el 10 de diamantes: 9 puntos

#### Scenario: Cartas restantes
- **WHEN** acaba la mano con 3 cartas en el montón y el último que se llevó un montón es del bando 1
- **THEN** esas 3 cartas son del bando 1

### Requirement: Partida del Pishti
Tras cada mano, si algún bando llega a 151 puntos o más y tiene más que el otro, la partida MUST terminar y gana ese bando. Si no, se reparte otra mano con el siguiente repartidor.

#### Scenario: Fin de la partida
- **WHEN** un bando con 140 puntos anota 15 en una mano y el otro llega a 120
- **THEN** la partida termina y gana el primero con 155

#### Scenario: Empate por encima de 151
- **WHEN** los dos bandos llegan a 160
- **THEN** se juega otra mano

### Requirement: Vista del Pishti
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno y cuántas quedan en el mazo;
- el montón: cuántas cartas tapadas tiene y las cartas a la vista, en el orden en que se echaron;
- la última jugada, con lo que se llevó y si fue pishti;
- cuántas cartas lleva recogidas cada bando y sus pishtis;
- los resultados de las manos anteriores y los puntos de la partida.

Las cartas recogidas y las tapadas MUST quedar boca abajo: no se ven, solo cuántas son.

#### Scenario: Tapadas ocultas
- **WHEN** empieza una mano y el jugador 0 mira la mesa
- **THEN** ve la carta de arriba del montón y que hay 3 tapadas, pero no cuáles son
