## ADDED Requirements

### Requirement: IA del Conquián nivel básico
El Conquián MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar así:
- **Carta descubierta:** la usa siempre que puede, con la jugada que baja más cartas de su mano (si empatan, la que añade a una combinación propia).
- **Descarte:** descarta la carta que menos le sirve:
  - primero evita las que el rival podría añadir a sus combinaciones;
  - entre las demás, la que tiene menos relación con el resto de su mano (otras del mismo número y del mismo palo a una o dos posiciones);
  - si empatan, la más alta.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Usa la carta para bajar
- **WHEN** se descubre el 5 de bastos y la IA tiene el 5 de oros y el 5 de copas
- **THEN** baja el grupo de cincos

#### Scenario: Descarta la carta suelta
- **WHEN** la IA tiene que descartar con el 3 y el 4 de copas, el 6 y el 6 de otros palos y el rey de oros solo
- **THEN** descarta el rey de oros

#### Scenario: No da cartas al rival
- **WHEN** el rival tiene bajada la escalera del 3 al 5 de espadas y la IA podría descartar el 6 de espadas u otra carta suelta
- **THEN** no descarta el 6 de espadas

#### Scenario: Partidas completas de Conquián
- **WHEN** se juegan 100 partidas de Conquián entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Conquián
- **WHEN** una IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
