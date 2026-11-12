## ADDED Requirements

### Requirement: IA de la Briscola Chiamata nivel básico
La Briscola Chiamata MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Subasta:**
  - su fuerza es la suma de los puntos de sus cartas más 4 por cada carta de su palo más largo;
  - con 35 de fuerza se atreve con el As, y con cada 6 más, con una carta más baja (hasta el 2); nunca puja por puntos;
  - puja la siguiente carta si no pasa de la más baja con la que se atreve y, si no, pasa (cuando el que reparte está obligado, puja el As).
- **Llamada:** su palo más largo (si empatan, el de más puntos) entre los palos en los que no tiene la carta de su puja; si la tiene en los cuatro, llama la de su palo más largo y juega solo.
- **Su bando:** el llamador sabe que su compañero es quien tiene la carta llamada; el compañero sabe que va con el llamador; los defensores, hasta que se descubre el compañero, solo cuentan como rival al llamador.
- **Salir:** con la carta que menos puntos vale que no sea triunfo (si solo tiene triunfos, con el más bajo).
- **Responder:**
  - si la baza la va ganando alguien de su bando, echa la carta con más puntos que no sea triunfo (si no tiene, la de menos puntos);
  - si no, y la baza tiene al menos 10 puntos, la carta más baja que la gana;
  - si no, la que menos puntos vale, sin echar triunfo si puede evitarlo.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con una buena mano
- **WHEN** la IA tiene el As, el 3, el Rey y el Caballo de oros, el 7 y el 6 de copas y el 5 y el 4 de espadas, y nadie ha pujado
- **THEN** puja el As

#### Scenario: Pasa con una mano floja
- **WHEN** la IA solo tiene cartas sin puntos repartidas en los cuatro palos y ya se ha pujado el As
- **THEN** pasa

#### Scenario: Llama en su palo más largo
- **WHEN** la IA gana la subasta con el Rey, tiene cuatro oros sin el Rey de oros y dos cartas de cada otro palo
- **THEN** llama el Rey de oros

#### Scenario: Carga puntos en la baza de su bando
- **WHEN** el llamador va ganando la baza, la IA es su compañero y tiene el 3 de copas y el 4 de espadas, sin ser triunfos
- **THEN** echa el 3 de copas

#### Scenario: Partidas completas de Briscola Chiamata
- **WHEN** se juegan 100 partidas de Briscola Chiamata entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Briscola Chiamata
- **WHEN** dos IAs básicas juegan 200 partidas con otros tres jugadores que eligen acciones legales al azar
- **THEN** las IAs ganan claramente más partidas de las que les corresponderían
