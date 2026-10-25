## ADDED Requirements

### Requirement: Cuarenta ladrones en la suite
El menú MUST incluir Cuarenta ladrones junto al resto de juegos. No tiene opciones: se empieza directamente.

#### Scenario: Empezar una partida de Cuarenta ladrones
- **WHEN** el jugador elige Cuarenta ladrones en el menú y empieza
- **THEN** se abre su mesa con el mazo, el descarte, las 8 fundaciones y las 10 columnas de 4 cartas

### Requirement: Mesa de Cuarenta ladrones
La mesa de Cuarenta ladrones MUST mostrar:
- arriba, el mazo con cuántas cartas quedan, el descarte y las 8 fundaciones;
- debajo, las 10 columnas, con las cartas solapadas de forma que se vea el valor de cada una.

Como en el Klondike, el jugador MUST poder:
- robar tocando el mazo;
- mover cartas y tramos, arrastrándolos o tocándolos y tocando el destino;
- subir una carta a las fundaciones con un doble toque;
- deshacer, autocompletar cuando se pueda, abandonar y pedir una pista.

La mesa MUST mostrar los movimientos y el tiempo, avisar si la partida se atasca y caber sin scroll horizontal en una pantalla de 360 × 640.

#### Scenario: Mover una carta
- **WHEN** el jugador toca el 7 de picas al final de una columna y luego una columna que acaba en el 8 de picas
- **THEN** el 7 pasa a esa columna

#### Scenario: Doble toque a la fundación
- **WHEN** el jugador hace doble toque en un As que es la última carta de su columna
- **THEN** el As sube a una fundación vacía

### Requirement: Fin de Cuarenta ladrones
Al subir las 104 cartas, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar Cuarenta ladrones
- **WHEN** la última carta sube a una fundación
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo
