# juego-tripeaks Specification

## Purpose
TBD - created by archiving change juego-tripeaks. Update Purpose after archive.

## Requirements

### Requirement: Reparto de TriPeaks
La partida MUST jugarse con una baraja francesa de 52 cartas, barajada con la semilla de la partida.
- **Picos:** 28 cartas en cuatro filas de 3, 6, 9 y 10 cartas, que forman tres picos. Cada carta de las tres filas de arriba está tapada por las dos cartas de la fila siguiente que tiene debajo. Las 10 cartas de la fila de abajo van boca arriba; el resto, boca abajo.
- **Descarte:** una carta boca arriba.
- **Mazo:** las 23 cartas restantes, boca abajo.

#### Scenario: Reparto inicial de TriPeaks
- **WHEN** empieza una partida
- **THEN** hay 28 cartas en los picos, de las que 10 están boca arriba, una carta en el descarte y 23 en el mazo

### Requirement: Quitar cartas de los picos
El As vale 1, los números lo que marcan, la J 11, la Q 12 y la K 13. Una carta de los picos que no tenga ninguna carta encima MUST poder pasar encima del descarte si vale exactamente uno más o uno menos que la carta de arriba del descarte, sea cual sea su palo. La K y el As se tocan: sobre una K MUST poder ir una Q o un As, y sobre un As un 2 o una K.

Una carta boca abajo MUST volverse boca arriba en cuanto se quitan las dos cartas que la tapan.

#### Scenario: Una más o una menos
- **WHEN** la carta de arriba del descarte es un 7 y en la fila de abajo hay un 6, un 8 y un 9 sin nada encima
- **THEN** se pueden quitar el 6 y el 8, y no el 9

#### Scenario: Con vuelta
- **WHEN** la carta de arriba del descarte es una K y hay un As sin nada encima
- **THEN** se puede quitar el As

#### Scenario: Descubrir una carta
- **WHEN** se quitan las dos cartas que tapan una carta boca abajo
- **THEN** esa carta queda boca arriba y se puede quitar si encaja

#### Scenario: Una carta tapada
- **WHEN** una carta tiene encima al menos una carta
- **THEN** no se puede quitar

### Requirement: Mazo de TriPeaks
Mientras quede mazo, el jugador MUST poder robar en cualquier momento: la carta de arriba del mazo pasa, boca arriba, encima del descarte. El mazo se recorre una sola vez.

#### Scenario: Robar en TriPeaks
- **WHEN** el jugador roba con 23 cartas en el mazo
- **THEN** quedan 22 y la carta robada está arriba del descarte

#### Scenario: Mazo vacío en TriPeaks
- **WHEN** el mazo está vacío
- **THEN** robar no es una acción legal

### Requirement: Puntos de TriPeaks
La partida MUST llevar una puntuación que empieza en 0:
- **Racha:** cada carta que se quita de los picos suma tantos puntos como su posición en la racha: la primera de la racha suma 1, la segunda 2, la tercera 3, y así. Robar MUST cortar la racha: la siguiente carta quitada vuelve a sumar 1.
- **Picos:** quitar la carta de arriba de un pico suma 15 puntos más. Al quitar la última de las tres, suma además 30.

#### Scenario: Una racha de tres
- **WHEN** el jugador quita tres cartas seguidas de los picos sin robar
- **THEN** suma 1 + 2 + 3 = 6 puntos

#### Scenario: Robar corta la racha
- **WHEN** tras quitar dos cartas seguidas el jugador roba y después quita otra
- **THEN** la nueva carta suma 1 punto

#### Scenario: Despejar un pico
- **WHEN** el jugador quita la carta de arriba de un pico siendo la cuarta carta de su racha
- **THEN** suma 4 + 15 = 19 puntos

### Requirement: Victoria en TriPeaks
La partida MUST ganarse en cuanto quedan quitadas las 28 cartas de los picos, aunque quede mazo. Una partida ganada ya no admite acciones. El resultado de una partida terminada, ganada o abandonada, MUST registrar sus puntos.

#### Scenario: Despejar los tres picos
- **WHEN** se quita la última carta que quedaba en los picos
- **THEN** la partida termina con victoria, con los puntos de la última racha, de los picos y los 30 de despejarlos todos

### Requirement: Deshacer y abandonar en TriPeaks
Cada acción que no sea abandonar MUST sumar un movimiento; deshacer también suma, así que el contador nunca baja. El jugador MUST poder deshacer cualquier acción, sin límite, volviendo exactamente al tablero anterior con sus puntos y su racha. MUST poder abandonar la partida en cualquier momento, que termina sin victoria.

#### Scenario: Deshacer en TriPeaks
- **WHEN** el jugador quita una carta que suma 3 puntos y luego deshace
- **THEN** la carta vuelve a su sitio, los puntos y la racha vuelven a los de antes y los movimientos suben en uno

### Requirement: Vista de TriPeaks
La vista MUST mostrar:
- las cartas boca arriba de los picos y dónde quedan cartas boca abajo, sin cuáles son;
- las cartas del descarte;
- cuántas cartas quedan en el mazo, sin cuáles;
- los movimientos, los puntos y la racha;
- si se ha ganado o abandonado.

#### Scenario: Las cartas boca abajo no se ven
- **WHEN** el jugador pide la vista al empezar
- **THEN** ve las 10 cartas de la fila de abajo y 18 huecos boca abajo, pero no qué cartas son
