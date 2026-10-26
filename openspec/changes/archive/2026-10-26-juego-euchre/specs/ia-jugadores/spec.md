## ADDED Requirements

### Requirement: IA del Euchre nivel básico
El Euchre MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Elegir el triunfo:** valora su mano en cada palo posible (bower derecho, bower izquierdo, As, demás triunfos y Ases de otros palos). Pide o nombra el palo que mejor valora si pasa de un umbral. En la primera vuelta cuenta también la carta vuelta: a su favor si reparte él o su compañero, y en contra si reparte un rival.
- **Jugar solo:** solo con una mano muy fuerte, como los dos bowers y otro triunfo alto.
- **Descartarse (como repartidor):** de su carta más baja que no sea triunfo, prefiriendo quedarse sin un palo.
- **Bazas:** como el resto de juegos de bazas, gana la baza con la carta más barata que la gane si no es ya de su compañero, y si no, se descarta de la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Pide con los dos bowers
- **WHEN** la carta vuelta es de corazones y la IA tiene las J de corazones y de diamantes y el As de corazones
- **THEN** pide el triunfo

#### Scenario: Pasa con una mano floja
- **WHEN** la IA no tiene ningún triunfo del palo de la carta vuelta ni Ases
- **THEN** pasa

#### Scenario: Partidas completas de Euchre
- **WHEN** se juegan 100 partidas de Euchre entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Euchre
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
