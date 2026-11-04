## ADDED Requirements

### Requirement: IA del Écarté nivel básico
El Écarté MUST ofrecer una IA básica con las mismas garantías que el resto de IAs:
- decide solo con la vista de su asiento;
- juega siempre una acción legal;
- es reproducible con su semilla;
- responde en menos de 500 ms.

Este nivel MUST jugar con estas reglas:
- **Bazas que espera:**
  - cada triunfo cuenta 1 si es K, Q o J, o si tiene 3 triunfos o más, y medio si no;
  - cada rey de otro palo cuenta 1 y cada dama de otro palo, medio.
- **Cambio:**
  - el mano juega si espera 3 bazas o más, y si no, propone;
  - el que reparte rehúsa si espera 3 bazas o más, y si no, acepta.
- **Descarte:**
  - se descarta de todas las cartas que no son triunfo ni rey, empezando por las más bajas y sin pasar de las que quedan en el montón;
  - si quiere quedarse con todas, el mano se descarta de su carta más baja que no sea triunfo y el que reparte no se descarta de ninguna.
- **Salir:** con un rey que no es triunfo si tiene; si no, con su triunfo más alto si tiene dos o más; si no, con la carta más baja de su palo más largo.
- **Responder:** con la carta legal más baja que gane la baza; si no puede ganarla, con la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: Juega de autoridad con buena mano
- **WHEN** el mano tiene la K, la Q y la J de triunfo y otras dos cartas bajas
- **THEN** juega sin proponer

#### Scenario: Propone con mala mano
- **WHEN** el mano no tiene triunfos ni reyes
- **THEN** propone el cambio

#### Scenario: Se descarta de las cartas flojas
- **WHEN** la IA cambia con dos triunfos, un rey de otro palo, un 8 y un 7
- **THEN** se descarta del 8 y del 7

#### Scenario: Partidas completas de Écarté
- **WHEN** se juegan 100 partidas de Écarté entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Écarté
- **WHEN** una IA básica juega 200 partidas contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
