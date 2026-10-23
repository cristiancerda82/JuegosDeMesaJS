## ADDED Requirements

### Requirement: IA del Blackjack nivel básico
El Blackjack MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable, pero sin la estrategia básica completa (eso lo hace la experta en la que se apoya el nivel difícil):
- **Apostar:** apuesta 10 fichas, o la mayor apuesta legal si tiene menos.
- **Jugar como la banca:** pide con 16 o menos y se planta con 17 o más.
- **Doblar:** dobla con 10 u 11 si puede.
- **Separar:** separa los ases y los ochos si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pide con 16
- **WHEN** la IA tiene 16 y la banca muestra un 6
- **THEN** pide carta

#### Scenario: Dobla con 11
- **WHEN** la IA tiene un 5 y un 6 y puede doblar
- **THEN** dobla

#### Scenario: Separa ases
- **WHEN** la IA tiene dos ases y puede separar
- **THEN** separa

#### Scenario: Partidas completas de Blackjack
- **WHEN** se juegan 500 partidas de Blackjack entre IAs con semillas distintas, de 1 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Blackjack
- **WHEN** la IA básica juega 500 partidas de 2 jugadores contra uno que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
