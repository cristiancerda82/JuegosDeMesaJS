## ADDED Requirements

### Requirement: IA del Klaverjas nivel básico
El Klaverjas MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al decidir el triunfo:** valora cada palo con su mano. Por cada carta de ese palo cuenta J 6, 9 5, A 4, 10 3, K 2, Q 2 y las demás 1, y suma 2 por cada As de los otros palos.
  - **Palo propuesto:** juega con él si vale 16 o más; si no, pasa.
  - **Si pasan todos:** elige el palo que más vale.
- **Al salir:** juega la carta más alta que queda de un palo, si tiene alguna, prefiriendo los palos que no son triunfo; si no, la carta que menos vale de su palo más largo que no sea triunfo; si solo tiene triunfos, el más bajo.
- **Al responder:**
  - si la baza la va ganando su compañero, le carga la carta permitida que más puntos vale;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega con un triunfo fuerte
- **WHEN** el palo propuesto es corazones y la IA tiene la Jota, el 9, el As y el 10 de corazones
- **THEN** juega con corazones

#### Scenario: Pasa con un triunfo flojo
- **WHEN** el palo propuesto es corazones y la IA solo tiene el 7 de corazones y ningún As
- **THEN** pasa

#### Scenario: Carga a su compañero
- **WHEN** el triunfo es tréboles, el compañero de la IA va ganando la baza de picas con el As y la IA tiene el 10 y el 7 de picas
- **THEN** juega el 10 de picas

#### Scenario: Partidas completas de Klaverjas
- **WHEN** se juegan 100 partidas de Klaverjas entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Klaverjas
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
