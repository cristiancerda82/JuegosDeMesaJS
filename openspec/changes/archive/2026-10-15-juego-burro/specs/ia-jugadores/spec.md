## ADDED Requirements

### Requirement: IA del Burro nivel básico
El Burro MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Al pasar:** guarda las cartas del número del que más tiene y pasa una del número del que menos tiene; si hay empate, elige al azar entre los empatados.
- **Al plantarse:** se planta siempre que puede, tanto si tiene 4 iguales como si ya se ha plantado otro.

El retraso con el que la IA actúa en la mesa lo decide el cliente, no la IA.

Contra jugadores al azar, este nivel MUST perder claramente menos partidas que ellos, aunque el orden en que se reacciona a una plantada sea al azar.

#### Scenario: Pasa del número que menos tiene
- **WHEN** la IA tiene tres reyes y un as
- **THEN** pasa el as

#### Scenario: Se planta con cuatro iguales
- **WHEN** la IA tiene los cuatro caballos y nadie se ha plantado
- **THEN** se planta

#### Scenario: Partidas completas de Burro
- **WHEN** se juegan 1.000 partidas de Burro entre IAs con semillas distintas, con 3, 4 y 5 jugadores, y el asiento que actúa en cada momento se elige al azar entre los que pueden
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Burro
- **WHEN** la IA básica juega 1.000 partidas de 4 jugadores contra tres jugadores que eligen acciones legales al azar, con el asiento que actúa elegido al azar
- **THEN** es el burro en menos del 15 % de las partidas
