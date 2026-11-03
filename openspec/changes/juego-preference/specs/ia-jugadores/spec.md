## ADDED Requirements

### Requirement: IA del Préférence nivel básico
El Préférence MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Bazas que espera:** cuenta 1 por cada As; 1 por cada rey con el As de su palo o con otra carta, y medio si va solo; medio por cada dama con el As o el rey de su palo o con dos cartas más; y, en el palo de triunfo, 1 por cada carta pasada de la segunda.
- **Subasta:** a las bazas que espera suma 1 por lo que mejorará con la viuda y el descarte. Puja en el palo (o sin triunfo) con el que más bazas espera, si llegan a 6: la puja más baja permitida en ese palo, si no pasa de ese número de bazas. Puja miseria, si puede, cuando no tiene ninguna carta más alta que el 9. Si no, pasa.
- **Descarte:** descarta las 2 cartas que menos valen fuera del palo de triunfo, de sus palos más cortos (en la miseria, las 2 más altas).
- **Contrato:** declara lo que pujó.
- **Whist:** hace whist si, con el triunfo del contrato, espera ganar al menos la mitad (redondeando hacia arriba) de las bazas que les tocan a los que hacen whist: 2 en un 6 y 1 en un 7, un 8 o un 9; en un 10 hace whist siempre.
- **Al jugar:**
  - si quiere ganar, sale con su carta más alta de su palo más largo y responde ganando la baza con la carta más baja que pueda;
  - en la miseria del que juega y en la raspasy, echa la carta más alta que no gane la baza, o la más baja si todas ganan.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Puja con mano fuerte
- **WHEN** a la IA le toca pujar sin pujas antes y tiene As, rey, dama, jota, 10 y 9 de corazones y los Ases de picas y tréboles
- **THEN** puja 6 de corazones

#### Scenario: Pasa con mano floja
- **WHEN** a la IA le toca pujar con una mano sin Ases ni reyes y con alguna carta más alta que el 9
- **THEN** pasa

#### Scenario: No gana en la raspasy
- **WHEN** en la raspasy salen picas con el 10 y la IA tiene el 9 y la dama de picas
- **THEN** echa el 9 de picas

#### Scenario: Partidas completas de Préférence
- **WHEN** se juegan 100 partidas de Préférence entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Préférence
- **WHEN** una IA básica juega 200 partidas contra dos jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de una de cada tres
