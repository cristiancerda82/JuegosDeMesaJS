## ADDED Requirements

### Requirement: Pedir tapada en la Siete y media
La Siete y media MAY jugarse con la opción «Pedir tapada» (desactivada por defecto). Una partida o una sala sin esa opción MUST jugarse como siempre.

Con la opción:
- cada vez que pide carta, el jugador MUST poder elegir si la recibe boca arriba o boca abajo;
- una carta pedida boca abajo MUST verla solo su dueño hasta que se destapan las cartas al final de la mano, como la primera;
- si con una carta tapada la jugada pasa de 7,5, el jugador se pasa como siempre: pierde su apuesta en el acto y todos ven que se ha pasado, pero no sus cartas tapadas;
- la vista de los demás MUST NOT mostrar una carta tapada en ningún sitio, tampoco en la última jugada; sí MUST mostrar cuántas cartas tapadas tiene cada jugador y el valor de sus cartas boca arriba.

#### Scenario: Pedir tapada
- **WHEN** un punto pide una carta tapada y le sale un 5
- **THEN** él ve el 5, los demás ven una carta boca abajo, y el valor que ven de su jugada no cambia

#### Scenario: Pasarse con una tapada
- **WHEN** un punto con 6 pide tapada y le sale un 3
- **THEN** se pasa, la banca cobra su apuesta y los demás ven que se ha pasado pero no el 3

#### Scenario: Al final se ve todo
- **WHEN** termina la mano
- **THEN** el resultado muestra todas las cartas de cada jugador, también las tapadas

#### Scenario: Partida sin la opción
- **WHEN** se juega una partida sin la opción de pedir tapada
- **THEN** solo se puede pedir carta boca arriba, como siempre
