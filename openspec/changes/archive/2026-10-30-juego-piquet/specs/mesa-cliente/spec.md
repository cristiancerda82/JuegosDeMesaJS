## ADDED Requirements

### Requirement: Piquet en la suite
El menú MUST incluir el Piquet junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 2. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Piquet
- **WHEN** el jugador elige el Piquet en el menú y empieza
- **THEN** se abre su mesa con su mano de 12 cartas y el montón

### Requirement: Mesa del Piquet
La mesa del Piquet MUST mostrar:
- la mano del jugador y la del rival boca abajo;
- el montón con sus cartas;
- quién es mayor;
- la baza en curso;
- los puntos de la mano y de la partida, y el número de mano.

En el cambio, el jugador MUST elegir una a una las cartas que descarta, tocándolas en su mano, y después tocar un botón para robar. Tras el cambio, la mesa MUST enseñar las declaraciones: quién gana el punto, la secuencia y el conjunto, con qué combinación y cuánto anota, y las primas de repique o pique.

Al acabar cada mano, la mesa MUST mostrar un resumen con lo que anota cada uno por declaraciones, bazas, cartas y primas.

#### Scenario: Cambiar
- **WHEN** el jugador, siendo mayor, toca tres cartas y después «Robar»
- **THEN** su mano vuelve a tener 12 cartas y el montón 5

#### Scenario: Declaraciones
- **WHEN** acaba el cambio
- **THEN** la mesa enseña, por ejemplo, «Punto: Rival, 6» y «Secuencia: Tú, quinta · 15»

#### Scenario: Fin de la partida
- **WHEN** acaba la sexta mano
- **THEN** sale la pantalla de fin con el ganador, los puntos de cada uno y lo que vale la partida
