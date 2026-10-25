## ADDED Requirements

### Requirement: IA de la Canasta nivel básico
La Canasta MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Robar:** se lleva el pozo siempre que puede; si no, roba del mazo.
- **Primera bajada:** si con su mano llega al mínimo, baja lo necesario para llegar: primero las combinaciones de naturales y después las que necesitan comodín.
- **Bajar y añadir:** ya bajada la pareja, baja todos los valores de los que tenga tres naturales o más y añade los naturales que casan con las combinaciones de la pareja. Pone comodines solo para completar una canasta, o para cerrar.
- **Cerrar:** si la pareja tiene canasta y puede quedarse sin cartas, cierra.
- **Descartar:** primero un 3 negro; si no, la carta que menos sirve a los rivales: la de un valor del que no tienen combinación, de las que tenga menos y de menos valor. Nunca descarta un comodín si tiene otra carta.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que les corresponderían si todos fueran iguales.

#### Scenario: Se lleva el pozo
- **WHEN** arriba del pozo hay un 9, la IA tiene dos nueves y su pareja ya ha bajado
- **THEN** se lleva el pozo

#### Scenario: Descarta el 3 negro
- **WHEN** la IA tiene que descartar y tiene un 3 negro
- **THEN** descarta el 3 negro

#### Scenario: Cierra cuando puede
- **WHEN** la pareja de la IA tiene una canasta y la IA tiene tres cuatros y un 9
- **THEN** baja los cuatros y cierra descartando el 9

#### Scenario: Partidas completas de Canasta
- **WHEN** se juegan 100 partidas de Canasta entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Canasta
- **WHEN** una pareja de IAs básicas juega 100 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
