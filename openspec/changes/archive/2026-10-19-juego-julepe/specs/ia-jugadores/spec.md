## ADDED Requirements

### Requirement: IA del Julepe nivel básico
El Julepe MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Jugar o pasar:** estima las bazas que hará con sus triunfos y sus cartas altas antes de descartar, y juega si espera al menos 1, porque el descarte cambia sus cartas malas y le acerca a 2. Con más jugadores en la mesa pide más.
- **Descartar:** se queda con los triunfos, los Ases y los Treses, y descarta el resto mientras haya mazo.
- **Al jugar:**
  - gana la baza con la carta más barata que la gane;
  - si no puede, juega la que menos vale;
  - con dos bazas ya hechas sigue intentando ganar, porque cada baza cobra.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pasa sin juego
- **WHEN** la IA tiene cinco cartas bajas sin triunfos y no está obligada
- **THEN** pasa

#### Scenario: Juega con triunfos altos
- **WHEN** la IA tiene el As y el 3 de triunfo y un As de otro palo
- **THEN** juega la mano

#### Scenario: Partidas completas de Julepe
- **WHEN** se juegan 500 partidas de Julepe entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Julepe
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
