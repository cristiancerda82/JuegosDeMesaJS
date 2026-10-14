## ADDED Requirements

### Requirement: IA de Mus nivel básico
El Mus MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Corta el mus con una mano buena (31 de juego, duples, medias o tres reyes) y, si pide mus, descarta las cartas que no forman pares ni son reyes.
- En cada lance valora la fuerza de su jugada, teniendo en cuenta si es mano. Envida o sube con jugadas fuertes, quiere los envites con jugadas suficientes y no quiere con jugadas flojas.
- Solo echa un órdago con jugadas casi imbatibles, y quiere el de los rivales con jugadas fuertes (para no regalar una piedra a cada órdago de farol).

Este nivel MUST ganar más juegos que una pareja que elige acciones legales al azar en la mayoría de las partidas.

#### Scenario: Corta con 31
- **WHEN** a la IA le toca hablar en el mus y tiene 31 de juego
- **THEN** corta el mus

#### Scenario: No quiere con una jugada floja
- **WHEN** la IA recibe un envite a Grande sin ningún rey ni caballo
- **THEN** no lo quiere

#### Scenario: Partidas completas de Mus
- **WHEN** se juegan 1.000 partidas de Mus entre IAs con semillas distintas y distintas opciones
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Mus
- **WHEN** la IA básica juega 1.000 partidas de Mus en pareja contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
