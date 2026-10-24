## ADDED Requirements

### Requirement: Yukon en la suite
El menú MUST incluir el Yukon junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir cómo se construye en las columnas: por colores alternos (por defecto) o por palo (Solitario ruso).

#### Scenario: Empezar una partida de Yukon
- **WHEN** el jugador elige el Yukon en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Yukon con las 7 columnas repartidas y las 4 fundaciones vacías

### Requirement: Mesa del Yukon
La mesa del Yukon MUST mostrar las 4 fundaciones arriba y las 7 columnas debajo, con las cartas boca abajo con su dorso y las boca arriba solapadas de forma que se vea el valor de cada una. MUST caber sin scroll horizontal en una pantalla de 360 × 640.

Como en el Klondike, el jugador MUST poder:
- mover cualquier carta boca arriba con todo lo que tiene encima, arrastrándola o tocándola y tocando el destino;
- subir una carta a las fundaciones con un doble toque;
- deshacer, autocompletar cuando se pueda, abandonar y pedir una pista.

La mesa MUST mostrar los movimientos y el tiempo, y avisar si la partida se atasca, como en el resto de solitarios.

#### Scenario: Mover un grupo desde la mesa
- **WHEN** el jugador arrastra una carta boca arriba del medio de una columna sobre una carta en la que encaja
- **THEN** esa carta y todas las que tenía encima pasan a la otra columna

#### Scenario: Doble toque a la fundación
- **WHEN** el jugador hace doble toque en un as que es la última carta de su columna
- **THEN** el as sube a una fundación

### Requirement: Fin del Yukon
Al subir las 52 cartas, la mesa MUST mostrar la victoria con los movimientos y el tiempo, y avisar si se ha batido un récord. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Ganar el Yukon
- **WHEN** la última carta sube a una fundación
- **THEN** el jugador ve la pantalla de victoria con sus movimientos y su tiempo
