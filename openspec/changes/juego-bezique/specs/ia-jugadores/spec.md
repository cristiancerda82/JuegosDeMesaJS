## ADDED Requirements

### Requirement: IA del Bezique nivel básico
El Bezique MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Declarar:** si gana una baza, hace la declaración que más puntos da (cantar o cambiar el 7); si no puede, no declara.
- **Mientras hay mazo, al salir:** juega la carta más baja que no sea triunfo, ni As ni 10, ni forme parte de una combinación que aún pueda cantar; si no hay, la más baja.
- **Mientras hay mazo, al responder:** si la carta de salida es un As o un 10, la gana con la carta más baja que pueda (sin gastar un As ni un 10 si no hace falta); si no, juega su carta más baja que no sea triunfo ni de una combinación posible.
- **En las 8 últimas bazas:** gana con la carta más baja que pueda; si no puede ganar, juega la más baja permitida.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Canta lo que más vale
- **WHEN** la IA gana una baza y puede cantar un matrimonio de 20 o cuatro K
- **THEN** canta los cuatro K

#### Scenario: Gana un As
- **WHEN** el rival sale con el As de tréboles, que no es triunfo, y la IA tiene el 7 de triunfo y el As de corazones de triunfo
- **THEN** juega el 7 de triunfo

#### Scenario: Partidas completas de Bezique
- **WHEN** se juegan 100 partidas de Bezique entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Bezique
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
