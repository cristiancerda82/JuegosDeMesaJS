## ADDED Requirements

### Requirement: Reparto de la Pirámide
La partida MUST jugarse con una baraja francesa de 52 cartas, barajada con la semilla de la partida.
- **Pirámide:** 28 cartas boca arriba en 7 filas de 1, 2, 3, 4, 5, 6 y 7 cartas. La carta `i` de la fila `f` queda tapada por las cartas `i` e `i + 1` de la fila `f + 1`.
- **Mazo:** las 24 cartas restantes, boca abajo.
- **Descarte:** vacío al empezar.

#### Scenario: Reparto inicial de la Pirámide
- **WHEN** empieza una partida
- **THEN** la pirámide tiene 28 cartas en 7 filas, el mazo tiene 24 y el descarte está vacío

### Requirement: Cartas libres
Una carta de la pirámide MUST estar libre cuando ya no está ninguna de las dos cartas que la tapan; las 7 cartas de la última fila están libres desde el principio. La carta de arriba del descarte también MUST estar libre. Ninguna otra carta está libre.

#### Scenario: Liberar una carta
- **WHEN** se quitan las dos cartas de la última fila que tapan una carta de la sexta fila
- **THEN** esa carta queda libre

#### Scenario: Tapada a medias
- **WHEN** se quita solo una de las dos cartas que tapan una carta
- **THEN** esa carta sigue sin estar libre

### Requirement: Quitar parejas y reyes
El As vale 1, los números lo que marcan, la J 11, la Q 12 y la K 13. El jugador MUST poder quitar:
- dos cartas libres que sumen 13, sean de la pirámide, del descarte o una de cada;
- una K libre, sola.

Las cartas quitadas salen del juego.

#### Scenario: Pareja de la pirámide
- **WHEN** el 6 y el 7 de la última fila están libres
- **THEN** quitar los dos es una acción legal y, al hacerlo, desaparecen de la pirámide

#### Scenario: Pareja con el descarte
- **WHEN** la carta de arriba del descarte es una Q y hay un As libre en la pirámide
- **THEN** se pueden quitar los dos

#### Scenario: Rey solo
- **WHEN** una K de la pirámide está libre
- **THEN** se puede quitar sola

#### Scenario: Una carta tapada no cuenta
- **WHEN** un 8 tapado de la pirámide y un 5 libre suman 13
- **THEN** quitarlos no es una acción legal

### Requirement: Mazo y pasadas
Mientras quede mazo, el jugador MUST poder robar: la carta de arriba del mazo pasa, boca arriba, encima del descarte. Con el mazo vacío y cartas en el descarte, MUST poder dar la vuelta al descarte para que vuelva a ser el mazo, con las cartas en el orden en que se robaron. La configuración MUST fijar cuántas veces se recorre el mazo en total: 3 (por defecto), 1 o sin límite. Con 3, se puede dar la vuelta al descarte 2 veces.

#### Scenario: Robar
- **WHEN** el jugador roba con 24 cartas en el mazo
- **THEN** quedan 23 en el mazo y la carta robada está arriba del descarte

#### Scenario: Última pasada
- **WHEN** con 3 pasadas ya se ha dado la vuelta al descarte 2 veces y el mazo está vacío
- **THEN** dar la vuelta al descarte no es una acción legal

### Requirement: Victoria en la Pirámide
La partida MUST ganarse en cuanto se quitan las 28 cartas de la pirámide, aunque queden cartas en el mazo o en el descarte. Una partida ganada ya no admite acciones.

#### Scenario: Vaciar la pirámide
- **WHEN** se quita la cúspide, que era la última carta de la pirámide
- **THEN** la partida termina con victoria

### Requirement: Deshacer y abandonar en la Pirámide
Cada acción que no sea abandonar MUST sumar un movimiento; como en el resto de solitarios, deshacer también suma, así que el contador nunca baja. El jugador MUST poder deshacer cualquier acción, sin límite, volviendo exactamente al tablero anterior. También MUST poder abandonar la partida en cualquier momento, y entonces la partida termina sin victoria.

#### Scenario: Deshacer una pareja
- **WHEN** el jugador quita una pareja y luego deshace
- **THEN** las dos cartas vuelven a su sitio y los movimientos suben en uno

### Requirement: Vista de la Pirámide
La vista MUST mostrar:
- las cartas de la pirámide en su sitio, y los huecos de las ya quitadas;
- cuántas cartas quedan en el mazo, sin cuáles;
- las cartas del descarte;
- cuántas veces más se puede dar la vuelta al descarte;
- los movimientos;
- si se ha ganado o abandonado.

#### Scenario: El mazo no se ve
- **WHEN** el jugador pide la vista
- **THEN** ve cuántas cartas tiene el mazo, pero no cuáles
