## ADDED Requirements

### Requirement: IA del Schnapsen nivel básico
El Schnapsen MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Cambiar la J:** siempre que puede.
- **Cantar:** en cuanto puede, el cante de más puntos.
- **Cerrar el mazo:** cuando sus puntos, sus cantes y los Ases y dieces del triunfo que tiene suman al menos 66.
- **Con el mazo abierto:** sale con la carta que menos vale y no es triunfo ni de una pareja que pueda cantar. Al responder, gana con una carta del mismo palo si puede, o con un triunfo si la carta de salida vale 10 o más; si no, echa la que menos vale.
- **Con las reglas estrictas:** gana la baza con la carta más barata que la gane si puede, y sale con su carta más alta.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Cambia la J del triunfo
- **WHEN** la IA sale, el mazo está abierto y tiene la J del triunfo
- **THEN** la cambia por la carta vuelta

#### Scenario: Canta en cuanto puede
- **WHEN** la IA sale y tiene el K y la Q de un palo sin cantar
- **THEN** los canta

#### Scenario: Partidas completas de Schnapsen
- **WHEN** se juegan 100 partidas de Schnapsen entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Schnapsen
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
