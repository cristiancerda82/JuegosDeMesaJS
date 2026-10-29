## ADDED Requirements

### Requirement: IA de la Pesca nivel básico
La Pesca MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST recordar el registro público para saber qué valores tiene seguro cada rival (los que pidió o recibió y aún no ha dado ni bajado) y cuáles no tiene (los que le pidieron y no tenía, hasta que vuelva a robar del mar). Con eso MUST pedir así:
- **Lo que sabe:** si un rival tiene seguro un valor que la IA tiene en la mano, se lo pide (el valor del que la IA tenga más cartas y, a igualdad, el más alto).
- **Si no:** pide el valor del que tiene más cartas (a igualdad, el más alto) que algún rival pueda tener, al rival con más cartas de los que no se sabe que no lo tienen; si ningún valor sirve, el primero al rival con más cartas.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Pide lo que sabe
- **WHEN** el jugador 1 pidió reyes hace un momento, no los ha dado ni bajado, y la IA tiene un rey
- **THEN** la IA le pide reyes al jugador 1

#### Scenario: Valor del que tiene más
- **WHEN** la IA no sabe nada de los rivales y tiene dos cincos y un 9
- **THEN** pide cincos al rival con más cartas

#### Scenario: Partidas completas de Pesca
- **WHEN** se juegan 100 partidas de Pesca entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Pesca
- **WHEN** la IA básica juega 200 partidas a cuatro contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte (a dos, la Pesca depende casi solo de la suerte)
