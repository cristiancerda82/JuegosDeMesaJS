## ADDED Requirements

### Requirement: IA del Casino nivel básico
El Casino MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Recoger:** si puede recoger, elige la recogida que más vale: cada carta cuenta, y más las picas, los Ases, el 10 de diamantes, el 2 de picas y la barrida.
- **Construir:** si no recoge, construye cuando la construcción le asegura cartas para la siguiente vez (tiene la carta del valor), prefiriendo la que junta más cartas.
- **Dejar:** si no, deja la carta que menos vale: ni Ases, ni el 10 de diamantes, ni el 2 de picas, ni picas si puede evitarlo.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Recoge el Big Casino
- **WHEN** la IA puede recoger con un 10 el 10 de diamantes, o con un 4 un 4 de tréboles
- **THEN** recoge el 10 de diamantes

#### Scenario: Construye cuando puede recoger después
- **WHEN** la IA no puede recoger, tiene un 3 y un 8, y en la mesa hay un 5
- **THEN** construye un 8

#### Scenario: Partidas completas de Casino
- **WHEN** se juegan 100 partidas de Casino entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Casino
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
