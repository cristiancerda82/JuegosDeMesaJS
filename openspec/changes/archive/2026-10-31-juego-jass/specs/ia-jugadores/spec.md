## ADDED Requirements

### Requirement: IA del Jass nivel básico
El Jass MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al elegir el modo:** valora cada modo con su mano:
  - **Un palo de triunfo:** por cada carta de ese palo, J 6, 9 5, A 4, K 3, Q 3 y las demás 2, más 2 por cada As de los otros palos.
  - **Obenabe:** A 5, K 3 y Q 1.
  - **Undenufe:** 6 5, 7 3 y 8 1.

  Elige el modo de más valor si llega a 18 o si su compañero le ha pasado la elección; si no, pasa.
- **Al salir:** juega la carta más alta que queda de un palo, en el orden del modo, si tiene alguna, prefiriendo los palos que no son triunfo; si no, la carta que menos vale de su palo más largo que no sea triunfo; si solo tiene triunfos, el más bajo.
- **Al responder:**
  - si la baza la va ganando su compañero, le carga la carta permitida que más puntos vale, sin gastar un triunfo;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar un triunfo si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Elige el triunfo
- **WHEN** la IA tiene la elección con la Jota, el 9, el As y el Rey de corazones y el As de picas
- **THEN** elige corazones

#### Scenario: Pasa con mano floja
- **WHEN** la IA tiene la elección con una mano sin Jotas, nueves, Ases ni seises
- **THEN** pasa la elección a su compañero

#### Scenario: Elige si le pasan
- **WHEN** el compañero de la IA le ha pasado la elección
- **THEN** elige el modo de más valor, aunque no llegue a 18

#### Scenario: Carga a su compañero
- **WHEN** el modo es Obenabe, el compañero de la IA va ganando la baza de picas con el As y la IA tiene el 10 y el 6 de picas
- **THEN** juega el 10 de picas

#### Scenario: Partidas completas de Jass
- **WHEN** se juegan 100 partidas de Jass entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Jass
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
