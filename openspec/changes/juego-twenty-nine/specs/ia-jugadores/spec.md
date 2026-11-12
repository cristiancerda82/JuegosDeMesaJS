## ADDED Requirements

### Requirement: IA del Twenty-Nine nivel básico
El Twenty-Nine MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Subasta:** con sus 4 primeras cartas, su puja máxima es 13 más sus puntos más las cartas de su palo más largo menos una (como mucho 28); puja 16 o una más que la última si no pasa de su máximo y, si no, pasa.
- **Triunfo:** su palo más largo (si empatan, el de más puntos); sin triunfo si no repite palo y tiene al menos 6 puntos.
- **Doblar:** dobla si sus 4 primeras cartas suman al menos 7 puntos; redobla si suman al menos 8.
- **La pareja:** la canta siempre que puede.
- **Pedir el triunfo:** lo pide si no puede seguir el palo, la baza tiene puntos y la va ganando el otro lado.
- **Salir:** con una J si tiene; si no, con su carta más baja.
- **Responder:**
  - si la baza la gana su compañero, echa la carta legal con más puntos;
  - si no, la carta legal más baja que gana la baza, o la de menos puntos si no puede ganarla.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con una buena mano
- **WHEN** las 4 primeras cartas de la IA son la J, el 9 y el As de corazones y el 7 de picas, y nadie ha pujado
- **THEN** puja 16

#### Scenario: Elige su palo más largo
- **WHEN** la IA gana la subasta con tres corazones y una pica
- **THEN** elige corazones como triunfo

#### Scenario: Carga puntos en la baza del compañero
- **WHEN** el compañero de la IA va ganando la baza y la IA tiene el 9 y el 8 del palo de salida
- **THEN** echa el 9

#### Scenario: Partidas completas de Twenty-Nine
- **WHEN** se juegan 100 partidas de Twenty-Nine entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Twenty-Nine
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
