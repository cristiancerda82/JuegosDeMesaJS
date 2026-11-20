## ADDED Requirements

### Requirement: IA del Polignac con el orden antiguo
Con la opción del orden antiguo, la IA básica del Polignac MUST jugar igual que sin ella, pero comparando las cartas con el orden de la variante (Rey, Dama, Jota, As, 10, 9, 8 y 7). Para anunciar el general, sus cartas de cada palo MUST ser las más altas seguidas desde el Rey. Con la opción, la IA básica MUST cumplir las mismas garantías y ganar a jugadores al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: El general con el orden antiguo
- **WHEN** con la opción la IA tiene en cada palo el Rey, o el Rey y la Dama, y ninguna otra carta
- **THEN** anuncia el general

#### Scenario: Partidas con el orden antiguo
- **WHEN** se juegan partidas de Polignac con la opción entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal
