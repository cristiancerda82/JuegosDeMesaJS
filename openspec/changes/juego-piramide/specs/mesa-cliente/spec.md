## ADDED Requirements

### Requirement: Pirámide en la suite
El menú MUST incluir la Pirámide junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir cuántas veces se recorre el mazo: 3 (por defecto), 1 o sin límite.

#### Scenario: Empezar una partida de Pirámide
- **WHEN** el jugador elige la Pirámide en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Pirámide con la configuración elegida

### Requirement: Mesa de la Pirámide
La mesa de la Pirámide MUST mostrar la pirámide entera sin scroll horizontal en una pantalla de 360 × 640, con las cartas de cada fila solapando a las de la fila de arriba, y debajo el mazo y el descarte.

El jugador MUST poder:
- quitar una pareja tocando las dos cartas, una tras otra, y una K tocándola;
- cancelar la selección tocando otra vez la carta elegida;
- robar tocando el mazo y dar la vuelta al descarte tocando el mazo vacío;
- deshacer, abandonar y pedir una pista.

Las cartas libres MUST distinguirse de las tapadas. La mesa MUST resaltar la carta elegida y mostrar los movimientos, el tiempo y las vueltas que quedan. Si la partida se atasca, MUST avisar como en el resto de solitarios.

#### Scenario: Quitar una pareja tocando
- **WHEN** el jugador toca un 9 libre y después un 4 libre
- **THEN** las dos cartas desaparecen y los movimientos suben en uno

#### Scenario: Pareja que no suma 13
- **WHEN** el jugador toca un 9 libre y después un 5 libre
- **THEN** no se quita nada y queda elegido el 5

### Requirement: Fin de la Pirámide
Al vaciar la pirámide, la mesa MUST mostrar la victoria con los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar la Pirámide
- **WHEN** el jugador quita la última carta de la pirámide
- **THEN** ve la pantalla de victoria con sus movimientos y su tiempo
