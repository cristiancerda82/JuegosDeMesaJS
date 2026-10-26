## ADDED Requirements

### Requirement: IA del Durak nivel básico
El Durak MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Atacar:** con su carta más baja que no sea triunfo y, si puede, con la de un número del que tenga varias.
- **Echar:** cartas bajas que no sean triunfo; triunfos o cartas altas solo cuando el mazo se ha acabado.
- **Defender:** con la carta más barata que gana, prefiriendo las que no son triunfo.
- **Llevarse las cartas:** cuando para ganar tendría que gastar un triunfo alto (Q, K o A) quedando mucho mazo, o cuando no puede ganar.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Ataca con la más baja
- **WHEN** la IA ataca con el 6 de corazones, el 10 de tréboles y el 7 de triunfo en la mano
- **THEN** ataca con el 6 de corazones

#### Scenario: Defiende con lo justo
- **WHEN** la IA defiende un 8 de diamantes con el 9 y el K de diamantes y un triunfo en la mano
- **THEN** lo gana con el 9 de diamantes

#### Scenario: Partidas completas de Durak
- **WHEN** se juegan 100 partidas de Durak entre IAs con semillas distintas, de 2 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Durak
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
