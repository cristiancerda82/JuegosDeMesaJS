## MODIFIED Requirements

### Requirement: Pista de un solitario
Cada solitario (Klondike, FreeCell, Spider y Pirámide) MUST tener una función de pista que, a partir de la vista del jugador y de sus acciones legales, devuelva una acción legal útil o `null` si no ve ninguna. La pista MUST ser determinista e instantánea (menos de 50 ms). MUST NOT sugerir deshacer, abandonar ni autocompletar.

Un movimiento MUST considerarse útil solo si cambia algo que acerca a la victoria:
- sube una carta a una fundación;
- descubre una carta boca abajo;
- vacía una columna en la que quedaba algo por hacer;
- saca una carta del descarte o de una celda libre a una columna;
- en el Spider, alarga una escalera del mismo palo;
- en la Pirámide, quita cartas de la pirámide (mejor si libera otras) o, si no, quita la carta del descarte.

MUST NOT considerarse útiles los movimientos de ida y vuelta:
- pasar una escalera de una columna a otra sin descubrir ni vaciar nada;
- bajar una carta de una fundación;
- mover un Rey que ya está solo al fondo de su columna a otra columna vacía.

Si no hay ningún movimiento útil, la pista MUST sugerir robar o reciclar (Klondike y Pirámide) o repartir (Spider) cuando se pueda; si tampoco se puede, MUST devolver `null`.

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
