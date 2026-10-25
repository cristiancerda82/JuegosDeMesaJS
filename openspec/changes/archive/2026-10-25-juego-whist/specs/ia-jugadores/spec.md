## ADDED Requirements

### Requirement: IA del Whist nivel básico
El Whist MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Salir:** con el As de un palo que no es el triunfo, lo juega; si no, sale de su palo más largo que no sea el triunfo, con la carta más alta si tiene la siguiente (rey con reina, por ejemplo) y si no con la más baja.
- **Seguir el palo:** si su compañero ya gana la baza, juega la carta más baja; si no, la carta más baja que gana la baza, o la más baja si no puede ganarla.
- **Sin el palo:** si su compañero ya gana la baza, descarta su carta más baja que no sea triunfo; si no, falla con el triunfo más bajo que gana la baza, o descarta la más baja si no puede.

Este nivel MUST ganar claramente más partidas que una pareja que elige cartas legales al azar.

#### Scenario: Gana con la carta justa
- **WHEN** salen corazones con el 9, y la IA tiene el 10, la J y la K de corazones
- **THEN** juega el 10

#### Scenario: No le quita la baza al compañero
- **WHEN** el compañero de la IA va ganando la baza con el As de picas, y la IA tiene picas
- **THEN** juega su pica más baja

#### Scenario: Falla con el triunfo más bajo
- **WHEN** la IA no tiene el palo de salida, el rival va ganando y la IA tiene el 3 y la Q de triunfo
- **THEN** juega el 3 de triunfo

#### Scenario: Partidas completas de Whist
- **WHEN** se juegan 100 partidas de Whist entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Whist
- **WHEN** una pareja de IAs básicas juega 100 partidas contra una pareja que elige cartas legales al azar
- **THEN** gana claramente más de la mitad
