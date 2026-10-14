## ADDED Requirements

### Requirement: IA de Pocha nivel básico
La Pocha MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- Al apostar, estima sus bazas: los triunfos altos y los Ases cuentan como bazas probables. Si la estimación es la apuesta prohibida, se desvía la mínima cantidad posible.
- Mientras le faltan bazas para cumplir su apuesta, intenta ganar cada baza con la carta más barata que la gane.
- Cuando ya tiene las bazas que apostó, intenta perder: juega la carta más alta que no gane la baza, para deshacerse de las que podrían ganar más adelante.

Este nivel MUST sumar más puntos que jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Ya cumplida, no gana más
- **WHEN** la IA ya hizo las bazas que apostó y puede jugar una carta que pierde la baza
- **THEN** juega una carta que no gana la baza

#### Scenario: Partidas completas de Pocha
- **WHEN** se juegan 1.000 partidas de Pocha entre IAs con semillas distintas, con 3 y 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Pocha
- **WHEN** la IA básica juega 1.000 partidas de Pocha contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
