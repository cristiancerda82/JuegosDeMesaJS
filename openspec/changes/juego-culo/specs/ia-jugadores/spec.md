## ADDED Requirements

### Requirement: IA del Culo nivel básico
El Culo MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar así:
- **Abrir:** juega todas las cartas de su valor más bajo que no sea el 2. Si solo le quedan doses, los juega.
- **Responder:** juega el valor más bajo que supera la jugada, prefiriendo un valor del que tenga justo las cartas que hacen falta para no romper un grupo. Solo rompe un grupo si no tiene otro modo de superar. Guarda los doses: solo corta con ellos si después le quedan, como mucho, dos valores distintos en la mano. Si no juega, pasa.
- **Intercambio:** devuelve sus cartas más bajas, empezando por las de los valores de los que tenga menos cartas.

Este nivel MUST ganar a jugadores que eligen acciones legales al azar claramente más partidas de las que le corresponderían si todos fueran iguales.

#### Scenario: Abrir con lo más bajo
- **WHEN** la IA abre con dos treses, un 7 y un 2
- **THEN** juega los dos treses

#### Scenario: Responder sin romper
- **WHEN** la última jugada es un 5 y la IA tiene un 6 suelto, dos sotas y un rey
- **THEN** juega el 6

#### Scenario: Guardar los doses
- **WHEN** la última jugada es un As, la IA solo puede superarla con un 2 y le quedan cuatro valores distintos más
- **THEN** pasa

#### Scenario: Partidas completas de Culo
- **WHEN** se juegan 200 partidas de Culo entre IAs con semillas distintas, de 3 a 6 jugadores
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en el Culo
- **WHEN** la IA básica juega 200 partidas contra jugadores que eligen acciones legales al azar
- **THEN** gana claramente más de las que le corresponderían si todos fueran iguales
