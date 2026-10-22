## ADDED Requirements

### Requirement: IA de Picas nivel básico
Picas MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Apostar:** cuenta las bazas que espera hacer: cada As, cada Rey con otra carta de su palo, cada Dama con dos más de su palo, las picas altas y una por cada pica a partir de la cuarta. Apuesta ese número, como mínimo 1. Si espera menos de media baza y no tiene ninguna pica más alta que el 9, dice Nil, salvo que su compañero ya haya dicho Nil.
- **Jugar con contrato:** mientras su pareja no haya cumplido el contrato, intenta ganar las bazas con la carta más baja que gane; si no puede, o si la baza ya es de su compañero, echa la más baja. Cuando la pareja ya lo ha cumplido, evita ganar bazas para no sumar sacos.
- **Nil propio:** si dijo Nil, juega la carta más alta que no gane la baza, y si tiene que ganarla, la más baja.
- **Nil del compañero:** si su compañero dijo Nil, intenta ganar las bazas que el compañero podría llevarse.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Apuesta con ases
- **WHEN** la IA tiene el As de corazones, el As de tréboles, el Rey y el 3 de diamantes, y ninguna pica alta ni más de tres picas
- **THEN** apuesta 3

#### Scenario: Nil con mano baja
- **WHEN** la IA tiene solo cartas del 2 al 8, con dos picas, y su compañero no ha dicho Nil
- **THEN** dice Nil

#### Scenario: Ganar barato
- **WHEN** la pareja no ha cumplido el contrato, en la mesa hay el 10 de corazones y la IA tiene el Rey y la Dama de corazones
- **THEN** juega la Dama

#### Scenario: Nil propio
- **WHEN** la IA dijo Nil, en la mesa hay la Dama de tréboles y tiene el Rey, el 9 y el 4 de tréboles
- **THEN** juega el 9

#### Scenario: Partidas completas de Picas
- **WHEN** se juegan 300 partidas de Picas entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en Picas
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
