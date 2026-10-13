## ADDED Requirements

### Requirement: Reparto numerado
Una partida de FreeCell MUST repartir las 52 cartas de una baraja francesa boca arriba en 8 columnas: las 4 primeras reciben 7 cartas y las 4 últimas 6. Las celdas y las 4 fundaciones empiezan vacías. El reparto MUST seguir el algoritmo clásico de Microsoft para un número de partida del 1 al 32.000. La configuración MUST permitir elegir el número. Si no se elige, se deriva de la semilla de la partida.

#### Scenario: Partida número 1
- **WHEN** se crea la partida número 1
- **THEN** la primera fila de las columnas es J♦, 2♦, 9♥, J♣, 5♦, 7♥, 7♣ y 5♥

#### Scenario: Reparto inicial
- **WHEN** se crea cualquier partida
- **THEN** las columnas tienen 7, 7, 7, 7, 6, 6, 6 y 6 cartas, todas boca arriba, y las celdas y fundaciones están vacías

### Requirement: Celdas libres
Cada celda MUST poder guardar una sola carta. La última carta de una columna MUST poder moverse a una celda vacía. La carta de una celda MUST poder moverse a una columna o a una fundación según sus reglas. La configuración MUST permitir jugar con 1, 2, 3 o 4 celdas (4 por defecto).

#### Scenario: Celda ocupada
- **WHEN** se intenta mover una carta a una celda que ya tiene una
- **THEN** el movimiento se rechaza

### Requirement: Fundaciones
Cada fundación MUST construirse por un solo palo, del As al Rey en orden ascendente. MUST poder moverse a una fundación la carta de una celda o la última de una columna. Las cartas de una fundación no vuelven a la mesa.

#### Scenario: Iniciar y continuar una fundación
- **WHEN** se mueve un As a una fundación vacía y después el 2 del mismo palo
- **THEN** los dos movimientos se aceptan, y un 2 de otro palo se rechaza

### Requirement: Movimientos en las columnas
Una carta MUST poder ponerse sobre la última carta de una columna si es de un valor inmediatamente inferior y de color opuesto. Cualquier carta MUST poder ponerse en una columna vacía.

#### Scenario: Movimiento válido
- **WHEN** se mueve un 9 de picas sobre un 10 de corazones
- **THEN** el movimiento se acepta, y sobre un 10 de tréboles se rechaza

#### Scenario: Columna vacía
- **WHEN** se mueve una reina a una columna vacía
- **THEN** el movimiento se acepta

### Requirement: Mover secuencias
Una secuencia del final de una columna, ordenada de mayor a menor y con colores alternos, MUST poder moverse a otra columna si su primera carta cumple las reglas de las columnas y su longitud no supera `(celdas libres + 1) × 2^(columnas vacías)`. Si el destino es una columna vacía, esa columna no cuenta entre las vacías.

#### Scenario: Supermovimiento
- **WHEN** hay 2 celdas libres y 1 columna vacía, y se mueve una secuencia de 6 cartas a otra columna que no está vacía
- **THEN** el movimiento se acepta, y una de 7 se rechaza

#### Scenario: A una columna vacía
- **WHEN** hay 2 celdas libres y 1 columna vacía, y se mueve una secuencia a esa columna vacía
- **THEN** se pueden mover como mucho 3 cartas

### Requirement: Movimiento automático a las fundaciones
Si está activado (por defecto sí), después de cada movimiento del jugador el juego MUST llevar a las fundaciones, una a una, las cartas de celdas y columnas que ya no pueden servir para colocar otras: los Ases, los 2, y cualquier carta cuyo valor sea como mucho uno más que las fundaciones de los dos palos del color contrario. Estos movimientos forman parte del movimiento del jugador.

#### Scenario: El As va solo
- **WHEN** con el movimiento automático activado un movimiento deja un As al final de una columna
- **THEN** el As pasa a su fundación en el mismo movimiento

#### Scenario: Una carta que aún puede hacer falta
- **WHEN** con el movimiento automático activado queda al descubierto el 5 de corazones, las fundaciones rojas llegan al 4 y las negras al 2
- **THEN** el 5 de corazones no se mueve solo, porque aún puede recibir un 4 negro

### Requirement: Deshacer
El jugador MUST poder deshacer los movimientos en orden inverso, uno por uno, hasta el inicio de la partida. Deshacer un movimiento deshace también los movimientos automáticos que provocó.

#### Scenario: Deshacer con movimiento automático
- **WHEN** se deshace un movimiento que llevó un As a la fundación
- **THEN** tanto la carta movida como el As vuelven a su sitio anterior

### Requirement: Autocompletar
Cuando las cartas de todas las columnas están ordenadas de mayor a menor (de modo que ninguna tapa a otra de menor valor), el jugador MUST poder autocompletar: el sistema mueve todas las cartas a las fundaciones.

#### Scenario: Autocompletar disponible
- **WHEN** todas las columnas están ordenadas de mayor a menor
- **THEN** autocompletar está disponible y, al usarlo, las 52 cartas terminan en las fundaciones

### Requirement: Victoria y contadores
La partida MUST terminar con victoria cuando las 52 cartas están en las fundaciones. MUST llevar el número de movimientos y el tiempo jugado, y el jugador MUST poder abandonar en cualquier momento.

#### Scenario: Victoria
- **WHEN** se coloca la última carta en una fundación
- **THEN** la partida termina con victoria y muestra el número de partida, los movimientos y el tiempo
