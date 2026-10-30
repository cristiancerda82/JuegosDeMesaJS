## ADDED Requirements

### Requirement: IA del Tarot nivel básico
El Tarot MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Subasta:** valora su mano (cada *oudler*, cada triunfo, cada Rey y cada Dama suman) y pide el contrato más alto cuyo umbral alcanza, si es más alto que el último pedido; si no, pasa. Los umbrales se ajustan al número de jugadores.
- **Llamada al Rey (con 5):** llama al Rey del palo del que tiene más cartas.
- **Descarte:** descarta las cartas permitidas de sus palos más cortos, primero las que más valen.
- **Poignée:** la enseña si es el preneur y puede; si no, no la enseña.
- **Al salir:** juega un Rey de un palo que aún no haya salido; si no tiene, la carta más baja de su palo más largo.
- **Al responder:**
  - si la baza la va ganando alguien que sabe de su bando, le carga la carta permitida que más vale, sin gastar el Petit ni el 21;
  - si no, y la baza vale 2 puntos o más o es el último en jugar, la gana con la carta más baja que pueda;
  - si no, juega la carta permitida que menos vale, sin gastar el Petit si tiene otro triunfo.
- **Excusa:** la juega cuando la carta que tendría que jugar vale 2,5 o más y no gana la baza, o cuando le quedan 2 cartas o menos.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Gana con lo justo
- **WHEN** salen picas con la Dama de picas, el que va ganando es un rival y la IA tiene el Rey de picas y el 3 de picas
- **THEN** juega el Rey de picas

#### Scenario: Carga a su bando
- **WHEN** la IA es defensora, otro defensor va ganando la baza y la IA no tiene el palo ni triunfos, pero tiene el Rey de tréboles y el 2 de tréboles
- **THEN** juega el Rey de tréboles

#### Scenario: Partidas completas de Tarot
- **WHEN** se juegan 100 partidas de Tarot entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tarot
- **WHEN** la IA básica juega 200 partidas de 4 contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte
