## ADDED Requirements

### Requirement: IA del Tute subastado nivel básico
El Tute subastado MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Pujar:** estima, para cada palo como triunfo, los puntos que haría con sus cartas: los Ases y Treses, los triunfos según cuántos y cuáles tenga, y los cantes que lleva. Con la mejor estimación puja lo mínimo posible si no pasa de ella; si no, pasa.
- **Elegir triunfo:** elige el palo con la mejor estimación.
- **Cantar:** canta siempre que puede, el tute antes que nada y las 40 antes que las 20.
- **Al jugar:**
  - como defensor, ayuda a los otros defensores: si uno va ganando la baza contra el pujador, le carga puntos cuando puede;
  - gana la baza con la carta más barata que la gane cuando lleva puntos;
  - si no puede ganarla, juega la que menos vale.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pasa con mano floja
- **WHEN** la IA tiene solo cartas bajas, sin Ases, Treses ni cantes
- **THEN** pasa en la subasta

#### Scenario: Puja con buena mano
- **WHEN** la IA tiene As, 3, Rey y Caballo de un palo y otros dos Ases, y nadie ha pujado
- **THEN** puja 60 o más

#### Scenario: Elige el palo de su fuerza
- **WHEN** la IA gana la subasta con cinco espadas, entre ellas el As y el 3
- **THEN** elige espadas como triunfo

#### Scenario: Partidas completas de Tute subastado
- **WHEN** se juegan 500 partidas de Tute subastado entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Tute subastado
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
