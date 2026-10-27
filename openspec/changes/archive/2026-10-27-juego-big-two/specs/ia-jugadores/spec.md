## ADDED Requirements

### Requirement: IA del Big Two nivel básico
El Big Two MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Salir:** con la jugada que se deshace de su carta más baja, prefiriendo la que suelta más cartas (una de 5, un trío o una pareja antes que una suelta).
- **Superar:** con la jugada más baja que supera a la de la mesa, prefiriendo las que no rompen sus parejas, tríos ni jugadas de 5.
- **Guardar los 2:** no juega un 2 (ni una jugada con un 2) para superar, mientras ningún rival tenga 4 cartas o menos; entonces pasa.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Supera con lo justo
- **WHEN** en la mesa hay un 7 suelto y la IA tiene un 8, un 9 suelto, una pareja de 10 y un 2
- **THEN** juega el 8

#### Scenario: Guarda el 2
- **WHEN** en la mesa hay un As suelto, la IA solo puede superarlo con un 2 y a todos los rivales les quedan más de 4 cartas
- **THEN** pasa

#### Scenario: Partidas completas de Big Two
- **WHEN** se juegan 100 partidas de Big Two entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Big Two
- **WHEN** la IA básica juega 200 partidas contra tres jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de la cuarta parte
