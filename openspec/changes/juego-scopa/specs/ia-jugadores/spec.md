## ADDED Requirements

### Requirement: IA de la Scopa nivel básico
La Scopa MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST puntuar cada jugada legal y elegir la de más valor:
- **Al capturar:**
  - una scopa vale 1000;
  - cada carta capturada (la jugada incluida) vale 3, más 100 si es el siete de oros, 30 si es un siete y 10 si es un oro.
- **Al dejar una carta en la mesa:** resta lo que valdría capturarla.
- **Riesgo:** resta 80 si la mesa que queda suma 10 o menos y no está vacía, porque el rival podría llevársela entera de una vez.

Con 4 jugadores, el riesgo se valora igual. Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Prefiere la scopa
- **WHEN** en la mesa solo hay un 3 y un 4 y la IA tiene un 7 de copas y un 3 de bastos
- **THEN** juega el 7 y se lleva las dos cartas

#### Scenario: Se lleva el settebello
- **WHEN** en la mesa hay un 7 de oros y un 7 de copas y la IA juega un 7
- **THEN** se lleva el 7 de oros

#### Scenario: Partidas completas de Scopa
- **WHEN** se juegan 100 partidas de Scopa entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Scopa
- **WHEN** una IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
