## ADDED Requirements

### Requirement: IA del Hand and Foot nivel básico
El Hand and Foot MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Robar:** coge el descarte siempre que puede; si no, roba del mazo.
- **Primera bajada:** si con su mano llega al mínimo de la ronda, baja lo necesario para llegar: primero las combinaciones de naturales y después las que necesitan comodín.
- **Bajar y añadir:** ya bajada la pareja, baja todos los valores de los que tenga tres naturales o más y añade los naturales que casan con las combinaciones sin terminar de la pareja.
- **Comodines:** los pone solo para terminar un libro, para empezar o seguir el libro de comodines cuando tiene tres o más, o para cerrar.
- **Cerrar:** si la pareja tiene los libros para cerrar y puede quedarse sin cartas, cierra.
- **Descartar:** primero un 3 negro; si no, la carta que menos le sirve: la de un valor del que su pareja no tiene combinación sin terminar, de las que tenga menos y de menos valor. Nunca descarta un comodín si tiene otra carta.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que les corresponderían si todos fueran iguales.

#### Scenario: Coge el descarte
- **WHEN** arriba del descarte hay un 9, la IA tiene dos nueves y su pareja ya ha bajado
- **THEN** coge el descarte

#### Scenario: Descarta el 3 negro
- **WHEN** la IA tiene que descartar y tiene un 3 negro
- **THEN** descarta el 3 negro

#### Scenario: Termina un libro con un comodín
- **WHEN** la pareja de la IA tiene una combinación de seis reyes y la IA tiene un 2
- **THEN** añade el 2 a los reyes

#### Scenario: Partidas completas de Hand and Foot
- **WHEN** se juegan 100 partidas de Hand and Foot entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Hand and Foot
- **WHEN** una pareja de IAs básicas juega 100 partidas contra una pareja que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
