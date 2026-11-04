## ADDED Requirements

### Requirement: Baraja y repartos del Cuarenta
El Cuarenta MUST jugarse con la baraja francesa sin los 8, 9 y 10 (40 cartas), entre 2 jugadores o entre 4 en parejas (los asientos 0 y 2 contra 1 y 3).
- **Valor para sumar:** el As vale 1 y del 2 al 7 su número; la J, la Q y la K MUST NOT tener valor para sumar.
- **Orden para la escalera:** As, 2, 3, 4, 5, 6, 7, J, Q, K (la K no tiene siguiente).

Cada mano MUST empezar con la mesa vacía y 5 cartas para cada jugador. Cuando todos se quedan sin cartas y queda mazo, MUST repartirse otras 5 a cada uno: 4 repartos por mano con 2 jugadores y 2 con 4.

Sale el jugador siguiente al repartidor y el turno sigue en orden también tras cada reparto. El repartidor de la primera mano es el último asiento y pasa al siguiente en cada mano.

#### Scenario: Reparto con 2
- **WHEN** empieza una mano con 2 jugadores
- **THEN** cada uno tiene 5 cartas, la mesa está vacía y quedan 30 en el mazo

#### Scenario: Reparto con 4
- **WHEN** empieza una mano con 4 jugadores
- **THEN** cada uno tiene 5 cartas, la mesa está vacía y quedan 20 en el mazo

#### Scenario: Siguiente reparto
- **WHEN** con 2 jugadores los dos juegan su quinta carta
- **THEN** cada uno recibe otras 5 y quedan 20 en el mazo

### Requirement: Ronda del Cuarenta
Al repartir, cada jugador que recibe tres o cuatro cartas del mismo número MUST anotar una ronda: 4 puntos para su bando. La ronda MUST ser pública: todos ven quién la tiene y de qué número, pero no los palos. Cuatro cartas iguales cuentan como una sola ronda.

#### Scenario: Ronda
- **WHEN** al repartir el jugador 1 recibe tres cincos
- **THEN** su bando anota 4 puntos y todos ven que tiene ronda de cincos

### Requirement: Capturas del Cuarenta
En su turno, el jugador MUST jugar una carta de su mano, y puede llevarse con ella:
- **Por número:** una carta de la mesa de su mismo número, la que elija si hay varias.
- **Por suma:** si la carta jugada es del As al 7, dos o más cartas de la mesa del As al 7 cuyos valores sumen su valor.

Capturar MUST ser opcional: el jugador puede dejar la carta en la mesa aunque pueda capturar.

**Escalera:** tras capturar, el jugador MUST llevarse además una carta de la mesa del número siguiente al de la carta jugada, si la hay. Después, una del número siguiente a esa, y así mientras haya.

La carta jugada y las capturadas van, boca abajo, al montón de su bando.

#### Scenario: Por número
- **WHEN** el jugador juega una Q y en la mesa hay una Q y un 3
- **THEN** puede llevarse la Q o dejar su carta en la mesa

#### Scenario: Por suma
- **WHEN** el jugador juega un 7 y en la mesa hay un As, un 2 y un 4
- **THEN** puede llevarse las tres cartas, que suman 7

#### Scenario: Las figuras no suman
- **WHEN** el jugador juega una J y en la mesa hay un 3 y un 5
- **THEN** no puede llevarse nada

#### Scenario: Escalera
- **WHEN** el jugador juega un 2, en la mesa hay un 2, un 3, un 4 y un 6, y se lleva el 2
- **THEN** también se lleva el 3 y el 4, pero no el 6

#### Scenario: La J sigue al 7
- **WHEN** el jugador juega un 6, en la mesa hay un 6, un 7, una J y una K, y se lleva el 6
- **THEN** también se lleva el 7 y la J, pero no la K

### Requirement: Caída y limpia del Cuarenta
- **Caída:** si el jugador se lleva por número la carta que acaba de echar a la mesa el jugador anterior, su bando MUST anotar 2 puntos. Tras un reparto, la carta que quedó en la mesa del reparto anterior MUST NOT dar caída.
- **Limpia:** si al capturar el jugador deja la mesa vacía, su bando MUST anotar 2 puntos.

Con caída y limpia en la misma jugada, se anotan las dos: 4 puntos.

#### Scenario: Caída
- **WHEN** el rival deja un 5 en la mesa y el jugador se lo lleva con otro 5
- **THEN** su bando anota 2 puntos de caída

#### Scenario: Sin caída por suma
- **WHEN** el rival deja un 5 en la mesa y el jugador se lo lleva junto con un 2 sumando 7
- **THEN** no hay caída

#### Scenario: Caída y limpia
- **WHEN** en la mesa solo está el 5 que acaba de echar el rival y el jugador se lo lleva con otro 5
- **THEN** su bando anota 4 puntos

#### Scenario: Sin caída tras el reparto
- **WHEN** el rival echó un 5 con su última carta, se reparte otra vez y el jugador se lleva ese 5 con otro 5
- **THEN** no hay caída

### Requirement: Fin de la mano y cartones del Cuarenta
Cuando nadie tiene cartas y no queda mazo, las cartas de la mesa MUST ir al bando del último que capturó, y se cuentan los cartones:
- el bando que tiene 20 cartas recogidas o más MUST anotar 6 puntos, y 1 más por cada carta pasada de 20, con el total redondeado al número par de arriba;
- el bando con menos de 20 MUST NOT anotar nada por cartones;
- con 20 y 20, ninguno anota.

#### Scenario: Cartones
- **WHEN** acaba la mano y un bando tiene 23 cartas
- **THEN** ese bando anota 10 puntos de cartones y el otro ninguno

#### Scenario: Cartas restantes
- **WHEN** acaba la mano con 2 cartas en la mesa y el último que capturó es del bando 1
- **THEN** esas 2 cartas son del bando 1

#### Scenario: Empate a 20
- **WHEN** cada bando tiene 20 cartas
- **THEN** nadie anota cartones

### Requirement: Partida del Cuarenta
En cuanto un bando llega a 40 puntos o más (por una ronda, una caída, una limpia o los cartones), la partida MUST terminar y gana ese bando, aunque sea a mitad de la mano.

Al terminar la mano sin ganador, MUST repartirse otra con el siguiente repartidor.

#### Scenario: Fin por caída
- **WHEN** un bando con 38 puntos hace una caída a mitad de la mano
- **THEN** la partida termina y gana ese bando con 40

#### Scenario: Siguiente mano
- **WHEN** acaba una mano y ningún bando llega a 40
- **THEN** se reparte otra mano con el siguiente repartidor

### Requirement: Vista del Cuarenta
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno y cuántas quedan en el mazo;
- la mesa y la última jugada, con lo que capturó, la caída y la limpia;
- qué carta de la mesa daría caída ahora;
- las rondas del reparto, con su número;
- cuántas cartas lleva recogidas cada bando, y sus caídas, limpias y rondas de la mano;
- los resultados de las manos anteriores y los puntos de la partida.

Las cartas recogidas MUST quedar boca abajo: no se ven, solo cuántas son.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás y cuántas hay en el mazo, pero no cuáles
