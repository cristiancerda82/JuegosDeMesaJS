## ADDED Requirements

### Requirement: IA del Schafkopf nivel básico
El Schafkopf MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST anunciar así, eligiendo el contrato más alto que cumpla y que esté permitido:
- **Solo:** si con algún palo de triunfo tiene 6 triunfos o más y al menos 3 son damas o jotas; elige el palo con el que más triunfos tiene.
- **Wenz:** si tiene 3 jotas o más y 2 Ases o más.
- **Rufspiel:** si tiene 4 triunfos o más (con los corazones) y al menos 2 son damas o jotas, y puede llamar a algún As; llama al del palo del que menos cartas tiene.
- Si no, pasa.

Y jugar así:
- **Al salir:** si juega solo o es del lado del que juega, sale con su triunfo más alto si tiene una dama o una jota que sea triunfo; si no, con un As que no sea triunfo; si no, con la carta que menos vale.
- **Al responder:**
  - si la baza la va ganando un compañero conocido, le carga la carta permitida que más puntos vale, sin gastar un triunfo si puede;
  - si no, y la baza vale 10 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar un triunfo si puede.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Anuncia un Solo
- **WHEN** la IA tiene las damas de tréboles y picas, la jota de tréboles y el As, el 10 y el 9 de tréboles: 6 triunfos si el triunfo es tréboles
- **THEN** anuncia un Solo de tréboles

#### Scenario: Pasa con mano floja
- **WHEN** la IA no tiene damas ni jotas y tiene un solo corazón
- **THEN** pasa

#### Scenario: Gana con lo justo
- **WHEN** en un Rufspiel la IA es la última en jugar en una baza de picas en la que un rival gana con el As y hay también un 10, no tiene picas y solo tiene la jota de diamantes y la dama de tréboles
- **THEN** echa la jota de diamantes

#### Scenario: Partidas completas de Schafkopf
- **WHEN** se juegan 100 partidas de Schafkopf entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Schafkopf
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de una de cada cuatro
