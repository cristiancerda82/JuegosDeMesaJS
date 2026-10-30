## ADDED Requirements

### Requirement: Tarot en la suite
El menú MUST incluir el Tarot junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (3, 4 o 5, por defecto 4) y el nivel de la IA. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Tarot
- **WHEN** el jugador elige el Tarot con 4 jugadores y empieza
- **THEN** se abre su mesa con su mano de 18 cartas y los tres rivales

### Requirement: Cartas del Tarot
El cliente MUST dibujar todas las cartas de la baraja de Tarot: los triunfos con su número bien grande, la Excusa con un dibujo propio y el Caballo de cada palo francés con la figura del caballo. Cada carta MUST tener un nombre accesible («Triunfo 21», «Excusa», «Caballo de picas»).

#### Scenario: Triunfo
- **WHEN** la mano tiene el 21 de triunfo
- **THEN** se ve una carta de triunfo con el número 21 y su nombre accesible es «Triunfo 21»

### Requirement: Mesa del Tarot
La mesa del Tarot MUST mostrar:
- la mano del jugador;
- los rivales, con cuántas cartas tienen, lo que dijeron en la subasta, el preneur y, con 5, la pareja cuando se sepa;
- el contrato, la carta llamada, la baza en curso, el número de mano de la ronda y el marcador.

La mesa MUST ofrecer:
- en la subasta, un botón por cada contrato posible y otro para pasar;
- con 5 jugadores y si el jugador es el preneur, un botón por cada carta que puede llamar;
- mientras el perro se enseña, sus cartas a la vista;
- al descartar, elegir las cartas de la mano una a una;
- en su primer turno, si puede, un botón para enseñar la *poignée*.

Al acabar cada mano, la mesa MUST mostrar un resumen con el contrato, los *oudlers* y los puntos del preneur, lo que necesitaba, las primas y lo que gana o pierde cada jugador.

#### Scenario: Pedir un contrato
- **WHEN** en la subasta el jugador toca «Garde»
- **THEN** la mesa indica que el jugador es el preneur de una Garde mientras nadie suba

#### Scenario: Descartar
- **WHEN** el jugador es el preneur de una Petite y se queda el perro
- **THEN** ve las cartas del perro en su mano y elige una a una las que descarta hasta completar el descarte

#### Scenario: Fin de la partida
- **WHEN** acaba la última mano de la ronda
- **THEN** sale la pantalla de fin con el ganador y los puntos de cada jugador
