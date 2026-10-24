## ADDED Requirements

### Requirement: Reparto del Yukon
Una partida de Yukon MUST repartir una baraja francesa barajada en 7 columnas. La primera columna tiene 1 carta boca arriba. La columna n (de la segunda a la séptima) tiene n − 1 cartas boca abajo y 5 boca arriba encima. No hay mazo, y las 4 fundaciones empiezan vacías.

#### Scenario: Reparto inicial
- **WHEN** se crea una partida de Yukon
- **THEN** las columnas tienen 1, 6, 7, 8, 9, 10 y 11 cartas, con 0, 1, 2, 3, 4, 5 y 6 boca abajo
- **AND** están las 52 cartas y las fundaciones están vacías

### Requirement: Construir en las columnas del Yukon
La configuración MUST elegir cómo se construye en las columnas:
- **colores alternos** (Yukon clásico, por defecto): una carta va sobre otra de un valor más y de color contrario;
- **mismo palo** (Solitario ruso): una carta va sobre otra de un valor más y del mismo palo.

Cualquier carta boca arriba de una columna MUST poder moverse a otra columna junto con todas las cartas que tiene encima, estén o no ordenadas, si la carta movida puede ir sobre la última carta de la columna de destino. Solo un rey, con lo que tenga encima, MUST poder ocupar una columna vacía.

#### Scenario: Mover un grupo desordenado
- **WHEN** en el Yukon clásico el 9 de picas tiene encima un 4 de corazones y una K de tréboles, y se mueve sobre el 10 de corazones de otra columna
- **THEN** el movimiento se acepta y las tres cartas pasan a esa columna en el mismo orden

#### Scenario: Color equivocado
- **WHEN** en el Yukon clásico se intenta mover el 9 de picas sobre el 10 de tréboles
- **THEN** el movimiento se rechaza

#### Scenario: Solitario ruso
- **WHEN** se juega con la construcción por palo
- **THEN** el 9 de picas puede ir sobre el 10 de picas y no sobre el 10 de corazones

#### Scenario: Columna vacía
- **WHEN** se intenta mover una reina, con lo que tiene encima, a una columna vacía
- **THEN** el movimiento se rechaza, y con un rey se acepta

### Requirement: Fundaciones del Yukon
Cada fundación MUST construirse por un solo palo, del as al rey. MUST poder subir a una fundación la última carta de una columna. MUST poder bajar la carta de arriba de una fundación a una columna, respetando las reglas de construir.

#### Scenario: Subir a la fundación
- **WHEN** la última carta de una columna es el as de diamantes
- **THEN** puede subir a una fundación vacía, y una carta que no es la última de su columna no puede

### Requirement: Descubrir cartas en el Yukon
Cuando una columna queda con su última carta boca abajo, esa carta MUST voltearse boca arriba en el mismo movimiento.

#### Scenario: Volteo automático
- **WHEN** se mueven todas las cartas boca arriba de una columna que tiene cartas boca abajo
- **THEN** la nueva última carta de esa columna queda boca arriba

### Requirement: Deshacer en el Yukon
El jugador MUST poder deshacer los movimientos en orden inverso, uno por uno, hasta el inicio de la partida. Deshacer restaura también los volteos automáticos. Deshacer cuenta como un movimiento más.

#### Scenario: Deshacer un movimiento con volteo
- **WHEN** se deshace un movimiento que provocó el volteo de una carta
- **THEN** las cartas vuelven a su columna y la carta volteada vuelve a quedar boca abajo

### Requirement: Autocompletar el Yukon
Cuando no quedan cartas boca abajo y cada columna está ordenada de mayor a menor según la regla de construir, el jugador MUST poder autocompletar: el sistema sube todas las cartas a las fundaciones.

#### Scenario: Autocompletar disponible
- **WHEN** todas las cartas están boca arriba y cada columna baja de uno en uno según la regla de construir
- **THEN** autocompletar está disponible y, al usarlo, las 52 cartas terminan en las fundaciones

#### Scenario: Columnas sin ordenar
- **WHEN** todas las cartas están boca arriba pero alguna columna no está ordenada
- **THEN** autocompletar no está disponible

### Requirement: Victoria y contadores del Yukon
La partida MUST terminar con victoria cuando las 52 cartas están en las fundaciones. La partida MUST llevar el número de movimientos y el tiempo jugado. El jugador MUST poder abandonar en cualquier momento.

#### Scenario: Victoria
- **WHEN** se coloca la última carta en una fundación
- **THEN** la partida termina con victoria

### Requirement: Vista del Yukon
La vista MUST mostrar de cada columna cuántas cartas tiene boca abajo y cuáles boca arriba, las fundaciones, la regla de construir, los movimientos y la situación (jugando, victoria o abandono). Las cartas boca abajo MUST NOT mostrarse.

#### Scenario: Cartas boca abajo ocultas
- **WHEN** se pide la vista al empezar la partida
- **THEN** muestra las 31 cartas boca arriba y solo el número de las boca abajo de cada columna
