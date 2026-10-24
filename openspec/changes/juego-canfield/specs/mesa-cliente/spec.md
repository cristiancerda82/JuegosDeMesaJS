## ADDED Requirements

### Requirement: Canfield en la suite
El menú MUST incluir el Canfield junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir si se roba de 3 en 3 (por defecto) o de 1 en 1.

#### Scenario: Empezar una partida de Canfield
- **WHEN** el jugador elige el Canfield en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Canfield con la reserva, el mazo, la primera fundación con la base y las 4 columnas

### Requirement: Mesa del Canfield
La mesa del Canfield MUST mostrar:
- arriba, el mazo, el descarte y las 4 fundaciones, con la base a la vista;
- debajo, la reserva con su carta de arriba y cuántas quedan, y las 4 columnas con las cartas solapadas de forma que se vea el valor de cada una.

Como en el Klondike, el jugador MUST poder robar tocando el mazo; mover cartas y tramos arrastrándolos o tocándolos y tocando el destino; subir una carta a las fundaciones con un doble toque; y deshacer, autocompletar cuando se pueda, abandonar y pedir una pista. La mesa MUST mostrar los movimientos y el tiempo, avisar si la partida se atasca y caber sin scroll horizontal en una pantalla de 360 × 640.

#### Scenario: Jugar la reserva
- **WHEN** el jugador toca la carta de arriba de la reserva y luego una columna en la que encaja
- **THEN** la carta pasa a esa columna y se descubre la siguiente de la reserva

#### Scenario: Doble toque a la fundación
- **WHEN** el jugador hace doble toque en una carta del número base que es la última de su columna
- **THEN** la carta sube a una fundación vacía

### Requirement: Fin del Canfield
Al subir las 52 cartas, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Canfield
- **WHEN** la última carta sube a una fundación
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo
