## ADDED Requirements

### Requirement: IA del Barbu nivel básico
El Barbu MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al elegir el contrato:** estima lo que anotaría con su mano en cada contrato que queda y elige el de más valor:
  - **Sin bazas:** −2 por cada carta de la Jota al As.
  - **Sin corazones:** −2 por cada corazón de la Jota al As, y −6 más con el As de corazones.
  - **Sin damas:** −6 por cada dama con menos de 3 cartas más de su palo.
  - **Sin el Rey de corazones:** −20 si tiene el Rey de corazones con menos de 3 corazones más; si no, 0.
  - **Sin las dos últimas:** −3 por cada As y Rey.
  - **Triunfo:** 5 × (largo de su palo más largo + sus Ases − 4), con ese palo de triunfo.
  - **Dominó:** 5 × (sus Jotas + las cartas que encajan seguidas a ellas) − 10.
- **En los contratos de evitar:**
  - al salir, juega la carta más baja de su palo más corto entre las que puede;
  - al seguir el palo, la más alta que no gana la baza o, si todas ganan, la más alta;
  - sin el palo, se descarta de la carta que penaliza en el contrato y, si no tiene, de la más alta.
- **En el triunfo:** sale con sus Ases y, si no, con la más baja; si puede ganar la baza, la gana con lo justo; si no, juega la más baja.
- **En el dominó:** juega la carta que encaja que le deja más cartas suyas por jugar en esa fila; a igualdad, la más alejada de la Jota.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Elige el triunfo con un palo largo
- **WHEN** quedan todos los contratos y la IA tiene siete picas con el As y otros dos Ases
- **THEN** elige el triunfo de picas

#### Scenario: Se descarta del Rey de corazones
- **WHEN** el contrato es sin el Rey de corazones y salen picas, que la IA no tiene
- **THEN** juega el Rey de corazones si lo tiene

#### Scenario: No gana la baza
- **WHEN** el contrato es sin bazas, la baza de diamantes la va ganando el 10 y la IA tiene el 9 y la Dama de diamantes
- **THEN** juega el 9 de diamantes

#### Scenario: Partidas completas de Barbu
- **WHEN** se juegan 100 partidas de Barbu entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Barbu
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte
