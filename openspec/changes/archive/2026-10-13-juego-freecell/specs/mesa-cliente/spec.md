## ADDED Requirements

### Requirement: FreeCell en la suite
El menú MUST incluir el FreeCell junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir una partida al azar o una por su número (del 1 al 32.000), el número de celdas y si las cartas van solas a las fundaciones.

#### Scenario: Jugar una partida concreta
- **WHEN** el jugador elige el FreeCell, escribe el número 617 y empieza
- **THEN** se abre la mesa con el reparto de la partida 617 y el número a la vista

### Requirement: Mesa del FreeCell
La mesa MUST mostrar arriba las celdas y las fundaciones, y debajo las 8 columnas con todas sus cartas a la vista. Los movimientos MUST hacerse arrastrando o tocando, como en el Klondike. Al tocar una carta, la mesa resalta los destinos posibles, y con doble toque la carta va a su fundación o, si no puede, a una celda libre. Al arrastrar una carta de una columna se lleva consigo la secuencia que tiene encima, si se puede mover entera. La mesa MUST mostrar el número de partida, los movimientos, el tiempo, cuántas cartas se pueden mover a la vez y los botones de deshacer, autocompletar (cuando esté disponible) y abandonar.

#### Scenario: Mover una secuencia arrastrando
- **WHEN** el jugador arrastra la tercera carta empezando por el final de una columna ordenada, con suficientes celdas libres, sobre una columna válida
- **THEN** las tres cartas se mueven juntas

#### Scenario: Columnas largas en pantallas pequeñas
- **WHEN** una columna tiene más de 12 cartas en una pantalla de 360 × 640
- **THEN** las cartas se solapan más para que la columna quepa sin scroll, y el índice de cada carta sigue a la vista
