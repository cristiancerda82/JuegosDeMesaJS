# juego-canfield Specification

## Purpose
TBD - created by archiving change juego-canfield. Update Purpose after archive.

## Requirements

### Requirement: Reparto del Canfield
Una partida de Canfield MUST repartir una baraja francesa barajada así:
- 13 cartas a la **reserva**, con solo la de arriba boca arriba;
- la siguiente, a la primera fundación: su número es la **base** de las cuatro fundaciones;
- una carta boca arriba a cada una de las 4 columnas;
- las 34 restantes, boca abajo, al mazo.

El descarte y las otras tres fundaciones empiezan vacíos.

#### Scenario: Reparto inicial
- **WHEN** se crea una partida de Canfield
- **THEN** la reserva tiene 13 cartas, la primera fundación 1, cada columna 1, el mazo 34 y el descarte 0
- **AND** la base es el número de la carta de la primera fundación

### Requirement: Fundaciones con base y vuelta
Cada fundación MUST empezar con una carta del número base, de cualquier palo, y subir de una en una por ese palo. Después de la K va el As: con base 9, una fundación va 9, 10, J, Q, K, A, 2… hasta el 8, y entonces está completa con 13 cartas. MUST poder subir a una fundación la carta de arriba del descarte o de la reserva, o la última de una columna. MUST poder bajar la carta de arriba de una fundación a una columna, respetando las reglas de las columnas.

#### Scenario: Empezar una fundación
- **WHEN** la base es el 9 y se intenta subir el 9 de corazones a una fundación vacía
- **THEN** el movimiento se acepta, y con el As de corazones se rechaza

#### Scenario: Dar la vuelta
- **WHEN** una fundación de tréboles con base 9 tiene arriba la K de tréboles
- **THEN** la siguiente que admite es el As de tréboles

### Requirement: Columnas del Canfield
En las columnas MUST construirse bajando de uno en uno y alternando colores, también con vuelta: una K puede ir sobre un As. MUST poder moverse a otra columna una carta o un tramo de cartas que bajen y alternen colores, desde cualquier punto de la columna, si la carta de abajo del tramo puede ir sobre la última de la columna de destino.

#### Scenario: Construir con vuelta
- **WHEN** se mueve la K de picas sobre el As de corazones de una columna
- **THEN** el movimiento se acepta

#### Scenario: Mismo color
- **WHEN** se intenta mover el 9 de picas sobre el 10 de tréboles
- **THEN** el movimiento se rechaza

### Requirement: Huecos y reserva del Canfield
Cuando una columna queda vacía y la reserva tiene cartas, la carta de arriba de la reserva MUST pasar a ese hueco en el mismo movimiento, y la siguiente de la reserva se pone boca arriba. Si la reserva está vacía, el hueco MUST poder ocuparse con cualquier carta o tramo que se pueda mover: la de arriba del descarte, o una carta o tramo de otra columna.

La carta de arriba de la reserva MUST poder jugarse a una fundación o a una columna en la que encaje.

#### Scenario: Hueco llenado con la reserva
- **WHEN** se mueve la única carta de una columna a una fundación y la reserva tiene cartas
- **THEN** la carta de arriba de la reserva pasa a esa columna y se descubre la siguiente de la reserva

#### Scenario: Hueco sin reserva
- **WHEN** la reserva está vacía y una columna está vacía
- **THEN** cualquier carta de arriba del descarte puede ir a esa columna

### Requirement: Mazo y descarte del Canfield
La configuración MUST elegir si se roba de 3 en 3 (por defecto) o de 1 en 1. Robar pasa esa cantidad de cartas del mazo al descarte, o las que queden si son menos; solo la de arriba del descarte se puede jugar. Con el mazo vacío y cartas en el descarte, MUST poder reciclarse el descarte al mazo, sin límite de vueltas.

#### Scenario: Robar de 3
- **WHEN** se roba de 3 con 10 cartas en el mazo
- **THEN** pasan 3 cartas al descarte y solo la última se puede jugar

### Requirement: Deshacer y autocompletar en el Canfield
El jugador MUST poder deshacer los movimientos en orden inverso, uno por uno, hasta el inicio. Deshacer restaura también el hueco llenado con la reserva y la carta de la reserva que se descubrió. Deshacer cuenta como un movimiento más.

Cuando el mazo, el descarte y la reserva están vacíos y las cartas de las columnas pueden subir una tras otra a las fundaciones, el jugador MUST poder autocompletar: el sistema las sube todas. Con la vuelta, no siempre pueden: con base 9, una columna 10, 9, 8 tapa el 9 con el 8, que es el último de su fundación.

#### Scenario: Deshacer un hueco llenado
- **WHEN** se deshace un movimiento que vació una columna y la llenó con la reserva
- **THEN** la carta vuelve a la reserva, boca arriba y arriba del todo, y la columna recupera su carta

#### Scenario: Autocompletar
- **WHEN** el mazo, el descarte y la reserva están vacíos y cada carta que falta en las fundaciones puede subir en su turno
- **THEN** autocompletar está disponible y, al usarlo, las 52 cartas terminan en las fundaciones

#### Scenario: Sin autocompletar
- **WHEN** el mazo, el descarte y la reserva están vacíos, la base es el 9 y una columna tiene el 9 de picas tapado por el 8 de corazones, que aún no puede subir
- **THEN** autocompletar no está disponible

### Requirement: Victoria, contadores y vista del Canfield
La partida MUST terminar con victoria cuando las 52 cartas están en las fundaciones. La partida MUST llevar el número de movimientos y el tiempo jugado, y el jugador MUST poder abandonar en cualquier momento.

La vista MUST mostrar la base, la carta de arriba de la reserva y cuántas quedan, cuántas cartas hay en el mazo, el descarte, las fundaciones, las columnas, los movimientos y la situación. MUST NOT mostrar las cartas de la reserva que están debajo de la de arriba ni el orden del mazo.

#### Scenario: Victoria
- **WHEN** se coloca la última carta en una fundación
- **THEN** la partida termina con victoria

#### Scenario: Reserva oculta
- **WHEN** se pide la vista al empezar la partida
- **THEN** muestra la carta de arriba de la reserva y que quedan 13, pero no las otras 12
