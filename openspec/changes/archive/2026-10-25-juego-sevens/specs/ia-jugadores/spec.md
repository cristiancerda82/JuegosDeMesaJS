## ADDED Requirements

### Requirement: IA del Sevens nivel básico
El Sevens MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar como el del Cinquillo: entre sus cartas jugables, prefiere la que le deja más cartas propias por jugar en esa dirección de la escalera y abre menos camino a los rivales, y suelta pronto el As y la K.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Prefiere la carta que le acerca otras
- **WHEN** la escalera de picas va del 6 al 8, y la IA puede jugar el 9 de picas (y tiene el 10 y la J de picas) o el 5 de picas (sin más picas bajas)
- **THEN** juega el 9 de picas

#### Scenario: Partidas completas de Sevens
- **WHEN** se juegan 200 partidas de Sevens entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Sevens
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
