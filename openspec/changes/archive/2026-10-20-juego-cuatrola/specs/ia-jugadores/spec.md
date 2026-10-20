## ADDED Requirements

### Requirement: IA de la Cuatrola nivel básico
La Cuatrola MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Pujar:** estima, para cada palo como triunfo, las bazas que haría con sus matadores, sus triunfos y sus reyes. Puja solo si espera 6 bazas o más, con rey si espera al menos 3,5 (el compañero pone el resto), y pasa si no.
- **Elegir triunfo y rey:** elige el palo con la mejor estimación y llama el rey del palo, que no sea el triunfo, en el que tiene menos cartas.
- **Al jugar:**
  - sabe quién es su compañero si es el jugador y el compañero ya se descubrió, o si él mismo tiene la carta llamada;
  - si la baza la va ganando su compañero, juega su carta más baja;
  - si no, la gana con la carta más baja que la gane, y si no puede, juega la más baja;
  - el jugador que tiene muchos triunfos sale de triunfo para quitárselos a los defensores.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Pasa sin juego en la Cuatrola
- **WHEN** la IA no tiene matadores, ni reyes, ni más de tres cartas de ningún palo
- **THEN** pasa en la subasta

#### Scenario: Solo con mano fuerte
- **WHEN** la IA tiene la espadilla, el basto y seis oros con la malilla y el punto, y nadie ha pujado
- **THEN** puja solo

#### Scenario: Llama el rey del palo corto
- **WHEN** la IA gana la subasta con rey, elige oros de triunfo, no tiene ninguna copa y tiene espadas y bastos
- **THEN** llama el Rey de copas

#### Scenario: Partidas completas de Cuatrola
- **WHEN** se juegan 500 partidas de Cuatrola entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Cuatrola
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
