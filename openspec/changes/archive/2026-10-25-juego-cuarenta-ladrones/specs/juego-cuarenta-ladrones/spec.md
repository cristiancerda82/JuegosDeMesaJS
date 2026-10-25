## ADDED Requirements

### Requirement: Reparto de Cuarenta ladrones
Una partida de Cuarenta ladrones MUST repartir dos barajas francesas barajadas (104 cartas) así:
- 10 columnas de 4 cartas, todas boca arriba;
- las 64 restantes, boca abajo, al mazo.

El descarte y las 8 fundaciones empiezan vacíos.

#### Scenario: Reparto inicial
- **WHEN** se crea una partida de Cuarenta ladrones
- **THEN** hay 10 columnas de 4 cartas boca arriba, 64 cartas en el mazo, el descarte vacío y 8 fundaciones vacías

### Requirement: Fundaciones de Cuarenta ladrones
Hay 8 fundaciones, dos por palo. Cada una MUST empezar con un As y subir de uno en uno por su palo hasta la K. MUST poder subir a una fundación la carta de arriba del descarte o la última de una columna. Las cartas de las fundaciones no vuelven a bajar.

#### Scenario: Empezar una fundación
- **WHEN** se intenta subir un As de picas a una fundación vacía
- **THEN** el movimiento se acepta, y con un 2 se rechaza

#### Scenario: Dos fundaciones del mismo palo
- **WHEN** ya hay una fundación de corazones empezada y se sube el otro As de corazones
- **THEN** empieza una segunda fundación de corazones

### Requirement: Columnas de Cuarenta ladrones
En las columnas MUST construirse bajando de uno en uno y del mismo palo. Una columna vacía MUST admitir cualquier carta. Se MUST mover una sola carta cada vez: la última de una columna o la de arriba del descarte.

Además, MUST poder moverse a otra columna un tramo de cartas del final de una columna que bajen de uno en uno y sean del mismo palo, si la de abajo del tramo encaja en el destino y cabe hacerlo carta a carta usando las columnas vacías: como mucho 2 elevado al número de columnas vacías que no son el destino. El tramo cuenta como un solo movimiento.

#### Scenario: Mismo palo
- **WHEN** se mueve el 7 de picas sobre el 8 de picas
- **THEN** el movimiento se acepta, y sobre el 8 de tréboles se rechaza

#### Scenario: Tramo con un hueco
- **WHEN** hay una columna vacía y se mueve un tramo de 2 cartas (6 y 5 de corazones) sobre el 7 de corazones
- **THEN** el movimiento se acepta, y un tramo de 3 se rechaza

#### Scenario: Tramo a una columna vacía
- **WHEN** hay dos columnas vacías y se mueve un tramo de 2 cartas a una de ellas
- **THEN** el movimiento se acepta, y un tramo de 3 se rechaza

### Requirement: Mazo y descarte de Cuarenta ladrones
Robar MUST pasar la carta de arriba del mazo al descarte, boca arriba. Solo la carta de arriba del descarte MUST poder jugarse, a una fundación o a una columna. Cuando el mazo se acaba, no se vuelve a pasar.

#### Scenario: Robar
- **WHEN** el jugador roba con 64 cartas en el mazo
- **THEN** el mazo tiene 63 y el descarte 1

#### Scenario: Sin reciclar
- **WHEN** el mazo está vacío
- **THEN** robar y reciclar no son acciones legales

### Requirement: Deshacer y autocompletar en Cuarenta ladrones
El jugador MUST poder deshacer los movimientos en orden inverso, uno por uno, hasta el inicio, incluido robar. Deshacer cuenta como un movimiento más.

Cuando el mazo y el descarte están vacíos y todas las cartas de las columnas pueden subir a las fundaciones una tras otra, el jugador MUST poder autocompletar: el sistema las sube todas.

#### Scenario: Deshacer un robo
- **WHEN** se deshace un robo
- **THEN** la carta vuelve del descarte al mazo

#### Scenario: Autocompletar
- **WHEN** el mazo y el descarte están vacíos y cada carta que falta puede subir en su turno
- **THEN** autocompletar está disponible y, al usarlo, las 104 cartas terminan en las fundaciones

### Requirement: Victoria, contadores y vista de Cuarenta ladrones
La partida MUST terminar con victoria cuando las 104 cartas están en las fundaciones. MUST llevar el número de movimientos y el tiempo jugado, y el jugador MUST poder abandonar en cualquier momento.

La vista MUST mostrar las columnas, las fundaciones, el descarte, cuántas cartas quedan en el mazo, los movimientos y la situación. MUST NOT mostrar el orden del mazo.

#### Scenario: Victoria
- **WHEN** se coloca la última carta en una fundación
- **THEN** la partida termina con victoria

#### Scenario: Mazo oculto
- **WHEN** se pide la vista al empezar la partida
- **THEN** muestra que quedan 64 cartas en el mazo, pero no cuáles
