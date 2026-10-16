## ADDED Requirements

### Requirement: Botón de pista en los solitarios
Las mesas de los solitarios MUST tener un botón «Pista». Al pulsarlo:
- si la pista sugiere un movimiento, MUST resaltar durante unos segundos las cartas que se moverían y el destino; si sugiere robar o repartir, el mazo;
- si no hay pista, MUST mostrar el aviso «No veo ningún movimiento útil: prueba a deshacer».

Cada pulsación con pista MUST sumar una pista usada. La pista MUST NOT hacer el movimiento por el jugador.

#### Scenario: Pedir una pista
- **WHEN** el jugador pulsa «Pista» en el Klondike y hay un As que se puede subir a una fundación
- **THEN** el As y la fundación se resaltan durante unos segundos, la partida no cambia y se cuenta una pista usada

### Requirement: Aviso de atasco
Cuando un solitario está atascado, la mesa MUST mostrar «No quedan movimientos» con los botones Deshacer (si se puede) y Abandonar.

#### Scenario: Atascado
- **WHEN** el jugador llega a una posición sin ningún movimiento posible
- **THEN** ve el aviso «No quedan movimientos» y puede deshacer o abandonar desde él

### Requirement: Pistas usadas en el fin de partida
La pantalla de fin de los solitarios MUST mostrar cuántas pistas se usaron. El número MUST guardarse con la partida y conservarse al retomarla.

#### Scenario: Ganar con pistas
- **WHEN** el jugador gana un Klondike después de pedir dos pistas
- **THEN** la pantalla de fin indica que usó 2 pistas
