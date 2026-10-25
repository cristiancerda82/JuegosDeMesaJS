# juego-scorpion Specification

## Purpose
TBD - created by archiving change juego-scorpion. Update Purpose after archive.

## Requirements

### Requirement: Reparto del Scorpion
Una partida de Scorpion MUST repartir una baraja francesa barajada así:
- 7 columnas de 7 cartas: en las 4 primeras, las 3 de abajo boca abajo y las 4 de arriba boca arriba; en las otras 3, las 7 boca arriba;
- las 3 cartas restantes, boca abajo, a la reserva.

#### Scenario: Reparto inicial
- **WHEN** se crea una partida de Scorpion
- **THEN** hay 7 columnas de 7 cartas, las 4 primeras con 3 tapadas, las otras 3 sin ninguna tapada, y 3 cartas en la reserva

### Requirement: Mover en el Scorpion
Cualquier carta boca arriba de una columna MUST poder moverse, junto con todas las cartas que tenga encima, a otra columna cuya carta de arriba sea la siguiente de su mismo palo: el 6 de picas sobre el 7 de picas. Las cartas que van encima no necesitan estar en orden. Una columna vacía MUST admitir solo una K, con las cartas que tenga encima. El movimiento cuenta como uno, mueva las cartas que mueva.

#### Scenario: Mover con las cartas de encima
- **WHEN** una columna tiene el 6 de picas con el 2 de corazones y la J de tréboles encima, y otra columna acaba en el 7 de picas
- **THEN** se pueden mover las tres cartas sobre el 7 de picas, y quedan 7♠, 6♠, 2♥ y J♣

#### Scenario: Otro palo
- **WHEN** se intenta mover el 6 de corazones sobre el 7 de picas
- **THEN** el movimiento se rechaza

#### Scenario: Columna vacía
- **WHEN** hay una columna vacía
- **THEN** se puede mover a ella una K (con lo que tenga encima), y ninguna otra carta

### Requirement: Cartas tapadas del Scorpion
Cuando una carta boca abajo queda arriba de su columna, MUST darse la vuelta sola en el mismo movimiento.

#### Scenario: Descubrir una carta
- **WHEN** se mueven todas las cartas boca arriba de una de las 4 primeras columnas
- **THEN** la carta tapada que queda arriba se pone boca arriba

### Requirement: Reserva del Scorpion
Mientras la reserva tenga cartas, el jugador MUST poder repartirla: pone una carta boca arriba encima de cada una de las 3 primeras columnas. Solo se reparte una vez.

#### Scenario: Repartir la reserva
- **WHEN** el jugador reparte la reserva
- **THEN** cada una de las 3 primeras columnas tiene una carta más, boca arriba, y la reserva queda vacía

### Requirement: Deshacer, victoria y vista del Scorpion
El jugador MUST poder deshacer los movimientos en orden inverso, uno por uno, hasta el inicio, incluido el reparto de la reserva y las cartas que se descubrieron. Deshacer cuenta como un movimiento más.

La partida MUST terminar con victoria cuando cada palo forma, en una columna, una escalera de la K al As. MUST llevar el número de movimientos y el tiempo jugado, y el jugador MUST poder abandonar en cualquier momento.

La vista MUST mostrar las cartas boca arriba de cada columna, cuántas tiene boca abajo, cuántas quedan en la reserva, los movimientos y la situación. MUST NOT mostrar las cartas boca abajo ni las de la reserva.

#### Scenario: Deshacer un movimiento que descubrió una carta
- **WHEN** se deshace un movimiento que descubrió una carta tapada
- **THEN** las cartas vuelven a su columna y esa carta vuelve a estar boca abajo

#### Scenario: Victoria
- **WHEN** el último movimiento deja las cuatro escaleras de la K al As en la mesa
- **THEN** la partida termina con victoria

#### Scenario: Cartas tapadas ocultas
- **WHEN** se pide la vista al empezar la partida
- **THEN** muestra que hay 3 cartas tapadas en las 4 primeras columnas y 3 en la reserva, pero no cuáles
