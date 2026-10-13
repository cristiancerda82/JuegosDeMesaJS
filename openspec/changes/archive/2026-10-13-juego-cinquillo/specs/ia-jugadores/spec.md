## ADDED Requirements

### Requirement: IA de Cinquillo nivel básico
El Cinquillo MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Entre sus jugadas legales, prefiere la que le deja más cartas propias por jugar en esa dirección, porque le abre camino a sí misma.
- Penaliza las jugadas que abren camino a cartas que no tiene, porque las tendrán los rivales.
- Si no le cuesta nada, juega antes las cartas de los extremos (el As y el Rey), que nadie más puede ayudarle a soltar.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Se abre camino a sí misma
- **WHEN** la IA puede jugar el 6 o el 4 de bastos, tiene también el 7 y la Sota de bastos y ninguna carta por debajo del 4
- **THEN** juega el 6 de bastos

#### Scenario: Partidas completas de Cinquillo
- **WHEN** se juegan 1.000 partidas de Cinquillo entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cinquillo
- **WHEN** la IA básica juega 1.000 partidas de Cinquillo contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
