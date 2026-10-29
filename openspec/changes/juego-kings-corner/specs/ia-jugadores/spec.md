## ADDED Requirements

### Requirement: IA de Kings in the Corner nivel básico
Kings in the Corner MUST ofrecer una IA básica con las mismas garantías que el resto de IAs: decide solo con la vista de su asiento, juega siempre una acción legal, es reproducible con su semilla y responde en menos de 500 ms. Este nivel MUST jugar, en cada decisión, lo primero que pueda de esta lista:
1. **Mover pilas:** mueve una pila lateral que encaje sobre otra, para abrir un hueco.
2. **Reyes:** pone un K en una esquina vacía.
3. **Jugar cartas:** pone una carta sobre una pila, empezando por la más alta.
4. **Llenar huecos:** pone en un hueco lateral la carta de su mano desde la que puede encadenar más cartas suyas (a igualdad, la más alta).
5. **Pasar.**

Este nivel MUST ganar a un jugador que elige acciones legales al azar claramente más partidas de las que le corresponderían si fueran iguales.

#### Scenario: El K a la esquina
- **WHEN** la IA tiene un K y hay una esquina vacía, y no puede mover ninguna pila
- **THEN** pone el K en la esquina

#### Scenario: Mueve una pila para abrir hueco
- **WHEN** una pila lateral empieza por el 9 de corazones y otra tiene arriba el 10 de tréboles
- **THEN** la IA mueve la pila del 9 sobre la del 10

#### Scenario: Partidas completas de Kings in the Corner
- **WHEN** se juegan 100 partidas de Kings in the Corner entre IAs con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Contra el azar en Kings in the Corner
- **WHEN** la IA básica juega 200 partidas a dos contra un jugador que elige acciones legales al azar
- **THEN** gana claramente más de la mitad
