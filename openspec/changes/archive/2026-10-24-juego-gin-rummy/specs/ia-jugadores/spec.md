## ADDED Requirements

### Requirement: IA del Gin Rummy nivel básico
El Gin Rummy MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Primera carta y robo:** coge la carta del descarte si con ella baja sus puntos sueltos (después de descartar la peor) o le deja una pareja o dos cartas seguidas del mismo palo que antes no tenía; si no, pasa o roba del mazo.
- **Descartar:** suelta la carta suelta que menos le sirve: la de más puntos que no esté en una pareja ni junto a otra del mismo palo; si todas le sirven, la de más puntos.
- **Cerrar:** cierra en cuanto puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Coger el descarte que liga
- **WHEN** la IA tiene el 5 y el 6 de corazones y en el descarte está el 7 de corazones
- **THEN** coge el descarte

#### Scenario: Soltar la carta más cara que no sirve
- **WHEN** la IA tiene sueltas una K sin pareja ni vecinas y un 3 junto al 4 del mismo palo
- **THEN** descarta la K

#### Scenario: Cerrar en cuanto puede
- **WHEN** la IA puede cerrar dejando 9 puntos sueltos
- **THEN** cierra

#### Scenario: Partidas completas de Gin Rummy
- **WHEN** se juegan 500 partidas de Gin Rummy entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Gin Rummy
- **WHEN** la IA básica juega 500 partidas contra uno que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
