## MODIFIED Requirements

### Requirement: Tres niveles en cada juego contra la máquina
Cada juego con IA (Brisca, Tute, Guiñote, Escoba, Chinchón, Siete y media, Cinquillo, Pocha, Mus, Corazones, Burro y Pinacle) MUST ofrecer una IA para cada nivel: `facil`, `normal` y `dificil`. La IA `normal` MUST ser la IA básica del juego. Todos los niveles MUST cumplir las garantías generales de la IA:
- deciden solo con la vista de su asiento;
- eligen siempre una acción legal;
- son reproducibles con su semilla;
- deciden en menos de 500 ms.

#### Scenario: Partidas completas con todos los niveles
- **WHEN** se juegan partidas de cada juego mezclando asientos de los tres niveles, con semillas distintas
- **THEN** todas terminan sin ninguna acción ilegal

#### Scenario: Misma decisión en todos los niveles
- **WHEN** se pide dos veces una decisión a la IA de cualquier nivel con la misma vista y la misma semilla
- **THEN** elige la misma acción

### Requirement: Nivel difícil por simulación
La IA difícil MUST decidir así:
1. Si solo hay una acción legal, la elige.
2. Si hay varias, reconstruye varias veces el estado a partir de su vista.
3. En cada reconstrucción, prueba cada acción legal y juega el resto de la mano con la IA normal en todos los asientos.
4. Valora el resultado de cada partida simulada desde su punto de vista (los puntos, bazas, fichas o piedras de la mano para su bando, menos los de los rivales).
5. Elige la acción que elegiría la IA normal, salvo que otra le gane claramente: su ventaja media, medida reconstrucción a reconstrucción, MUST superar 1,5 veces su error típico. Si varias le ganan claramente, elige la de mayor ventaja media. Con pocas simulaciones y mucho azar, elegir sin más la de mejor media escoge a menudo una acción que solo tuvo suerte.

El número de simulaciones MUST ser fijo para cada juego, no depender del reloj, para que la decisión sea reproducible y siga por debajo de 500 ms. Cada juego MUST tener un presupuesto de simulaciones por decisión. Con muchas acciones legales se hacen menos reconstrucciones, y si no llegan a dos por acción, la IA difícil MUST decidir como la normal (por ejemplo, al elegir las 3 cartas del pase en los Corazones). Un juego MAY limitar cuántas jugadas se simulan tras la acción y valorar lo que queda en ese punto (el Chinchón y el Pinacle, de manos largas).

En el Burro no hay simulación: la IA difícil pasa cartas como la normal y su ventaja está en reaccionar más rápido en la mesa.

En el Mus, la IA difícil MUST jugar como la normal mientras no haya una IA experta del Mus. La simulación no le gana a la normal porque, al repartir las manos ocultas al azar, no ve que el rival envida o acepta justo cuando lleva buena mano. La reconstrucción del Mus se conserva para esa IA futura.

En el Pinacle, la IA difícil MUST simular solo dos decisiones: si roba del mazo o se lleva el montón, y qué carta descarta cuando la normal descartaría. Lo que baja, añade o cambia lo decide como la normal. Con un montón de 10 cartas o más, o con alguna mano de más de 18, MUST decidir como la normal: quien se lleva el montón en la simulación acaba con muchas cartas y cada jugada simulada cuesta tanto que no cabría en el tiempo. La vista del Pinacle ya muestra todo lo público, incluidas las cartas que cada rival se llevó del montón, y la reconstrucción MUST mantenerlas en su mano.

En cada juego con simulación, la IA difícil MUST ganar más partidas que la normal cuando se enfrentan.

#### Scenario: Una sola acción legal
- **WHEN** la IA difícil tiene una sola acción legal
- **THEN** la elige sin simular

#### Scenario: Demasiadas acciones para el presupuesto
- **WHEN** la IA difícil de los Corazones elige las 3 cartas del pase entre 286 combinaciones
- **THEN** decide como la normal, sin simular

#### Scenario: Difícil contra normal
- **WHEN** la IA difícil juega 200 partidas contra la normal (un bando contra otro, o un asiento contra los demás, alternando asientos)
- **THEN** gana más partidas de las que le corresponderían si las dos fueran iguales: más de la mitad con dos bandos, o más de una de cada N con N jugadores por su cuenta

#### Scenario: Qué simula el difícil del Pinacle
- **WHEN** la IA difícil del Pinacle puede bajar una combinación
- **THEN** la baja como la normal, sin simular
