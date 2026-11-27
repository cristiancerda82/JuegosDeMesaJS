## ADDED Requirements

### Requirement: Baraja, reparto y mesa inicial de la Cirulla
La Cirulla MUST jugarse con la baraja española de 40 cartas, entre 2 jugadores o 4 en parejas (asientos 0 y 2 contra 1 y 3). Cada carta MUST valer su número; la Sota, 8; el Caballo, 9, y el Rey, 10. Al empezar cada mano MUST ponerse 4 cartas boca arriba en la mesa y darse 3 a cada jugador, empezando por el siguiente al que reparte, que es quien sale. Cuando todos han jugado sus 3 cartas, MUST darse otras 3 a cada uno, hasta acabar el mazo. El que reparte MUST pasar al siguiente en cada mano.

Si en la mesa salen dos Ases o más, MUST volver a repartirse. Si las 4 cartas de la mesa suman 15, el que reparte MUST llevárselas y anotarse 1 escoba; si suman 30, 2 escobas. El 7 de copas en la mesa MUST valer lo que haga falta para llegar a 30 o, si no se puede, a 15.

#### Scenario: Reparto de la primera mano
- **WHEN** empieza una partida de 2
- **THEN** hay 4 cartas en la mesa, con menos de dos Ases, cada jugador tiene 3 y quedan 30 en el mazo

#### Scenario: La mesa suma 30
- **WHEN** la mesa inicial es el Rey de espadas, el Rey de bastos, el 6 de oros y el 4 de copas
- **THEN** el que reparte se las lleva y se anota 2 escobas, y la mesa queda vacía

#### Scenario: El 7 de copas en la mesa inicial
- **WHEN** la mesa inicial es el 7 de copas, el Rey de oros, el Caballo de bastos y el 2 de espadas
- **THEN** el 7 de copas vale 9, la mesa suma 30 y el que reparte se anota 2 escobas

### Requirement: Acuses de la Cirulla
Cada vez que un jugador recibe sus 3 cartas, si son del mismo valor MUST enseñarlas y su bando anotarse 10 escobas; si no, y suman menos de 10, MUST enseñarlas y su bando anotarse 3 escobas. En los acuses, el 7 de copas MUST valer lo que haga falta. Las cartas enseñadas MUST quedar a la vista de todos hasta que se juegan.

#### Scenario: Tres iguales
- **WHEN** un jugador recibe tres cincos
- **THEN** su bando se anota 10 escobas y los demás ven sus tres cincos

#### Scenario: Suma menor que 10
- **WHEN** un jugador recibe el As de bastos, el 2 de copas y el 4 de oros
- **THEN** su bando se anota 3 escobas

#### Scenario: El 7 de copas en un acuse
- **WHEN** un jugador recibe el 7 de copas y dos Sotas
- **THEN** el 7 de copas vale 8 y su bando se anota 10 escobas

### Requirement: Capturas y escobas de la Cirulla
En su turno, cada jugador MUST jugar una carta de su mano. La carta jugada MUST poder capturar de la mesa:
- una carta de su mismo valor o, si no hay ninguna, varias que sumen su valor, como en la Scopa;
- las cartas que, sumadas a ella, dan 15.

El As jugado con una mesa que no está vacía y no tiene ningún As MUST llevarse la mesa entera. Si la carta puede capturar, MUST hacerlo; si no, se queda en la mesa. Quien deja la mesa vacía al capturar MUST anotarse una escoba, salvo en la última jugada de la mano. Al acabar la mano, las cartas que quedan en la mesa MUST ser para el último que capturó.

#### Scenario: Del mismo valor o a 15
- **WHEN** en la mesa están el 6 de copas y el Caballo de bastos, y un jugador juega el Caballo de espadas
- **THEN** puede llevarse el Caballo de bastos, del mismo valor, o el 6 de copas, porque 9 y 6 suman 15

#### Scenario: El As barre la mesa
- **WHEN** en la mesa están el 4 de copas y el Rey de bastos, sin ningún As, y un jugador juega el As de espadas
- **THEN** se lleva las dos cartas y se anota una escoba

#### Scenario: Con un As en la mesa
- **WHEN** en la mesa están el As de copas y el Rey de bastos, y un jugador juega el As de espadas
- **THEN** solo puede llevarse el As de copas

### Requirement: Recuento de la Cirulla
Al acabar cada mano, cada bando MUST sumar:
- 1 punto por tener más cartas, 1 por más oros, 1 por el 7 de oros y 1 por la mejor primera, como en la Scopa;
- 1 punto por cada escoba, contando las de los acuses y la mesa inicial;
- 5 puntos por la cirulla grande: la Sota, el Caballo y el Rey de oros;
- 3 puntos por la cirulla pequeña (el As, el 2 y el 3 de oros), y 1 más por cada carta seguida que tenga del 4 al 6 de oros.

#### Scenario: Cirulla pequeña con el 4 y el 5
- **WHEN** un bando recoge el As, el 2, el 3, el 4 y el 5 de oros, pero no el 6
- **THEN** su cirulla pequeña vale 5 puntos

#### Scenario: Sin el 2 de oros no hay pequeña
- **WHEN** un bando recoge el As, el 3, el 4 y el 5 de oros, pero no el 2
- **THEN** no tiene cirulla pequeña

### Requirement: Fin de la partida de la Cirulla
La partida MUST terminar al acabar la mano en la que un bando llega a 51 puntos con más que el otro; si los dos llegan con los mismos puntos, MUST seguir. Un bando que se lleva los diez oros en una mano MUST ganar la partida en el acto.

#### Scenario: Llega a 51
- **WHEN** al acabar una mano un bando tiene 53 puntos y el otro 40
- **THEN** la partida termina y gana el de 53

#### Scenario: Los diez oros
- **WHEN** un bando se lleva los diez oros en una mano
- **THEN** gana la partida, tenga los puntos que tenga

### Requirement: Vista del jugador de la Cirulla
La vista de cada jugador MUST mostrar lo mismo que en la Scopa (su mano, la mesa, cuántas cartas tienen los demás y quedan en el mazo, cuántas ha recogido cada bando, sus escobas y los puntos), y además:
- las cartas acusadas que cada jugador aún tiene en la mano;
- los acuses de la última ronda y la mesa inicial de la mano.

La vista no MUST mostrar las demás cartas de las manos ajenas, ni cuáles ha recogido cada bando.

#### Scenario: Se ven las cartas acusadas
- **WHEN** un rival ha acusado tres cincos y ha jugado uno
- **THEN** la vista de los demás muestra los otros dos cincos en su mano
