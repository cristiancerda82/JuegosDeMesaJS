# juego-golf Specification

## Purpose
TBD - created by archiving change juego-golf. Update Purpose after archive.

## Requirements

### Requirement: Reparto del Golf
La partida MUST jugarse con una baraja francesa de 52 cartas, barajada con la semilla de la partida.
- **Columnas:** 35 cartas boca arriba en 7 columnas de 5.
- **Descarte:** una carta boca arriba.
- **Mazo:** las 16 cartas restantes, boca abajo.

#### Scenario: Reparto inicial del Golf
- **WHEN** empieza una partida
- **THEN** hay 7 columnas de 5 cartas, una carta en el descarte y 16 en el mazo

### Requirement: Mover al descarte
El As vale 1, los números lo que marcan, la J 11, la Q 12 y la K 13. La última carta de una columna MUST poder pasar encima del descarte si vale exactamente uno más o uno menos que la carta de arriba del descarte, sea cual sea su palo.

Sin vuelta (por defecto), la K y el As no se tocan: sobre una K no se puede poner ninguna carta, y sobre un As solo un 2. Con la opción «con vuelta», sobre una K MUST poder ir una Q o un As, y sobre un As un 2 o una K.

#### Scenario: Una más o una menos
- **WHEN** la carta de arriba del descarte es un 7 y al final de las columnas hay un 6, un 8 y un 9
- **THEN** se pueden mover el 6 y el 8, y no el 9

#### Scenario: Sin vuelta, la K cierra
- **WHEN** sin vuelta, la carta de arriba del descarte es una K y al final de una columna hay una Q
- **THEN** no se puede mover la Q

#### Scenario: Con vuelta
- **WHEN** con vuelta, la carta de arriba del descarte es una K y al final de una columna hay un As
- **THEN** se puede mover el As

### Requirement: Mazo del Golf
Mientras quede mazo, el jugador MUST poder robar en cualquier momento: la carta de arriba del mazo pasa, boca arriba, encima del descarte. El mazo se recorre una sola vez: las cartas del descarte no vuelven al mazo.

#### Scenario: Robar en el Golf
- **WHEN** el jugador roba con 16 cartas en el mazo
- **THEN** quedan 15 y la carta robada está arriba del descarte

#### Scenario: Mazo vacío
- **WHEN** el mazo está vacío
- **THEN** robar no es una acción legal

### Requirement: Victoria en el Golf
La partida MUST ganarse en cuanto las 7 columnas quedan vacías, aunque quede mazo. Una partida ganada ya no admite acciones.

#### Scenario: Vaciar las columnas
- **WHEN** se mueve al descarte la última carta que quedaba en las columnas
- **THEN** la partida termina con victoria

### Requirement: Deshacer y abandonar en el Golf
Cada acción que no sea abandonar MUST sumar un movimiento; deshacer también suma, así que el contador nunca baja. El jugador MUST poder deshacer cualquier acción, sin límite, volviendo exactamente al tablero anterior, y MUST poder abandonar la partida en cualquier momento, que termina sin victoria.

#### Scenario: Deshacer un movimiento
- **WHEN** el jugador mueve una carta al descarte y luego deshace
- **THEN** la carta vuelve al final de su columna y los movimientos suben en uno

### Requirement: Vista del Golf
La vista MUST mostrar:
- las cartas de cada columna;
- las cartas del descarte;
- cuántas cartas quedan en el mazo, sin cuáles;
- los movimientos;
- si se ha ganado o abandonado.

#### Scenario: El mazo del Golf no se ve
- **WHEN** el jugador pide la vista
- **THEN** ve cuántas cartas tiene el mazo, pero no cuáles
