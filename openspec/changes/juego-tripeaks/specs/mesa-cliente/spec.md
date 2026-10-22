## ADDED Requirements

### Requirement: TriPeaks en la suite
El menú MUST incluir TriPeaks junto al resto de juegos. No tiene opciones de reglas: al elegirlo se MUST poder empezar directamente.

#### Scenario: Empezar una partida de TriPeaks
- **WHEN** el jugador elige TriPeaks en el menú y empieza
- **THEN** se abre la mesa de TriPeaks con los tres picos repartidos

### Requirement: Mesa de TriPeaks
La mesa de TriPeaks MUST mostrar los tres picos con sus cartas solapadas como en una pirámide, las boca abajo con su dorso, y debajo el mazo y el descarte. MUST caber sin scroll horizontal en una pantalla de 360 × 640.

El jugador MUST poder:
- quitar una carta tocándola;
- robar tocando el mazo;
- deshacer, abandonar y pedir una pista.

Las cartas que se pueden quitar MUST distinguirse de las demás. La mesa MUST mostrar los movimientos, el tiempo, las cartas que quedan en el mazo, los puntos y la racha en curso. Si la partida se atasca, MUST avisar como en el resto de solitarios.

#### Scenario: Quitar tocando
- **WHEN** el jugador toca una carta sin nada encima que vale una más que la del descarte
- **THEN** la carta pasa al descarte y los puntos y la racha suben

#### Scenario: Una carta que no se puede quitar
- **WHEN** el jugador toca una carta que no encaja o que está tapada
- **THEN** no cambia nada

### Requirement: Fin de TriPeaks
Al despejar los tres picos, la mesa MUST mostrar la victoria con los puntos, los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada con los puntos conseguidos.

#### Scenario: Ganar TriPeaks
- **WHEN** el jugador quita la última carta de los picos
- **THEN** ve la pantalla de victoria con sus puntos, sus movimientos y su tiempo
