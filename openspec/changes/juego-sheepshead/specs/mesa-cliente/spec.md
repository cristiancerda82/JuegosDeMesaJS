## ADDED Requirements

### Requirement: Sheepshead en la suite
El menú MUST incluir el Sheepshead junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. La partida es siempre a 10 manos. Como el resto de juegos con IA, MUST poder jugarse en red con 5 jugadores.

#### Scenario: Empezar una partida de Sheepshead
- **WHEN** el jugador elige el Sheepshead y empieza
- **THEN** se abre su mesa con su mano de 6 cartas, el blind boca abajo y los otros cuatro jugadores

### Requirement: Mesa del Sheepshead
La mesa del Sheepshead MUST mostrar:
- la mano del jugador y las de los cuatro rivales boca abajo;
- el blind;
- quién ha pasado, el picker y, cuando se descubre, el compañero (o que el picker juega solo);
- si es leaster;
- la baza en curso, las bazas y los puntos de cartas de cada uno;
- el marcador de la partida y la mano en curso de las 10.

Cuando le toca, el jugador MUST tener:
- al coger, los botones «Coger» y «Pasar»;
- como picker, para enterrar: tocar cada carta que entierra.

Al acabar cada mano, la mesa MUST mostrar un resumen con:
- el picker, su compañero y los puntos de su bando, o el ganador del leaster;
- lo que anota cada uno y el marcador.

#### Scenario: Coger y enterrar
- **WHEN** el jugador toca «Coger» y luego dos cartas
- **THEN** le quedan 6 cartas y empieza la primera baza

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra el resultado y lo que anota cada uno

#### Scenario: Fin de la partida
- **WHEN** acaba la décima mano
- **THEN** sale la pantalla de fin con el ganador y el marcador de cada uno
