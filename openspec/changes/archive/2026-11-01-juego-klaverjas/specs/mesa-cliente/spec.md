## ADDED Requirements

### Requirement: Klaverjas en la suite
El menú MUST incluir el Klaverjas junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4 en parejas a 8 manos. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Klaverjas
- **WHEN** el jugador elige el Klaverjas en el menú y empieza
- **THEN** se abre su mesa con su mano de 8 cartas, su compañero enfrente y el palo propuesto

### Requirement: Mesa del Klaverjas
La mesa del Klaverjas MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- el palo propuesto y, cuando le toca, los botones de jugar y pasar; si pasan todos, un botón por cada palo;
- el triunfo y la pareja que juega;
- el roem de la última baza cuando lo hay;
- la baza en curso;
- los puntos de cada pareja en la mano y en la partida, y la mano que se juega de las 8.

Al acabar cada mano, la mesa MUST mostrar un resumen con los puntos de cartas y el roem de cada pareja, lo que anota cada una y si hubo nat o pit.

#### Scenario: Jugar con el palo propuesto
- **WHEN** al jugador le toca decir y toca jugar
- **THEN** la mesa muestra el triunfo y que juega su pareja

#### Scenario: Resumen con nat
- **WHEN** acaba una mano en la que la pareja que juega no hace más que la otra
- **THEN** el resumen muestra el nat y que la otra pareja anota los 162 y todo el roem

#### Scenario: Fin de la partida
- **WHEN** acaba la octava mano
- **THEN** sale la pantalla de fin con la pareja ganadora y los puntos de cada una
