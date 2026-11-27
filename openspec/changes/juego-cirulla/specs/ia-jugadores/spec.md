## ADDED Requirements

### Requirement: IA de la Cirulla nivel básico
La Cirulla MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST valorar cada jugada como la IA básica de la Scopa (escobas, el 7 de oros, los sietes, los oros y las cartas), y además:
- valorar las cartas de la cirulla grande (la Sota, el Caballo y el Rey de oros) y de la pequeña (del As al 6 de oros) al capturarlas, y en contra al soltarlas;
- penalizar dejar una mesa que un rival pueda barrer con una carta de su valor, sumando 15 o, si en ella no queda ningún As, con un As que aún no haya salido.

Este nivel MUST ganar claramente más partidas que un jugador que elige acciones legales al azar.

#### Scenario: Se lleva la grande
- **WHEN** la IA puede llevarse el Rey de oros o el Rey de bastos con su Rey de copas
- **THEN** se lleva el Rey de oros

#### Scenario: Partidas completas de Cirulla
- **WHEN** se juegan partidas de Cirulla entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Cirulla
- **WHEN** la IA básica juega muchas partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
