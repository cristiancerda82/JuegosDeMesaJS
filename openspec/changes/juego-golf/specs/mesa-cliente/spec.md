## ADDED Requirements

### Requirement: Golf en la suite
El menú MUST incluir el Golf junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir si la K y el As se tocan (con vuelta) o no (sin vuelta, por defecto).

#### Scenario: Empezar una partida de Golf
- **WHEN** el jugador elige el Golf en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Golf con la configuración elegida

### Requirement: Mesa del Golf
La mesa del Golf MUST mostrar las 7 columnas sin scroll horizontal en una pantalla de 360 × 640, con las cartas de cada columna solapadas de modo que se vea el índice de todas, y debajo el mazo y el descarte.

El jugador MUST poder:
- mover una carta al descarte tocándola;
- robar tocando el mazo;
- deshacer, abandonar y pedir una pista.

Las cartas que se pueden mover MUST distinguirse de las demás. La mesa MUST mostrar los movimientos, el tiempo y las cartas que quedan en el mazo. Si la partida se atasca, MUST avisar como en el resto de solitarios.

#### Scenario: Mover tocando
- **WHEN** el jugador toca la última carta de una columna que vale una más que la del descarte
- **THEN** la carta pasa al descarte y los movimientos suben en uno

#### Scenario: Una carta que no se puede mover
- **WHEN** el jugador toca una carta que no se puede mover
- **THEN** no cambia nada

### Requirement: Fin del Golf
Al vaciar las columnas, la mesa MUST mostrar la victoria con los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Golf
- **WHEN** el jugador mueve la última carta de las columnas
- **THEN** ve la pantalla de victoria con sus movimientos y su tiempo
