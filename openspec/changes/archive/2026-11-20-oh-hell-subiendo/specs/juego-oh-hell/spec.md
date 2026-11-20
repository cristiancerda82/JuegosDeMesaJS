## ADDED Requirements

### Requirement: Oh Hell empezando con 1 carta
El Oh Hell MUST tener la opción «Empezar con 1 carta», desactivada por defecto. Con la opción, la partida MUST jugar las manos de 1 carta subiendo de una en una hasta el máximo de cartas por mano, y terminar tras esa mano. Lo demás (triunfo, apuestas, bazas, puntos y rotación del repartidor) MUST ser igual que sin la opción. Sin la opción, la secuencia de manos MUST ser la de siempre.

#### Scenario: Secuencia subiendo con 4 jugadores
- **WHEN** se juega con 4 jugadores y la opción
- **THEN** las manos reparten 1, 2… 11 y 12 cartas: 12 manos

#### Scenario: Primera mano con la opción
- **WHEN** empieza la partida con la opción
- **THEN** cada uno recibe 1 carta y puede apostar 0 o 1

#### Scenario: Partidas entre IAs con la opción
- **WHEN** se juegan partidas de Oh Hell con la opción entre IAs con semillas distintas, de 3 a 7 jugadores
- **THEN** todas terminan tras el número de manos de la variante sin ninguna acción ilegal
