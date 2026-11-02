## ADDED Requirements

### Requirement: Schafkopf en la suite
El menú MUST incluir el Schafkopf junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4 y a 12 manos. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Schafkopf
- **WHEN** el jugador elige el Schafkopf en el menú y empieza
- **THEN** se abre su mesa con su mano de 8 cartas y, cuando le toca, los botones para anunciar el contrato

### Requirement: Mesa del Schafkopf
La mesa del Schafkopf MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- en la ronda de contratos, lo que ha anunciado cada uno y, cuando le toca, los botones de pasar, de cada As que puede llamar, del Wenz y de cada palo del Solo, solo los que puede anunciar;
- durante las bazas, el contrato, quién juega, el triunfo, el As llamado y el compañero cuando se descubre;
- la baza en curso, y las bazas y los puntos de cartas de cada jugador;
- las fichas de cada jugador y el número de mano de las 12.

Al acabar cada mano, la mesa MUST mostrar un resumen con el contrato, los puntos de cada lado, si hubo Schneider, Schwarz o Laufende, la tarifa y las fichas que gana o pierde cada jugador, con su total. Si todos pasaron, el resumen MUST decirlo.

#### Scenario: Anunciar un Rufspiel
- **WHEN** al jugador le toca anunciar y puede llamar al As de picas
- **THEN** el botón del As de picas está activo y, al tocarlo, la mesa muestra que juega un Rufspiel con el As de picas

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano de Solo que gana el que juega con 70 puntos y sin Laufende
- **THEN** el resumen muestra 70 a 50, una tarifa de 50, que el que juega gana 150 fichas y que cada uno de los otros pierde 50

#### Scenario: Fin de la partida
- **WHEN** termina la duodécima mano
- **THEN** sale la pantalla de fin con el ganador y las fichas de cada jugador
