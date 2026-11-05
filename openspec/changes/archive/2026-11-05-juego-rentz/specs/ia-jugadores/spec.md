## ADDED Requirements

### Requirement: IA del Rentz nivel básico
El Rentz MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Al elegir el contrato:** estima lo que anotaría con su mano en cada contrato que le queda y elige el de más valor:

  | Contrato | Estimación |
  |---|---|
  | Sin bazas | −5 por cada carta de la J al As |
  | Sin corazones | −5 por cada corazón de la J al As |
  | Sin damas | −10 por cada dama con menos de 3 cartas más de su palo |
  | Sin el K de corazones | −40 si tiene el K de corazones con menos de 3 corazones más; si no, 0 |
  | Sin la última baza | −10 por cada As |
  | Bazas | 5 × (sus Ases y K − 2) |
  | Dominó | 5 × (sus J y las cartas que encajan seguidas a ellas − 1) |

- **En los contratos de evitar:**
  - al salir, juega la carta más baja de su palo más corto;
  - al seguir el palo, la más alta que no gana la baza o, si todas ganan, la más alta;
  - sin el palo, se descarta de la carta que resta en el contrato y, si no tiene, de la más alta.
- **En el contrato de bazas:**
  - al salir, con un As si tiene; si no, con la más baja;
  - al responder, con la más baja que gana la baza o, si no puede ganar, con la más baja.
- **En el dominó:** pone la carta que le deja más cartas suyas por poner en esa fila; a igualdad, la más alejada de la J.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Elige bazas con cartas altas
- **WHEN** la IA elige con los cuatro Ases, dos K y dos cartas bajas, y le quedan todos los contratos
- **THEN** elige el contrato de bazas

#### Scenario: Sale bajo en un contrato de evitar
- **WHEN** en sin bazas la IA sale con un 7 de picas solo y varios corazones
- **THEN** sale con el 7 de picas

#### Scenario: Se descarta de una dama
- **WHEN** en sin damas la IA no tiene el palo de salida y tiene una dama
- **THEN** echa la dama

#### Scenario: Partidas completas de Rentz
- **WHEN** se juegan 100 partidas de Rentz entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Rentz
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte
