## ADDED Requirements

### Requirement: IA del Cuarenta nivel básico
El Cuarenta MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST puntuar cada jugada legal y elegir la de más valor:
- **Al capturar:**
  - una caída vale 100;
  - una limpia vale 80;
  - cada carta capturada (la jugada incluida) vale 5.
- **Al dejar una carta en la mesa:**
  - resta lo que valdría capturar con ella;
  - resta 40 si quedan cartas de ese número que no ha visto, porque el siguiente podría hacer caída;
  - resta 30 si la mesa que queda tiene una sola carta o suma 7 o menos con todas sus cartas del As al 7, porque el siguiente podría hacer limpia.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Prefiere la caída
- **WHEN** el rival acaba de echar un 4, en la mesa están ese 4 y una K, y la IA tiene un 4 y una K
- **THEN** juega el 4 y se lleva el 4 del rival

#### Scenario: Suelta la carta más segura
- **WHEN** la IA no puede capturar, la mesa está vacía y tiene un 3 del que ya han salido los otros tres y un 6 del que no ha salido ninguno
- **THEN** suelta el 3

#### Scenario: Partidas completas de Cuarenta
- **WHEN** se juegan 100 partidas de Cuarenta entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Cuarenta
- **WHEN** una IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
