## ADDED Requirements

### Requirement: IA de Guiñote nivel básico
El Guiñote MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Canta siempre que puede, las 40 antes que las 20.
- Cambia el 7 de triunfo cuando puede.
- No juega el rey ni la sota de una pareja que aún puede cantar, si tiene otra carta legal y queda mazo.
- Si puede ganar una baza con puntos sin gastar triunfo, la gana. Cuando no puede ganar, entrega la carta de menor valor.

Este nivel MUST ganar la mayoría de las partidas contra un jugador que elige acciones legales al azar.

#### Scenario: Canta lo que puede
- **WHEN** la IA ganó la última baza, queda mazo y tiene el rey y la sota de triunfo sin cantar
- **THEN** canta las 40 antes de salir

#### Scenario: Guarda la pareja
- **WHEN** la IA sale con mazo, tiene el rey y la sota de un palo sin cantar y tiene otras cartas legales
- **THEN** no juega ni ese rey ni esa sota

#### Scenario: Partidas completas de Guiñote
- **WHEN** se juegan 1.000 partidas de Guiñote entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Guiñote
- **WHEN** la IA básica juega 1.000 partidas de Guiñote contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
