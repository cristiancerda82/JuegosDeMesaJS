## ADDED Requirements

### Requirement: IA del Remigio nivel básico
El Remigio MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Robar:** roba del montón cuando su carta de arriba forma o amplía una combinación con su mano. Si no, roba del mazo.
- **Bajar:**
  - baja las combinaciones que puede formar, gastando antes las cartas naturales que los comodines;
  - si con lo que tiene está cerca de cerrar con remigio y aún no ha bajado, guarda las combinaciones para bajarlas de golpe;
  - tras haber bajado, añade cartas a las combinaciones de la mesa y cambia comodines cuando puede.
- **Descartar:** descarta la carta que menos combina con su mano y, entre las que combinan igual, la que más puntos vale. No descarta comodines mientras tenga otra opción.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Roba del montón si le sirve
- **WHEN** la IA tiene el 4 y el 5 de copas y en el montón está el 6 de copas
- **THEN** roba del montón

#### Scenario: No descarta comodines
- **WHEN** la IA tiene que descartar y tiene un comodín y cartas sueltas
- **THEN** descarta una carta suelta

#### Scenario: Partidas completas de Remigio
- **WHEN** se juegan 200 partidas de Remigio entre IAs con semillas distintas, de 2 a 5 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Remigio
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
