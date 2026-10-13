## ADDED Requirements

### Requirement: IA de Siete y media nivel básico
La Siete y media MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Como punto, pide carta mientras su jugada vale menos de 5 y se planta a partir de 5. Apuesta más cuando tiene más fichas, sin pasar nunca de la apuesta máxima.
- Como banca, no se planta mientras pierda contra alguna jugada visible de un punto que siga en juego (contando su carta tapada como medio punto como mínimo), salvo que su jugada ya valga 6 o más. Si no hay nada que superar, se planta a partir de 5.

Este nivel MUST terminar con más fichas que un jugador que elige acciones legales al azar en la mayoría de las partidas.

#### Scenario: El punto se planta con 5
- **WHEN** la IA es punto y su jugada vale 5,5
- **THEN** se planta

#### Scenario: El punto pide con poco
- **WHEN** la IA es punto y su jugada vale 3
- **THEN** pide carta

#### Scenario: Partidas completas de Siete y media
- **WHEN** se juegan 1.000 partidas de Siete y media entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Siete y media
- **WHEN** la IA básica juega 1.000 partidas de Siete y media contra un jugador que elige acciones legales al azar
- **THEN** termina con más fichas que él en claramente más de la mitad de las partidas
