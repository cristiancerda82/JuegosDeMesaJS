## ADDED Requirements

### Requirement: IA del Oh Hell nivel básico
El Oh Hell MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Apostar:** cuenta sus cartas ganadoras: los Ases, los triunfos altos (A, K y Q, y los demás triunfos si tiene muchos) y los reyes con otra carta de su palo. Si su apuesta está prohibida, apuesta la más cercana permitida.
- **Jugar:** mientras le falten bazas para su apuesta, gana la baza con la carta más barata que la gane, y al salir juega su carta más alta. Si ya tiene las bazas que apostó, juega la carta más alta que no gana la baza, o al salir la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Apuesta sus Ases
- **WHEN** la IA tiene en una mano de 3 cartas el As de picas, el As de corazones y un 2 de tréboles, y el triunfo es diamantes
- **THEN** apuesta 2

#### Scenario: Evita ganar cuando ya tiene sus bazas
- **WHEN** la IA ya hizo las bazas que apostó y puede seguir el palo con el K o el 3
- **THEN** juega la carta más alta que no gana la baza

#### Scenario: Partidas completas de Oh Hell
- **WHEN** se juegan 100 partidas de Oh Hell entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Oh Hell
- **WHEN** una IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de una de cada cuatro
