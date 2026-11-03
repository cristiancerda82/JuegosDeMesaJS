## ADDED Requirements

### Requirement: Truco en la suite
El menú MUST incluir el Truco junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir 2 jugadores o 4 en parejas (por defecto, 2) y el nivel de la IA; la partida es siempre a 30. Como el resto de juegos con IA, el Truco MUST poder jugarse en red.

#### Scenario: Empezar una partida de Truco
- **WHEN** el jugador elige el Truco en el menú y empieza con las opciones por defecto
- **THEN** se abre la mesa del Truco con 3 cartas en su mano y un rival de la IA

### Requirement: Mesa del Truco
La mesa del Truco MUST reutilizar la mesa de bazas.
- **Botones en su turno:** cuando puede, el jugador ve «Envido», «Real envido», «Falta envido», el truco que toque («Truco», «Retruco» o «Vale cuatro») y «Me voy al mazo».
- **Botones al responder:** ante una apuesta, ve «Quiero», «No quiero», las subidas que toquen y, si el envido está primero, los cantos del envido.
- **Información:** muestra lo que vale la mano, el envido cantado o pendiente, y los puntos de cada bando en malas y buenas.
- **Avisos:** avisa de lo que cantan los demás jugadores y, al quererse un envido, de los puntos de cada bando.

Al terminar cada mano, la mesa MUST mostrar el envido, el truco y los puntos de cada bando, y esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar los puntos de los dos bandos.

#### Scenario: Responder a un truco
- **WHEN** el rival canta truco
- **THEN** el jugador ve «Quiero», «No quiero», «Retruco» y «Me voy al mazo» y, al pulsar «Quiero», la mano pasa a valer 2

#### Scenario: Malas y buenas
- **WHEN** un bando tiene 18 puntos
- **THEN** la mesa muestra que tiene 3 buenas
