## ADDED Requirements

### Requirement: Scorpion en la suite
El menú MUST incluir el Scorpion junto al resto de juegos. No tiene opciones: se empieza directamente.

#### Scenario: Empezar una partida de Scorpion
- **WHEN** el jugador elige el Scorpion en el menú y empieza
- **THEN** se abre su mesa con las 7 columnas y la reserva

### Requirement: Mesa del Scorpion
La mesa del Scorpion MUST mostrar las 7 columnas con las cartas solapadas, de forma que se vea el valor de cada una (las tapadas, más juntas), y la reserva con cuántas cartas le quedan.

El jugador MUST poder:
- mover una carta con las que tiene encima, arrastrándola o tocándola y tocando el destino;
- repartir la reserva tocándola;
- deshacer, abandonar y pedir una pista.

La mesa MUST mostrar los movimientos y el tiempo, avisar si la partida se atasca y caber sin scroll horizontal en una pantalla de 360 × 640.

#### Scenario: Mover desde la mesa
- **WHEN** el jugador toca el 6 de picas de una columna y después una columna que acaba en el 7 de picas
- **THEN** el 6 de picas y las cartas que tenía encima pasan a esa columna

### Requirement: Fin del Scorpion
Al completar las cuatro escaleras, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Scorpion
- **WHEN** el último movimiento completa las cuatro escaleras
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo
