## ADDED Requirements

### Requirement: IA del Rummy 500 nivel básico
El Rummy 500 MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Robar:** coge del descarte desde la carta que más le compensa (los puntos que puede bajar o añadir enseguida con lo que coge, menos la mitad de los puntos de las cartas que se lleva y no puede usar), si compensa algo; si no, roba del mazo.
- **Bajar y añadir:** baja todas las combinaciones que puede formar, eligiendo la agrupación de su mano que más puntos baja, y añade a la mesa todas las cartas que puede, dejando siempre una carta para descartar.
- **Descartar:** suelta la carta que menos le sirve: entre las que no forman pareja ni van junto a otra del mismo palo, la de más puntos; si todas le sirven, la de más puntos.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Coger del descarte para bajar
- **WHEN** la IA tiene el 8 y el 9 de picas y en el descarte está el 7 de picas con una carta encima
- **THEN** coge desde el 7 de picas y baja la escalera

#### Scenario: Baja lo que puede
- **WHEN** tras robar, la IA tiene en la mano tres reinas y otras cartas
- **THEN** baja el grupo de reinas

#### Scenario: Añade a la mesa
- **WHEN** en la mesa hay una escalera 4-5-6 de corazones y la IA tiene el 7 de corazones y otras cartas
- **THEN** añade el 7 de corazones

#### Scenario: Partidas completas de Rummy 500
- **WHEN** se juegan 200 partidas de Rummy 500 entre IAs con semillas distintas, de 2 a 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Rummy 500
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
