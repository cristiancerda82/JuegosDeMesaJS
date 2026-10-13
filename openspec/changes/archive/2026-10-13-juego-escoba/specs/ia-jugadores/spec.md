## ADDED Requirements

### Requirement: IA de Escoba nivel básico
La Escoba MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Hace escoba siempre que puede.
- Si puede recoger, elige la captura más valiosa: la que lleva el 7 de oros, luego más sietes, más oros y más cartas.
- Si no recoge, evita dejar en la mesa una suma que permita al rival hacer escoba, y evita soltar sietes y oros cuando tiene otra opción.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las manos.

#### Scenario: Hace escoba
- **WHEN** la IA tiene una jugada que deja la mesa vacía
- **THEN** la elige

#### Scenario: Se lleva el 7 de oros
- **WHEN** la IA puede recoger de dos formas y solo una incluye el 7 de oros
- **THEN** elige la que incluye el 7 de oros

#### Scenario: No da escoba
- **WHEN** la IA no puede recoger y una de sus cartas dejaría en la mesa una suma entre 5 y 14 mientras otra no
- **THEN** juega la que no deja la mesa a tiro de escoba

#### Scenario: Partidas completas de Escoba
- **WHEN** se juegan 1.000 partidas de Escoba entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Escoba
- **WHEN** la IA básica juega 1.000 manos de Escoba contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las manos
