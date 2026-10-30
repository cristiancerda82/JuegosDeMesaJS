## ADDED Requirements

### Requirement: IA del Doppelkopf nivel básico
El Doppelkopf MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Reservas:**
  - pide solo de Damas con 5 Damas o más, solo de Jotas con 5 Jotas o más, y solo de triunfo con 10 triunfos o más que incluyan los dos 10 de corazones;
  - si no, pide boda si tiene las dos Q de tréboles, y dice «sano» en otro caso.
- **Anuncios:** anuncia «Re» o «Contra» en su primer turno si tiene 7 triunfos o más, de los que al menos 3 son el 10 de corazones o una Dama. No anuncia bajadas.
- **Al salir:** juega un As de un palo normal que aún no se haya jugado en la mano; si no tiene, su triunfo más bajo; si no tiene triunfos, su carta más baja.
- **Al responder:**
  - si la baza va ganándola alguien que sabe de su bando, le carga la carta que más vale de las que puede jugar sin gastar un triunfo de Dama o más alto;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Carga a su pareja
- **WHEN** la IA sabe que su pareja va ganando la baza con el 10 de corazones, no tiene triunfos y tiene el As de picas y el 9 de picas
- **THEN** juega el As de picas

#### Scenario: Gana con lo justo
- **WHEN** la baza vale 21 puntos, la va ganando un rival con la J de diamantes y la IA tiene la J de corazones y la Q de tréboles
- **THEN** juega la J de corazones

#### Scenario: Partidas completas de Doppelkopf
- **WHEN** se juegan 100 partidas de Doppelkopf entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Doppelkopf
- **WHEN** la IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte
