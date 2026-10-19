## ADDED Requirements

### Requirement: IA del Truc nivel básico
El Truc MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar de forma razonable:
- **Envit:** envida con 30 o más puntos. Acepta según sus puntos y sube la apuesta solo con muchos.
- **Truc:** valora su mano por sus cartas y las bazas ya ganadas. Truca o sube con una mano fuerte y acepta solo si su mano lo justifica. Con una probabilidad baja y fija farolea: truca con una mano floja. Esa decisión sale del azar del agente, así que es reproducible.
- **Retirarse:** se va de la mano solo cuando no querer no es posible y su mano no tiene opciones.
- **Al jugar:** gana la baza con la carta más baja que la gane cuando le conviene. Si no puede ganarla o ya la gana su compañero, juega la más baja.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar en la mayoría de las partidas.

#### Scenario: Envida con mucho envit
- **WHEN** a la IA le toca en la primera baza con 33 puntos de envit y nadie ha envidado
- **THEN** envida

#### Scenario: No quiere con mano mala
- **WHEN** a la IA le truca el rival y tiene un 4, un 5 y un 6 sin bazas ganadas
- **THEN** no quiere

#### Scenario: Partidas completas de Truc
- **WHEN** se juegan 500 partidas de Truc entre IAs con semillas distintas, de 2 y de 4 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Truc
- **WHEN** la IA básica (o una pareja de IAs) juega 500 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la mitad de las partidas
