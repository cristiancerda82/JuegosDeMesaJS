## MODIFIED Requirements

### Requirement: Pista de un solitario
Cada solitario (Klondike, FreeCell, Spider, Pirámide, Golf, TriPeaks, Yukon, Canfield y Cuarenta ladrones) MUST tener una función de pista que, a partir de la vista del jugador y de sus acciones legales, devuelva una acción legal útil o `null` si no ve ninguna. La pista MUST ser determinista e instantánea (menos de 50 ms). MUST NOT sugerir deshacer, abandonar ni autocompletar.

Un movimiento MUST considerarse útil solo si cambia algo que acerca a la victoria:
- sube una carta a una fundación;
- descubre una carta boca abajo;
- vacía una columna en la que quedaba algo por hacer;
- saca una carta del descarte o de una celda libre a una columna;
- en el Spider, alarga una escalera del mismo palo;
- en la Pirámide, quita cartas de la pirámide (mejor si libera otras) o, si no, quita la carta del descarte;
- en el Golf, pasa una carta de una columna al descarte (mejor la que deja encadenar más cartas después).
- en TriPeaks, quita una carta de los picos (mejor la que deja encadenar más cartas boca arriba después, contando las que deja libres).
- en el Yukon, mueve un grupo que deja arriba de su columna una carta que puede subir a una fundación.
- en el Canfield, saca la carta de arriba de la reserva (a una fundación o a una columna), antes que una del descarte.
- en Cuarenta ladrones, como en el Klondike: sube a las fundaciones, saca la carta del descarte o vacía una columna.

MUST NOT considerarse útiles los movimientos de ida y vuelta:
- pasar una escalera de una columna a otra sin descubrir ni vaciar nada;
- bajar una carta de una fundación;
- mover un Rey que ya está solo al fondo de su columna a otra columna vacía.

Si no hay ningún movimiento útil, la pista MUST sugerir robar o reciclar (Klondike, Pirámide, Golf, TriPeaks, Canfield y Cuarenta ladrones; en este, solo robar) o repartir (Spider) cuando se pueda; si tampoco se puede, MUST devolver `null`.

#### Scenario: Prefiere la fundación
- **WHEN** en el Klondike se puede subir el As de corazones a una fundación y también mover una carta entre columnas
- **THEN** la pista sugiere subir el As

#### Scenario: Descubrir una carta
- **WHEN** en el Klondike no hay nada que subir a las fundaciones y un movimiento entre columnas deja a la vista una carta boca abajo
- **THEN** la pista sugiere ese movimiento

#### Scenario: Sin ida y vuelta
- **WHEN** el único movimiento entre columnas posible es pasar una escalera entera de una columna a otra sin descubrir ninguna carta
- **THEN** la pista no lo sugiere

#### Scenario: Robar cuando no hay nada mejor
- **WHEN** en el Klondike no hay ningún movimiento útil y el mazo tiene cartas
- **THEN** la pista sugiere robar

#### Scenario: Escalera del mismo palo en el Spider
- **WHEN** en el Spider un 7 de picas puede ir sobre un 8 de picas o sobre un 8 de corazones
- **THEN** la pista sugiere ponerlo sobre el 8 de picas

#### Scenario: Pareja de la pirámide antes que el descarte
- **WHEN** en la Pirámide se puede quitar una pareja de dos cartas de la pirámide y también una K que está arriba del descarte
- **THEN** la pista sugiere la pareja de la pirámide

#### Scenario: Robar en la Pirámide
- **WHEN** en la Pirámide no se puede quitar nada y queda mazo
- **THEN** la pista sugiere robar

#### Scenario: La carta que encadena más en el Golf
- **WHEN** en el Golf, con un 7 en el descarte, se puede mover un 6 tras el que no se puede seguir y un 8 tras el que quedan un 9 y un 10 por encadenar
- **THEN** la pista sugiere mover el 8

#### Scenario: Liberar una carta en el Yukon
- **WHEN** en el Yukon no hay nada que subir ni que descubrir, y mover un grupo deja arriba de su columna un as
- **THEN** la pista sugiere ese movimiento

#### Scenario: Sin pista en el Yukon
- **WHEN** en el Yukon ningún movimiento es útil
- **THEN** la pista no sugiere nada, porque no hay mazo

#### Scenario: La reserva antes que el descarte en el Canfield
- **WHEN** en el Canfield la carta de arriba de la reserva y la del descarte pueden ir a columnas, y no hay nada que subir a las fundaciones
- **THEN** la pista sugiere mover la de la reserva

#### Scenario: La carta que encadena más en TriPeaks
- **WHEN** en TriPeaks, con un 7 en el descarte, se puede quitar un 6 tras el que no se puede seguir y un 8 tras el que queda libre un 9
- **THEN** la pista sugiere quitar el 8

#### Scenario: Vaciar una columna en Cuarenta ladrones
- **WHEN** en Cuarenta ladrones no hay nada que subir a las fundaciones ni carta del descarte que encaje, y la única carta de una columna puede ir sobre otra
- **THEN** la pista sugiere ese movimiento, que deja una columna vacía
