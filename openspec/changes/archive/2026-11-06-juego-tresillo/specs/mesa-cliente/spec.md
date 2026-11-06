## ADDED Requirements

### Requirement: Tresillo en la suite
El menú MUST incluir el Tresillo junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. La partida es siempre de 12 manos con 100 fichas. Como el resto de juegos con IA, MUST poder jugarse en red con 3 jugadores.

#### Scenario: Empezar una partida de Tresillo
- **WHEN** el jugador elige el Tresillo y empieza
- **THEN** se abre su mesa con su mano de 9 cartas, el bote y sus fichas

### Requirement: Mesa del Tresillo
La mesa del Tresillo MUST mostrar:
- la mano del jugador y las de los rivales boca abajo;
- lo que ha pujado cada uno;
- el hombre, el contrato y el triunfo;
- la carta vuelta y cuántas cartas quedan en el monte;
- en el cambio, cuántas cartas cambió cada uno;
- la baza en curso y las bazas de cada uno;
- el bote, las fichas de cada uno y la mano en curso de las 12.

Cuando le toca, el jugador MUST tener:
- en la subasta, los botones de los contratos que puede pujar y «Paso»;
- para elegir el triunfo, un botón por palo;
- en el cambio, tocar las cartas que se descarta y luego «Cambiar» (o «No cambiar»).

Al acabar cada mano, la mesa MUST mostrar un resumen con:
- el hombre, el contrato y el triunfo;
- si fue sacada, puesta o codillo;
- las bazas, lo que gana o paga cada uno y sus fichas.

#### Scenario: Pujar, elegir el triunfo y cambiar
- **WHEN** el jugador puja entrada, gana la subasta, elige oros y se descarta de 3 cartas
- **THEN** el triunfo es oros y sigue con 9 cartas, tres de ellas nuevas

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra si fue sacada, puesta o codillo y las fichas de cada uno

#### Scenario: Fin de la partida
- **WHEN** acaba la mano 12 o un jugador se queda sin fichas
- **THEN** sale la pantalla de fin con el ganador y las fichas de cada uno
