## ADDED Requirements

### Requirement: IA del Five Hundred nivel básico
El Five Hundred MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Al pujar:** estima las bazas que gana su pareja con cada palo de triunfo y sin triunfo:
  - **Con triunfo:** 1 por el comodín, por cada Jota del triunfo o de su color y por el As del triunfo; 0,5 por cada otro triunfo; 1 por cada As de otro palo; y 1,5 por su compañero.
  - **Sin triunfo:** 1 por el comodín y por cada As, 0,5 por cada Rey, y 1,5 por su compañero.
  - **Puja:** la más baja que supere la puja más alta y no pase de las bazas estimadas (redondeadas hacia abajo), en el contrato de más bazas estimadas. Si no puede, pasa.
  - **Misère:** si no tiene el comodín ni más de una carta de la Jota al As, y nadie ha pujado más de 8 picas, puja misère.
- **Al descartarse:** se descarta de las 3 cartas que no son triunfo de menos rango, empezando por sus palos más cortos.
- **En las bazas:**
  - al salir, juega la carta más alta que queda de un palo si es suya, y si no, la más baja de su palo más largo que no sea triunfo;
  - si la baza la va ganando su compañero, juega la carta más baja;
  - si no, la gana con la carta más baja que pueda o, si no puede, juega la más baja.
- **En el misère:** quien juega echa la carta más alta que no gana la baza; si todas ganan, la más baja. Los rivales juegan la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con un triunfo fuerte
- **WHEN** la puja más alta es 6 sin triunfo y la IA tiene el comodín, las dos Jotas rojas, el As y el Rey de corazones y dos Ases más
- **THEN** puja 7 corazones

#### Scenario: Pasa con mano floja
- **WHEN** la puja más alta es 9 sin triunfo y la IA tiene una mano sin comodín, sin Jotas y sin Ases
- **THEN** pasa

#### Scenario: Juega con lo justo
- **WHEN** el triunfo es picas, un rival sale con el Rey de corazones y la IA tiene el As y el 5 de corazones
- **THEN** juega el As de corazones

#### Scenario: Partidas completas de Five Hundred
- **WHEN** se juegan 100 partidas de Five Hundred entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Five Hundred
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
