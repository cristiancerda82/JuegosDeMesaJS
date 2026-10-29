# juego-belle-lucie Specification

## Purpose
TBD - created by archiving change juego-belle-lucie. Update Purpose after archive.

## Requirements

### Requirement: Reparto de La Belle Lucie
La Belle Lucie MUST jugarse con la baraja francesa de 52 cartas y un solo jugador. Al empezar, las cartas MUST repartirse, todas boca arriba, en 17 *abanicos* de 3 cartas y uno de 1. Solo la carta de arriba de cada abanico se puede mover. Hay 4 *fundaciones*, vacías al empezar.

#### Scenario: Reparto
- **WHEN** empieza una partida
- **THEN** hay 18 abanicos, 17 de 3 cartas y uno de 1, todas a la vista, y las fundaciones vacías

### Requirement: Mover cartas en La Belle Lucie
La carta de arriba de un abanico MUST poder moverse:
- a la fundación de su palo, si es un As y la fundación está vacía, o la siguiente más alta de la que hay arriba;
- sobre la carta de arriba de otro abanico, si es la siguiente más baja del mismo palo (el 6 de picas sobre el 7 de picas).

Un abanico vacío MUST quedarse vacío: no admite cartas. Las cartas de las fundaciones no se pueden volver a mover.

#### Scenario: Subir a la fundación
- **WHEN** la carta de arriba de un abanico es el As de corazones
- **THEN** puede subirse a la fundación de corazones, y después el 2 de corazones sobre él

#### Scenario: Mismo palo, una menos
- **WHEN** la carta de arriba de un abanico es el 6 de picas y la de otro es el 7 de picas
- **THEN** el 6 puede ir sobre el 7, pero no sobre el 7 de tréboles ni sobre el 8 de picas

#### Scenario: Abanico vacío
- **WHEN** un abanico se queda sin cartas
- **THEN** ninguna carta puede ir a él

### Requirement: Rebarajes de La Belle Lucie
Dos veces por partida, el jugador MUST poder rebarajar: se recogen todas las cartas que quedan en los abanicos, se barajan y se reparten de nuevo en abanicos de 3 (el último, con las que sobren). Las fundaciones no cambian. Rebarajar cuenta como un movimiento.

#### Scenario: Rebarajar
- **WHEN** quedan 40 cartas en los abanicos y el jugador rebaraja por primera vez
- **THEN** quedan 14 abanicos (13 de 3 y uno de 1) con las mismas 40 cartas, y le queda un rebaraje

#### Scenario: Sin más rebarajes
- **WHEN** el jugador ya ha rebarajado dos veces
- **THEN** no puede volver a rebarajar

### Requirement: Merci de La Belle Lucie
Una sola vez, y solo después del segundo rebaraje, el jugador MUST poder hacer la *merci*: elegir una carta de un abanico que no sea la de arriba y ponerla arriba de ese mismo abanico. La merci cuenta como un movimiento.

#### Scenario: Usar la merci
- **WHEN** tras el segundo rebaraje un abanico tiene, de abajo arriba, el 5 de picas, el 2 de corazones y el 9 de tréboles, y el jugador hace la merci con el 2 de corazones
- **THEN** el abanico queda con el 5 de picas, el 9 de tréboles y el 2 de corazones arriba, y ya no hay más merci

#### Scenario: Antes de tiempo
- **WHEN** al jugador le queda algún rebaraje
- **THEN** no puede hacer la merci

### Requirement: Deshacer, victoria y abandono en La Belle Lucie
El jugador MUST poder deshacer cualquier movimiento, rebaraje o merci, volviendo al tablero anterior. La partida MUST ganarse al tener las 52 cartas en las fundaciones, y el jugador MUST poder abandonarla en cualquier momento. El resultado lleva los movimientos.

#### Scenario: Deshacer un rebaraje
- **WHEN** el jugador rebaraja y después deshace
- **THEN** los abanicos vuelven a estar como antes y vuelve a tener los mismos rebarajes

#### Scenario: Victoria
- **WHEN** el último K sube a su fundación
- **THEN** la partida termina con victoria

### Requirement: Vista de La Belle Lucie
La vista MUST mostrar todos los abanicos con sus cartas, las fundaciones, los rebarajes que quedan, si se puede hacer la merci, los movimientos y la situación de la partida (jugando, victoria o abandono). No hay cartas ocultas.

#### Scenario: Todo a la vista
- **WHEN** el jugador pide su vista
- **THEN** ve todas las cartas de todos los abanicos
