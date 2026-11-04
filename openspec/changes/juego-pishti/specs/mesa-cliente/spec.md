## ADDED Requirements

### Requirement: Pishti en la suite
El menú MUST incluir el Pishti junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y 2 jugadores o 4 en parejas; la partida es siempre a 151. Como el resto de juegos con IA, MUST poder jugarse en red, y con 4 la sala de espera MUST mostrar las parejas.

#### Scenario: Empezar una partida de Pishti
- **WHEN** el jugador elige el Pishti con 2 jugadores y empieza
- **THEN** se abre su mesa con su mano de 4 cartas y el montón con 3 tapadas y una a la vista

#### Scenario: Pishti por parejas
- **WHEN** el jugador elige 4 jugadores y empieza
- **THEN** se abre su mesa con su mano de 4 cartas y su compañero enfrente

### Requirement: Mesa del Pishti
La mesa del Pishti MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- el montón, con sus tapadas, la carta de arriba bien visible y las de debajo que se ven, y el mazo;
- las cartas recogidas y los pishtis de cada bando, y los puntos de la partida;
- la última jugada, con lo que se llevó y si fue pishti.

Cada carta se juega de una sola forma: al tocar una carta y el montón (o con la carta obvia), se juega directamente.

Al acabar cada mano, la mesa MUST mostrar un resumen con las cartas, los Ases y J, el 2 de tréboles, el 10 de diamantes y los pishtis de cada bando, y lo que anota cada uno.

#### Scenario: Llevarse el montón
- **WHEN** el jugador echa una carta del número de la de arriba
- **THEN** el montón se vacía y crecen sus cartas recogidas

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra las cartas y los puntos de cada concepto de cada bando

#### Scenario: Fin de la partida
- **WHEN** un bando llega a 151 con más puntos que el otro
- **THEN** sale la pantalla de fin con el bando ganador y los puntos de cada uno
