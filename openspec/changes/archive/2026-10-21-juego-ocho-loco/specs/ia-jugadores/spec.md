## ADDED Requirements

### Requirement: IA del Ocho loco nivel básico
El Ocho loco MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable, pero sin guardar los ochos (eso lo hace la experta en la que se apoya el nivel difícil):
- **Elegir carta:** entre las que casan, ochos incluidos, prefiere la que le deja más cartas del palo que tocará después, y a igualdad, la de más puntos.
- **Elegir palo:** al jugar un 8, elige el palo del que más cartas le quedan (sin contar los ochos).
- **Carta robada:** si la carta robada se puede jugar, la juega.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Elige la carta por el palo que le queda
- **WHEN** toca corazones y la IA puede jugar el 4 de corazones o el 9 de picas, y le quedan dos picas más
- **THEN** juega el 9 de picas

#### Scenario: Palo del 8
- **WHEN** la IA solo puede jugar el 8 de picas y le quedan tres diamantes y un trébol
- **THEN** juega el 8 eligiendo diamantes

#### Scenario: Juega la robada
- **WHEN** la IA roba una carta que casa con el descarte
- **THEN** la juega

#### Scenario: Partidas completas de Ocho loco
- **WHEN** se juegan 500 partidas de Ocho loco entre IAs con semillas distintas, de 2 a 5 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Ocho loco
- **WHEN** la IA básica juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
