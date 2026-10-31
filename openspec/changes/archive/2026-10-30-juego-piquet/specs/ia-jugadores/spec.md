## ADDED Requirements

### Requirement: IA del Piquet nivel básico
El Piquet MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Cambio:** valora cada carta de su mano: suman su rango, estar en su palo más largo y estar en una posible secuencia o conjunto. Descarta las que menos valen:
  - el mayor, al menos 1 y como mucho 5, y siempre todas las que valen poco hasta ese máximo;
  - el menor, como mucho las que quedan en el montón.
- **Al salir:** juega la carta más alta de su palo más largo.
- **Al responder:** si puede ganar la baza, la gana con la carta más baja que gana; si no, juega la carta más baja permitida.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Gana con lo justo
- **WHEN** el rival sale con la Q de picas y la IA tiene el K, el As y el 7 de picas
- **THEN** juega el K de picas

#### Scenario: Sin poder ganar
- **WHEN** el rival sale con el As de corazones y la IA tiene el 8 y el K de corazones
- **THEN** juega el 8 de corazones

#### Scenario: Partidas completas de Piquet
- **WHEN** se juegan 100 partidas de Piquet entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Piquet
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
