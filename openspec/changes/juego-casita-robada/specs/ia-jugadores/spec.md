## ADDED Requirements

### Requirement: IA de la Casita robada nivel básico
La Casita robada MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Robar:** si puede robar una casita, roba la más grande. Si varias jugadas roban la misma cantidad, usa la carta de cuyo número quedan menos sin ver.
- **Capturar:** si no puede robar y puede llevarse cartas de la mesa, juega la carta que se lleva más. A igualdad, la de cuyo número quedan menos sin ver.
- **Dejar:** si no puede llevarse nada, deja en la mesa la carta de cuyo número quedan menos sin ver; a igualdad, la más baja.

Las cartas sin ver de un número son las que no están en su mano, en la mesa ni en ninguna casita.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Roba la casita grande
- **WHEN** la IA puede robar una casita de 8 cartas con un Rey o llevarse 2 cartas de la mesa con un 4
- **THEN** juega el Rey y roba la casita

#### Scenario: Se lleva lo que más puede
- **WHEN** la IA no puede robar, con un 3 se lleva 1 carta y con un 6 se lleva 2
- **THEN** juega el 6

#### Scenario: Deja la carta más vista
- **WHEN** la IA no puede llevarse nada, tiene un 2 y un 7, y ya se han visto los otros tres sietes
- **THEN** deja el 7

#### Scenario: Partidas completas de Casita robada
- **WHEN** se juegan 100 partidas de Casita robada entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en la Casita robada
- **WHEN** la IA básica juega 200 partidas de 2 jugadores contra uno que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
