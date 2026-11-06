## ADDED Requirements

### Requirement: IA del Treinta y uno nivel básico
El Treinta y uno MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Plantarse:** se planta si puede y su mano vale 27 o más.
- **Robar:** coge la carta del descarte si con ella (y descartando la peor) su mano sube al menos 4 puntos; si no, roba del mazo.
- **Descartar:** la carta que deja la mano de más valor; si empatan, la de menos valor.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Se planta con buena mano
- **WHEN** la IA tiene el As, el K y el 8 de picas y nadie se ha plantado
- **THEN** se planta

#### Scenario: Coge del descarte
- **WHEN** la IA tiene el As y el 9 de corazones y el 4 de picas, y arriba del descarte está el K de corazones
- **THEN** coge el K de corazones y descarta el 4 de picas

#### Scenario: Partidas completas de Treinta y uno
- **WHEN** se juegan 100 partidas de Treinta y uno entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Treinta y uno
- **WHEN** una IA básica juega 300 partidas de 4 contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte
