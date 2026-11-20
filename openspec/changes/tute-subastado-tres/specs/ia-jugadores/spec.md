## ADDED Requirements

### Requirement: IA del Tute subastado de 3
En el Tute subastado de 3, la IA básica MUST estimar lo que hace con su mano contando que cada baza ganada trae las cartas de dos rivales, y jugar las bazas con los defensores como compañeros, igual que con 4. Con 3, la IA básica MUST cumplir las mismas garantías y ganar a jugadores al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Pujar con 3
- **WHEN** en una partida de 3 la IA tiene una mano con la que espera hacer al menos 70 y nadie ha pujado
- **THEN** puja 70

#### Scenario: Partidas de 3
- **WHEN** se juegan partidas de Tute subastado de 3 entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal
