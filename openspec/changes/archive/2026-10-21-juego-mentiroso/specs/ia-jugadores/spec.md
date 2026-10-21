## ADDED Requirements

### Requirement: IA del Mentiroso nivel básico
El Mentiroso MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Bajar:** si tiene cartas del valor que toca, las baja todas (hasta 4). Si no tiene ninguna, miente con una carta: la de un valor que le tocará declarar más tarde. Además, mientras el montón tenga como mucho 6 cartas, rellena con cartas falsas hasta bajar 3, salvo que se fuera a quedar sin cartas: perder un montón pequeño cuesta poco y la mano se vacía antes.
- **Desconfiar:** dice «¡Mentiroso!»:
  - siempre que sea imposible que digan la verdad, porque las cartas declaradas más las que tiene él de ese valor pasan de 4;
  - siempre que quien bajó se haya quedado sin cartas;
  - y, si no, con una probabilidad que crece cuanto menos probable es que quien bajó tuviera tantas cartas de ese valor, por las que quedan sin ver, y algo menor con un montón grande. Usa su azar.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Dice la verdad cuando puede
- **WHEN** toca declarar sietes, la IA tiene dos sietes y el montón tiene 8 cartas
- **THEN** baja solo los dos sietes

#### Scenario: Miente con una carta
- **WHEN** toca declarar sietes, la IA no tiene ninguno y el montón tiene 8 cartas
- **THEN** baja una sola carta

#### Scenario: Rellena con el montón pequeño
- **WHEN** toca declarar sietes, la IA tiene un siete y muchas cartas, y el montón está vacío
- **THEN** baja tres cartas, entre ellas el siete

#### Scenario: Mentira imposible
- **WHEN** el rival declara 3 reyes y la IA tiene 2 reyes
- **THEN** dice «¡Mentiroso!»

#### Scenario: Partidas completas de Mentiroso
- **WHEN** se juegan 500 partidas de Mentiroso entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Mentiroso
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
