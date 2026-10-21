## ADDED Requirements

### Requirement: Mentiroso en la suite
El menú MUST incluir el Mentiroso junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 3 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Mentiroso MUST poder jugarse en red.

#### Scenario: Empezar una partida de Mentiroso
- **WHEN** el jugador elige el Mentiroso en el menú y empieza con 4 jugadores
- **THEN** se abre su mesa con 13 cartas en la mano y tres rivales de la IA

### Requirement: Mesa del Mentiroso
La mesa del Mentiroso MUST mostrar:
- los rivales con su número de cartas;
- el montón con su número de cartas y el valor que toca declarar;
- la última bajada («Rival 2: 3 sietes»);
- la mano propia ordenada por valor.

En su turno, el jugador:
- elige de 1 a 4 cartas de su mano y pulsa «Bajar N»;
- si hay una bajada anterior, puede pulsar antes «¡Mentiroso!»;
- si el anterior se quedó sin cartas, solo ve «Me lo creo» y «¡Mentiroso!».

Al desconfiar, MUST verse un momento las cartas descubiertas y quién se lleva el montón. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Bajar desde la mesa
- **WHEN** al jugador le toca declarar Ases, elige dos cartas y pulsa «Bajar 2»
- **THEN** las cartas salen de su mano, el montón crece en 2 y la mesa muestra «Tú: 2 Ases»

#### Scenario: Desconfiar desde la mesa
- **WHEN** un rival acaba de bajar y el jugador pulsa «¡Mentiroso!»
- **THEN** ve las cartas descubiertas y quién se lleva el montón

### Requirement: Fin del Mentiroso
Al terminar, la pantalla de fin MUST mostrar quién se ha quedado sin cartas y cuántas le quedaron a cada uno de los demás.

#### Scenario: Ganar el Mentiroso
- **WHEN** el jugador baja sus últimas cartas y el siguiente le cree
- **THEN** ve la pantalla de victoria con las cartas que les quedaron a los rivales
