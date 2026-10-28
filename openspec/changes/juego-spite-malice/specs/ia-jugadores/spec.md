## ADDED Requirements

### Requirement: IA del Spite and Malice nivel básico
El Spite and Malice MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **El montón primero:** si puede jugar la carta de arriba de su montón, la juega.
- **Cadenas:** busca, con un número limitado de jugadas, una cadena de cartas de su mano y de sus descartes que deje una escalera en el valor que necesita la carta de su montón, y juega la primera.
- **No ayudar al rival:** si no hay cadena, juega cartas de la mano y de arriba de sus descartes que no sean K, mientras no dejen una escalera justo antes de la carta de arriba del montón del rival.
- **Descartar:** guarda los K. Descarta la carta más alta que pueda poner sobre otra de un valor más (para formar escaleras descendentes) o sobre una igual; si no, en un descarte vacío; y si no, sobre el descarte con la carta más alta.

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega su montón
- **WHEN** la carta de arriba del montón de la IA es un 4 y hay una escalera que va por el 3
- **THEN** la IA juega el 4 de su montón

#### Scenario: Cadena hasta el montón
- **WHEN** la carta de su montón es un 5, una escalera va por el 2 y la IA tiene un 3 y un 4 en la mano
- **THEN** juega el 3 de la mano

#### Scenario: Partidas completas de Spite and Malice
- **WHEN** se juegan 100 partidas de Spite and Malice entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Spite and Malice
- **WHEN** la IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
