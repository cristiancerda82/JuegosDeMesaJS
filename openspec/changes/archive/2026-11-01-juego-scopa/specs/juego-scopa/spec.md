## ADDED Requirements

### Requirement: Baraja y reparto de la Scopa
La Scopa MUST jugarse con la baraja española de 40 cartas, entre 2 jugadores o entre 4 en parejas (los asientos 0 y 2 contra 1 y 3). Cada carta MUST valer: el As 1, del 2 al 7 su número, la sota 8, el caballo 9 y el rey 10.
- **Con 2:** cada jugador MUST recibir 3 cartas y se ponen 4 boca arriba en la mesa. Cuando los dos se quedan sin cartas, MUST repartirse otras 3 a cada uno mientras quede mazo.
- **Con 4 (Scopone):** cada jugador MUST recibir 10 cartas y la mesa empieza vacía.

Sale el jugador siguiente al repartidor; el repartidor de la primera mano es el último asiento y pasa al siguiente en cada mano.

#### Scenario: Reparto con 2
- **WHEN** empieza una mano con 2 jugadores
- **THEN** cada uno tiene 3 cartas, hay 4 en la mesa y quedan 30 en el mazo

#### Scenario: Reparto con 4
- **WHEN** empieza una mano con 4 jugadores
- **THEN** cada uno tiene 10 cartas, la mesa está vacía y no queda mazo

### Requirement: Captura de la Scopa
En su turno, el jugador MUST jugar una carta de su mano:
- si en la mesa hay cartas de su mismo valor, MUST llevarse una de ellas (la que elija) y no puede llevarse una suma;
- si no las hay pero hay cartas que suman su valor, MUST llevarse una de esas combinaciones (la que elija);
- si no puede capturar, la carta MUST quedarse en la mesa.

La carta jugada y las capturadas van, boca abajo, al montón de su bando.

#### Scenario: Valor igual antes que suma
- **WHEN** el jugador juega un 5 y en la mesa hay un 5, un 2 y un 3
- **THEN** solo puede llevarse el 5

#### Scenario: Suma
- **WHEN** el jugador juega un rey (10) y en la mesa hay un 4, un 6 y un 3
- **THEN** tiene que llevarse el 4 y el 6

#### Scenario: Sin captura
- **WHEN** el jugador juega un 2 y en la mesa hay un 5 y un 6
- **THEN** el 2 se queda en la mesa

### Requirement: Scopa
Si al capturar el jugador deja la mesa vacía, MUST anotar una scopa para su bando, salvo que sea la última jugada de la mano.

#### Scenario: Scopa
- **WHEN** en la mesa solo hay un 3 y un 4 y el jugador se los lleva con un 7
- **THEN** su bando anota una scopa

#### Scenario: Última jugada
- **WHEN** con la última carta de la mano el jugador se lleva todas las cartas de la mesa
- **THEN** no cuenta como scopa

### Requirement: Fin de la mano de la Scopa
Cuando nadie tiene cartas y no queda mazo, las cartas de la mesa MUST ir al bando del último que capturó, y se puntúa la mano.

#### Scenario: Cartas restantes
- **WHEN** acaba la mano con 2 cartas en la mesa y el último que capturó es del bando 1
- **THEN** esas 2 cartas son del bando 1

### Requirement: Puntos de la mano de la Scopa
Cada bando MUST anotar:
- **Cartas:** 1 punto si tiene más de 20 cartas.
- **Oros:** 1 punto si tiene más de 5 oros.
- **Settebello:** 1 punto si tiene el siete de oros.
- **Primiera:** 1 punto si su primiera es mayor que la del otro. La primiera es la suma, por cada palo, de su mejor carta según la tabla: 7 21, 6 18, As 16, 5 15, 4 14, 3 13, 2 12 y las figuras 10. A un bando que no tiene ningún palo, ese palo le cuenta 0.
- **Scopas:** 1 punto por cada una.

Con empate en cartas (20 a 20), en oros (5 a 5) o en primiera, nadie anota ese punto.

#### Scenario: Primiera
- **WHEN** un bando tiene los cuatro sietes y el otro los cuatro seises como mejores cartas de cada palo
- **THEN** el primero tiene 84 de primiera, el segundo 72, y el primero anota el punto

#### Scenario: Empate en cartas
- **WHEN** cada bando tiene 20 cartas
- **THEN** nadie anota el punto de las cartas

### Requirement: Partida de la Scopa
Tras cada mano, si algún bando llega a 11 puntos o más y tiene más que el otro, la partida MUST terminar y gana ese bando. Si no, se reparte otra mano con el siguiente repartidor.

#### Scenario: Fin de la partida
- **WHEN** un bando con 9 puntos anota 3 en una mano y el otro llega a 10
- **THEN** la partida termina y gana el primero con 12

#### Scenario: Empate por encima de 11
- **WHEN** los dos bandos llegan a 12
- **THEN** se juega otra mano

### Requirement: Vista de la Scopa
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno y cuántas quedan en el mazo;
- la mesa y la última jugada con lo que capturó;
- cuántas cartas lleva recogidas cada bando y sus scopas;
- los resultados de las manos anteriores y los puntos de la partida.

Las cartas recogidas MUST quedar boca abajo: no se ven, solo cuántas son.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás y cuántas hay en el mazo, pero no cuáles
