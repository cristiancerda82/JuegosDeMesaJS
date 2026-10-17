## ADDED Requirements

### Requirement: IA del Pinacle nivel básico
El Pinacle MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Al robar:** se lleva el montón cuando puede bajar su carta de arriba y el montón le aporta cartas que encajan con su mano o con las combinaciones de su bando; si no, roba del mazo.
- **Al bajar:**
  - baja las combinaciones que puede formar, prefiriendo las que usan menos comodines;
  - añade cartas a las combinaciones de su bando;
  - cambia comodines cuando puede;
  - si está barbelé, solo empieza a bajar si llega a 70.
- **Al descartar:** descarta la carta que menos le sirve, y evita las que el rival puede añadir a sus combinaciones o que se llevaría con el montón; nunca descarta un comodín si tiene otra opción.

Contra jugadores al azar, este nivel MUST ganar claramente.

#### Scenario: Bajar lo que tiene
- **WHEN** tras robar, la IA tiene en la mano 9♣, 9♦ y 9♠
- **THEN** baja el grupo de nueves antes de descartar

#### Scenario: No regalar cartas
- **WHEN** el rival tiene bajada una escalera de picas del 5 al 8, y la IA tiene que elegir entre descartar el 9♠ o un 4♦ que no le sirve
- **THEN** descarta el 4♦

#### Scenario: Partidas completas de Pinacle
- **WHEN** se juegan 200 partidas de Pinacle entre IAs, de 2 y de 4 jugadores, con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Pinacle
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana más del 90 %
