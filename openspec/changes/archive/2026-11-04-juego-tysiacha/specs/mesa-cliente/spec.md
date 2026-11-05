## ADDED Requirements

### Requirement: Tysiącha en la suite
El menú MUST incluir el Tysiącha junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. La partida es siempre a 1000. Como el resto de juegos con IA, MUST poder jugarse en red con 3 jugadores.

#### Scenario: Empezar una partida de Tysiącha
- **WHEN** el jugador elige el Tysiącha y empieza
- **THEN** se abre su mesa con su mano de 7 cartas, el prikup boca abajo y la subasta

### Requirement: Mesa del Tysiącha
La mesa del Tysiącha MUST mostrar:
- la mano del jugador y las de los dos rivales boca abajo;
- el prikup, boca abajo o enseñado;
- la puja de cada uno, el declarante y el contrato;
- el triunfo actual y los matrimonios cantados;
- la baza en curso y los puntos de cada uno en la mano;
- el marcador de la partida con el barril.

Cuando le toca, el jugador MUST tener:
- en la subasta, un botón con la puja siguiente y otro para pasar;
- como declarante, para dar cartas: tocar la carta que da a cada rival;
- para fijar el contrato: elegirlo entre los que puede.

Al acabar cada mano, la mesa MUST mostrar un resumen con:
- el declarante, el contrato y si lo cumplió;
- los puntos de cartas y matrimonios de cada uno;
- lo que anota cada uno y los marcadores.

#### Scenario: Pujar y ganar la subasta
- **WHEN** el jugador puja hasta que las dos IAs pasan
- **THEN** ve el prikup enseñado y tiene 10 cartas para dar dos

#### Scenario: Dar y fijar el contrato
- **WHEN** el jugador declarante toca una carta para cada rival y fija el contrato
- **THEN** le quedan 8 cartas y empieza la primera baza saliendo él

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra el contrato, si se cumplió y lo que anota cada uno

#### Scenario: Fin de la partida
- **WHEN** un jugador llega a 1000
- **THEN** sale la pantalla de fin con el ganador y el marcador de cada uno
