## ADDED Requirements

### Requirement: IA de Chinchón nivel básico
El Chinchón MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Roba del descarte solo si esa carta le baja los puntos sin ligar de su mejor mano posible tras descartar. Si no, roba del mazo.
- Descarta la carta con la que su mano queda con menos puntos sin ligar y, a igualdad, la de más valor.
- Cierra siempre que puede.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las partidas.

#### Scenario: Roba del descarte cuando le sirve
- **WHEN** la carta del descarte completa una combinación en la mano de la IA
- **THEN** la IA roba del descarte

#### Scenario: Descarta lo que menos sirve
- **WHEN** la IA tiene que descartar y una carta suelta de mucho valor no forma parte de ninguna combinación
- **THEN** descarta esa carta

#### Scenario: Cierra cuando puede
- **WHEN** cerrar está entre las acciones legales de la IA
- **THEN** cierra

#### Scenario: Partidas completas de Chinchón
- **WHEN** se juegan 1.000 partidas de Chinchón entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Chinchón
- **WHEN** la IA básica juega 1.000 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
