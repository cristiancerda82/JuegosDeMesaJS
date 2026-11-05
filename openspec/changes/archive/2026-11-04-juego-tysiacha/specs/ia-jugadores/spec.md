## ADDED Requirements

### Requirement: IA del Tysiącha nivel básico
El Tysiącha MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar con estas reglas:
- **Valor de la mano:**
  - 11 por cada As;
  - 10 por cada 10 que tenga el As de su palo o al menos dos cartas más de su palo;
  - lo que valen los matrimonios que tiene;
  - 20 más, por lo que espera del prikup.
- **Subasta:** sube 5 si la nueva puja no pasa del valor de la mano (y puede pujar más de 120); si no, pasa.
- **Dar cartas:** da a cada rival una de sus cartas más bajas que no sea de un matrimonio ni un As, empezando por los 9.
- **Contrato:** fija el mayor entre su puja y el valor de la mano sin el bono del prikup, redondeado a 5 hacia abajo y dentro del tope.
- **Salir:**
  - si puede cantar, sale con la Q del matrimonio que más vale;
  - si no, con un As;
  - si no, con un 10 cuyo As ya ha salido;
  - si no, con la carta más baja de su palo más largo que no sea de un matrimonio.
- **Responder:** con la carta legal más baja que gane la baza. Si no puede ganarla, con la más baja que no sea de un matrimonio.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con buena mano
- **WHEN** la IA tiene el matrimonio de corazones y dos Ases, y la puja está en 100
- **THEN** sube a 105

#### Scenario: Pasa con mala mano
- **WHEN** la IA no tiene Ases ni matrimonios y la puja está en 100
- **THEN** pasa

#### Scenario: Canta en cuanto puede
- **WHEN** la IA sale, ya ganó una baza y tiene el K y la Q de diamantes
- **THEN** sale con la Q de diamantes y canta 80

#### Scenario: Da las cartas flojas
- **WHEN** la IA es declarante con dos 9 que no son de ningún matrimonio
- **THEN** da un 9 a cada rival

#### Scenario: Partidas completas de Tysiącha
- **WHEN** se juegan 100 partidas de Tysiącha entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tysiącha
- **WHEN** una IA básica juega 200 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la tercera parte
