## ADDED Requirements

### Requirement: IA del Pishti nivel básico
El Pishti MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST puntuar cada carta que puede echar y elegir la de más valor. Cuentan como puntos de carta: 1 por cada As y cada J, 2 por el 2 de tréboles y 3 por el 10 de diamantes.
- **Al llevarse el montón:**
  - un pishti vale 1000 (2000 si es de J);
  - cada carta que se lleva (la jugada incluida) vale 5, y cada punto de carta, 30;
  - llevárselo con una J sin hacer pishti resta 60, para guardar la J si el montón vale poco.
- **Al echar una carta sin llevarse nada:**
  - resta 30 por cada punto de su carta;
  - si el montón estaba vacío y quedan cartas de su número que no ha visto, resta 300 (600 si es una J), porque el siguiente podría hacer pishti;
  - si no, resta la mitad de lo que vale el montón que queda, porque el siguiente podría llevárselo.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Prefiere el pishti
- **WHEN** el montón tiene solo un 8 y la IA tiene un 8 y una J
- **THEN** echa el 8

#### Scenario: Guarda la J
- **WHEN** el montón tiene un 4 y un 9 a la vista, sin tapadas, y la IA tiene una J y un 6
- **THEN** echa el 6

#### Scenario: Partidas completas de Pishti
- **WHEN** se juegan 100 partidas de Pishti entre IAs con semillas distintas, con 2 y con 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Pishti
- **WHEN** una IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
