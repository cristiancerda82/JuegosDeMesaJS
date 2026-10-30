## ADDED Requirements

### Requirement: IA de la Sueca nivel básico
La Sueca MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al salir:** juega un As que no sea triunfo; si no tiene, la carta que menos vale de su palo más largo que no sea triunfo; si solo tiene triunfos, el más bajo.
- **Al responder:**
  - si la baza la va ganando su compañero, le carga la carta permitida que más puntos vale, sin gastar un triunfo;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar un triunfo si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Carga a su compañero
- **WHEN** el compañero de la IA va ganando la baza de picas y la IA tiene el As y el 2 de picas
- **THEN** juega el As de picas

#### Scenario: Gana con lo justo
- **WHEN** un rival sale con el As de corazones, el triunfo es picas, la IA no tiene corazones y tiene el 2 y el As de picas
- **THEN** juega el 2 de picas

#### Scenario: Partidas completas de Sueca
- **WHEN** se juegan 100 partidas de Sueca entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Sueca
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
