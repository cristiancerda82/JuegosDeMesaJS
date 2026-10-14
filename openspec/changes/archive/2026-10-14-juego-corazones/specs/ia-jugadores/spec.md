## ADDED Requirements

### Requirement: IA de Corazones nivel básico
Los Corazones MUST ofrecer al menos un nivel de IA, con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Al pasar:** elige sus cartas más peligrosas: la Q, el K y el A de picas, y los corazones y las cartas más altas.
- **Al seguir el palo:** juega la carta más alta que no gana la baza. Si todas ganan, siendo el último juega la más alta (la baza ya es suya) y si no, la más baja.
- **Si no tiene el palo:** se deshace primero de la Q de picas, luego de su corazón más alto y luego de su carta más alta.
- **Al salir:** sale con su carta más baja de un palo que no sea corazones mientras pueda.

Este nivel MUST terminar con menos puntos que los jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Se deshace de la Q de picas
- **WHEN** la IA no tiene el palo de salida y tiene la Q de picas
- **THEN** juega la Q de picas

#### Scenario: No gana pudiendo evitarlo
- **WHEN** la IA sigue el palo y tiene cartas más bajas y más altas que la que va ganando la baza
- **THEN** juega la más alta de las que no ganan

#### Scenario: Partidas completas de Corazones
- **WHEN** se juegan 1.000 partidas de Corazones entre IAs con semillas distintas y distintas opciones
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en los Corazones
- **WHEN** la IA básica juega 1.000 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
