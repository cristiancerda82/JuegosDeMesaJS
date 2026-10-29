## ADDED Requirements

### Requirement: La Belle Lucie en la suite
El menú MUST incluir La Belle Lucie junto al resto de juegos. No tiene opciones: se empieza directamente.

#### Scenario: Empezar una partida de La Belle Lucie
- **WHEN** el jugador elige La Belle Lucie en el menú y empieza
- **THEN** se abre su mesa con las fundaciones vacías y los 18 abanicos

### Requirement: Mesa de La Belle Lucie
La mesa de La Belle Lucie MUST mostrar las 4 fundaciones y los abanicos con sus cartas solapadas, de forma que se vea el valor de cada una.

El jugador MUST poder:
- mover la carta de arriba de un abanico tocándola y tocando el destino, o subirla a su fundación tocándola dos veces;
- rebarajar con un botón que dice cuántos rebarajes le quedan;
- hacer la merci, cuando se puede, tocando el botón y después la carta;
- deshacer, abandonar y pedir una pista.

La mesa MUST mostrar los movimientos y el tiempo, avisar si la partida se atasca y caber sin scroll horizontal en una pantalla de 360 × 640.

#### Scenario: Mover desde la mesa
- **WHEN** el jugador toca el 6 de picas de arriba de un abanico y después un abanico que acaba en el 7 de picas
- **THEN** el 6 de picas pasa a ese abanico

### Requirement: Fin de La Belle Lucie
Al subir las 52 cartas, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar La Belle Lucie
- **WHEN** el último movimiento sube la última carta a su fundación
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo
