## ADDED Requirements

### Requirement: IA de Tute nivel básico
El Tute MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Canta el tute cuando puede y, si no, canta siempre que puede, las 40 antes que las 20.
- Cambia el 7 de triunfo cuando puede.
- No juega el rey ni el caballo de una pareja que aún puede cantar, si tiene otra carta legal.
- Si puede ganar una baza con puntos sin gastar triunfo, la gana, y cuando no puede ganar entrega la carta de menor valor.

Este nivel MUST ganar a un jugador que elige acciones legales al azar en la mayoría de las manos.

#### Scenario: Canta lo que puede
- **WHEN** la IA ganó la última baza y tiene el rey y el caballo de triunfo sin cantar
- **THEN** canta las 40 antes de salir

#### Scenario: Guarda la pareja
- **WHEN** la IA sale, tiene el rey y el caballo de un palo sin cantar y tiene otras cartas legales
- **THEN** no juega ni ese rey ni ese caballo

#### Scenario: Partidas completas de Tute
- **WHEN** se juegan 1.000 partidas de Tute entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tute
- **WHEN** la IA básica juega 1.000 manos de Tute contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad de las manos
