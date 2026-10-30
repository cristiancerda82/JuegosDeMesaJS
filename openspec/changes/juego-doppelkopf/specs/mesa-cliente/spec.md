## ADDED Requirements

### Requirement: Doppelkopf en la suite
El menú MUST incluir el Doppelkopf junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Doppelkopf
- **WHEN** el jugador elige el Doppelkopf en el menú y empieza
- **THEN** se abre su mesa con su mano de 12 cartas y los tres rivales

### Requirement: Mesa del Doppelkopf
La mesa del Doppelkopf MUST mostrar:
- la mano del jugador y su bando;
- los tres rivales, con cuántas cartas tienen, su bando cuando se sepa y sus anuncios;
- el tipo de juego (normal, boda o el solo), la baza en curso, el número de mano de la ronda y el marcador.

Antes de la primera baza, la mesa MUST ofrecer un botón por cada reserva posible («Sano», «Boda», «Solo de Damas»…). Durante las bazas, cuando el jugador puede anunciar, MUST ofrecer el botón del siguiente anuncio de su bando («Re», «Contra», «No 90»…). Al acabar cada mano, la mesa MUST mostrar un resumen con los bandos, los puntos de cartas de cada bando, los conceptos que se suman y lo que gana o pierde cada jugador.

#### Scenario: Pedir un solo
- **WHEN** el jugador toca «Solo de Jotas» en las reservas y nadie antes pidió un solo
- **THEN** la mesa indica que juega un solo de Jotas contra los otros tres

#### Scenario: Anunciar
- **WHEN** el jugador del bando Re toca «Re» en su primer turno
- **THEN** su anuncio aparece en la mesa para todos

#### Scenario: Fin de la partida
- **WHEN** acaba la octava mano
- **THEN** sale la pantalla de fin con el ganador y los puntos de cada jugador
