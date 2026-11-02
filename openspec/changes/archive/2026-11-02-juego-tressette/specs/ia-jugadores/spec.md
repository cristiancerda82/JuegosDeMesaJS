## ADDED Requirements

### Requirement: IA del Tressette nivel básico
El Tressette MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Una carta es «la más alta que queda» de su palo si ninguna carta más alta de ese palo sigue sin jugar fuera de la mano de la IA. Este nivel MUST jugar así:
- **Al salir:** juega la carta más alta que queda de algún palo, la que más puntos vale si hay varias; si no tiene ninguna, la carta más baja de su palo más largo.
- **Al responder:**
  - si la baza la va ganando su compañero y es segura (la IA es la última en jugar, o la carta del compañero es la más alta que queda de su palo), le carga la carta permitida que más puntos vale;
  - si no, y la baza vale algún punto o es la última en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale y, entre las que valen lo mismo, la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Sale con la más alta que queda
- **WHEN** la IA sale, tiene el 3 de oros, el As de oros y el 5 de copas, y no se ha jugado ninguna carta
- **THEN** juega el 3 de oros

#### Scenario: Carga a su compañero
- **WHEN** el compañero de la IA va ganando la baza de copas con el 3 de copas y la IA tiene el As y el 4 de copas
- **THEN** juega el As de copas

#### Scenario: Gana con lo justo
- **WHEN** la IA es la última en jugar en una baza de oros que gana un rival con el rey, y tiene el 2 y el 3 de oros
- **THEN** juega el 2 de oros

#### Scenario: Partidas completas de Tressette
- **WHEN** se juegan 100 partidas de Tressette entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tressette
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
