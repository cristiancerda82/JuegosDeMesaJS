## ADDED Requirements

### Requirement: IA del Belote nivel básico
El Belote MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Elegir el triunfo:** valora su mano en cada palo posible (la J, el 9, el As, los demás triunfos y los Ases de otros palos). Toma o nombra el palo que mejor valora si pasa de un umbral. En la primera vuelta cuenta la carta vuelta como suya, porque se la lleva quien toma.
- **Bazas:** como el resto de juegos de bazas, gana la baza con la carta más barata que la gane si no es ya de su compañero, y si no, se descarta de la que menos vale, dentro de lo que le obligan las reglas.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Toma con la J y el 9
- **WHEN** la carta vuelta es de corazones y la IA tiene la J y el 9 de corazones y otro corazón
- **THEN** toma el triunfo

#### Scenario: Pasa con una mano floja
- **WHEN** la IA no tiene ningún triunfo del palo de la carta vuelta salvo ella, ni Ases
- **THEN** pasa

#### Scenario: Partidas completas de Belote
- **WHEN** se juegan 100 partidas de Belote entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Belote
- **WHEN** una pareja de IAs básicas juega 200 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
