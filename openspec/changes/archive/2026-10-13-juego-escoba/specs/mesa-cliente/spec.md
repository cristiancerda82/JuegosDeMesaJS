## ADDED Requirements

### Requirement: Escoba en la suite
El menú MUST incluir la Escoba junto al resto de juegos. Sus opciones MUST permitir elegir el número de jugadores (2 o 4 en parejas), los puntos de la partida (15, 21 o 31), si recoger es obligatorio y si la mesa inicial que suma 15 cuenta como escoba, antes de empezar.

#### Scenario: Empezar una partida de Escoba
- **WHEN** el jugador elige la Escoba en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa de la Escoba con la configuración elegida

### Requirement: Elegir qué recoger
Al jugar una carta en la Escoba, el jugador MUST poder elegir qué cartas de la mesa recoge. Al elegir una carta de la mano, la mesa MUST resaltar las cartas que pueden formar 15 con ella. El jugador puede tocar cartas de la mesa para armar la captura y confirmarla, o dejar la carta en la mesa si es legal. Si arrastra la carta a la mesa y solo hay una jugada posible, se aplica directamente. Si hay varias, la mesa MUST mostrar las opciones para que elija una. Una captura que no suma 15 MUST NOT poder confirmarse.

#### Scenario: Elegir entre dos capturas
- **WHEN** el jugador suelta en la mesa una carta que puede recoger de dos formas
- **THEN** la mesa le muestra las dos capturas y la opción de no recoger (si es legal), y aplica la que elija

#### Scenario: Armar la captura tocando
- **WHEN** el jugador elige una carta de su mano y toca cartas de la mesa que suman 15 con ella
- **THEN** puede confirmar la captura y las cartas pasan a su montón

### Requirement: Escobas y puntuación visibles
La mesa de la Escoba MUST anunciar cada escoba, propia o de la IA, y mostrar durante la mano cuántas cartas y escobas lleva cada bando. Al terminar cada mano MUST mostrar el desglose de la puntuación (escobas, cartas, oros, 7 de oros y sietes) de cada bando, junto con los puntos acumulados de la partida.

#### Scenario: Fin de una mano de Escoba
- **WHEN** termina una mano de Escoba
- **THEN** el jugador ve el desglose de puntos de cada bando y el total de la partida antes de que se reparta la siguiente mano
