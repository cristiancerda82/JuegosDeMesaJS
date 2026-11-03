## ADDED Requirements

### Requirement: IA del Truco nivel básico
El Truco MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar como la IA básica del Truc, con las apuestas del Truco:
- **Envido:** canta envido con 30 puntos o más. Al responder, sube a real envido con 31 o más y a falta envido con 33 o más si puede; si no, quiere según sus puntos, con más exigencia cuanto más alto es lo cantado.
- **Truco:** valora su mano por sus cartas y las bazas ya ganadas. Canta truco o sube con una mano fuerte y acepta solo si su mano lo justifica. Con una probabilidad baja y fija farolea; esa decisión sale del azar del agente, así que es reproducible.
- **Al jugar:** gana la baza con la carta más baja que la gane cuando le conviene. Si no puede ganarla o ya la gana su compañero, juega la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Canta envido con muchos puntos
- **WHEN** a la IA le toca en la primera baza con 33 puntos de envido y nadie ha cantado
- **THEN** canta envido

#### Scenario: No quiere con mano mala
- **WHEN** el rival le canta truco a la IA y ella tiene un 4, un 5 y un 6 sin bazas ganadas
- **THEN** no quiere

#### Scenario: Partidas completas de Truco
- **WHEN** se juegan 200 partidas de Truco entre IAs con semillas distintas, de 2 y de 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Truco
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
