## ADDED Requirements

### Requirement: Barbu en la suite
El menú MUST incluir el Barbu junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4, a 7 manos. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Barbu
- **WHEN** el jugador elige el Barbu en el menú y empieza
- **THEN** se abre su mesa con su mano de 13 cartas y, como reparte, la elección del contrato

### Requirement: Mesa del Barbu
La mesa del Barbu MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- cuando le toca elegir, un botón por cada contrato que queda y, tras el triunfo, uno por cada palo;
- el contrato de la mano, con el triunfo si lo hay, y la mano que se juega de las 7;
- en los contratos de bazas, la baza en curso y lo que lleva anotado cada uno en la mano;
- en el dominó, las cuatro filas, el botón de pasar cuando no tiene carta que encaje, y quién ha acabado;
- los puntos de cada uno en la partida.

Al acabar cada mano, la mesa MUST mostrar un resumen con lo que anota cada uno en la mano y sus puntos de la partida.

#### Scenario: Elegir el contrato
- **WHEN** al jugador le toca elegir y toca «Sin damas»
- **THEN** la mesa muestra el contrato sin damas y el jugador sale en la primera baza

#### Scenario: Dominó en la mesa
- **WHEN** el contrato es el dominó
- **THEN** la mesa muestra las filas de los cuatro palos y el jugador toca las cartas que encajan

#### Scenario: Fin de la partida
- **WHEN** acaba la séptima mano
- **THEN** sale la pantalla de fin con el ganador y los puntos de cada jugador
