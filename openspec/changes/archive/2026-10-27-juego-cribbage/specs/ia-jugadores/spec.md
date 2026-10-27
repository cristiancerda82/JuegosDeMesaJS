## ADDED Requirements

### Requirement: IA del Cribbage nivel básico
El Cribbage MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Echar al crib:** las 2 cartas cuya ausencia deja la mano con más puntos esperados, contando la media sobre los starters posibles. Lo que echa suma si el crib es suyo y resta si es del otro (por ejemplo, un 5 o una pareja).
- **Jugar las cartas:** la carta que más puntos le da enseguida. A igualdad, evita dejar la cuenta en 5 o en 21 (un 10 del otro haría 15 o 31) y prefiere soltar las cartas más altas.
- **Go:** solo cuando no le cabe ninguna carta.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Se queda los cincos
- **WHEN** la IA tiene 5, 5, 10, J, 2 y 9, y el crib es del otro
- **THEN** no echa ningún 5

#### Scenario: Busca el quince
- **WHEN** la cuenta es 10 y la IA tiene un 5 y un 8
- **THEN** juega el 5

#### Scenario: Partidas completas de Cribbage
- **WHEN** se juegan 100 partidas de Cribbage entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cribbage
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
