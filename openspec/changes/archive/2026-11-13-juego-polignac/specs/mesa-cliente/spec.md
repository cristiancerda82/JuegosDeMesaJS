## ADDED Requirements

### Requirement: Polignac en la suite
El menú MUST incluir el Polignac junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- el nivel de la IA y el modo asistido;
- el número de jugadores (de 3 a 6);
- el límite (−10, −20 o −30);
- si se juega con el general.

Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Polignac
- **WHEN** el jugador elige el Polignac con 6 jugadores y empieza
- **THEN** se abre su mesa con su mano de 5 cartas y los cinco rivales

### Requirement: Mesa del Polignac
La mesa del Polignac MUST mostrar:
- la mano del jugador y las de los rivales boca abajo;
- quién reparte y quién juega el general, si lo hay;
- la mano en curso;
- la baza en curso;
- los puntos de la mano de cada uno y el marcador.

Cuando le toca decidir el general, el jugador MUST ver los botones «Anunciar general» y «Pasar».

Al acabar cada mano, la mesa MUST mostrar un resumen con:
- el general y si se cumplió, si lo hubo;
- lo que anota cada uno;
- el marcador.

#### Scenario: Pasar el general
- **WHEN** al jugador le toca decidir el general y toca «Pasar»
- **THEN** decide el siguiente o, si era el último, empieza la primera baza

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra lo que anota cada uno y el marcador

#### Scenario: Fin de la partida
- **WHEN** alguien llega al límite
- **THEN** sale la pantalla de fin con el ganador y los puntos de cada uno
