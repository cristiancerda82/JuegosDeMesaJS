# juego-truco Specification

## Purpose
TBD - created by archiving change juego-truco. Update Purpose after archive.

## Requirements

### Requirement: Baraja, jugadores, reparto y bazas del Truco
El Truco MUST jugarse con la baraja española de 40 cartas, con 2 jugadores o con 4 en parejas (los asientos 0 y 2 contra los 1 y 3). En cada mano MUST repartirse 3 cartas a cada jugador. El reparto pasa al siguiente jugador en cada mano y es **mano** el siguiente al repartidor, que sale en la primera baza; la primera mano la reparte el último asiento.

La jerarquía de las cartas, la falta de palo obligatorio, las bazas pardas y el ganador de la mano MUST ser los del Truc (spec juego-truc): de mayor a menor, As de espadas, As de bastos, 7 de espadas, 7 de oros, treses, doses, Ases de copas y de oros, reyes, caballos, sotas, 7 de copas y de bastos, seises, cincos y cuatros; gana la mano el bando que gana dos bazas, con las mismas reglas para las pardas.

#### Scenario: Reparto
- **WHEN** empieza una partida de 2 jugadores
- **THEN** cada jugador tiene 3 cartas distintas, reparte el asiento 1 y le toca al asiento 0

#### Scenario: El As de espadas gana a todo
- **WHEN** en una baza se juegan el As de espadas y el As de bastos
- **THEN** gana el As de espadas

#### Scenario: Parda en la primera
- **WHEN** la primera baza es parda y el rival gana la segunda
- **THEN** el rival gana la mano

### Requirement: Envido
Los puntos de envido de un jugador MUST contarse como el envit del Truc: con dos o tres cartas del mismo palo, 20 más los valores de las dos más altas de ese palo; si no, el valor de la más alta; las figuras valen 0.

Un jugador MUST poder cantar en su turno durante la primera baza, mientras no haya jugado su carta, si en la mano todavía no se ha cantado envido y no se ha aceptado ningún truco. Puede cantar:
- **envido**, que vale 2;
- **real envido**, que vale 3;
- **falta envido**, que vale lo que le falta para llegar a 30 al bando que va ganando la partida (con empate, a cualquiera de los dos).

Responde el primer rival en orden de juego tras quien cantó, que puede decir **quiero**, **no quiero** o subir. Las subidas MUST seguir este orden: el envido se puede cantar como mucho dos veces seguidas, el real envido una vez después de los envidos, y la falta envido al final. Subir acepta lo anterior, y después responde el otro bando.

- **Querido:** vale la suma de lo cantado (la falta envido sustituye a todo lo anterior). Se comparan los puntos del mejor jugador de cada bando; gana el más alto y, con empate, el más cercano a la mano en orden de juego. Esos puntos se muestran a todos.
- **No querido:** el bando que cantó lo último cobra lo querido antes de esa última subida o, si no había nada querido, 1.

Después sigue jugando quien tenía el turno.

#### Scenario: Envido querido
- **WHEN** se canta envido, el rival quiere y gana el envido
- **THEN** su bando cobra 2 puntos

#### Scenario: Envido, envido y real envido no querido
- **WHEN** se canta envido, el rival canta envido, el primero canta real envido y el rival no quiere
- **THEN** el bando que cantó el real envido cobra 4 puntos

#### Scenario: Real envido no querido
- **WHEN** se canta real envido sin nada antes y el rival no quiere
- **THEN** el bando que lo cantó cobra 1 punto

#### Scenario: Falta envido
- **WHEN** un bando va ganando 22 a 10, se canta falta envido y se quiere
- **THEN** el bando que gana el envido cobra 8 puntos

#### Scenario: Sin envido tras aceptar el truco
- **WHEN** en la primera baza se ha aceptado un truco
- **THEN** nadie puede cantar envido

### Requirement: Truco
Un jugador MUST poder cantar **truco** en su turno, antes de jugar su carta. Con el truco aceptado, la mano vale 2; sin truco, 1. Responde el primer rival en orden de juego tras quien cantó, que puede decir:
- **quiero**;
- **no quiero**: el bando que cantó gana la mano y cobra el valor anterior;
- subir: **retruco** (3) o **vale cuatro** (4). Subir acepta lo anterior.

Tras aceptar una apuesta, solo el bando que la aceptó MUST poder subirla, en su turno. Quien no quiere una subida da al que la hizo el valor anterior: 2 al retruco y 3 al vale cuatro.

**El envido está primero:** si se canta truco durante la primera baza y todavía se puede cantar envido, el que responde MAY cantar envido, real envido o falta envido en lugar de responder al truco. Primero se resuelve el envido y después responde al truco.

#### Scenario: Truco querido
- **WHEN** un jugador canta truco, el rival quiere y luego gana la mano el bando que cantó
- **THEN** ese bando cobra 2 puntos

#### Scenario: Retruco no querido
- **WHEN** un jugador canta truco, el rival responde retruco y el primero no quiere
- **THEN** el bando que cantó el retruco gana la mano y cobra 2 puntos

#### Scenario: El envido está primero
- **WHEN** en la primera baza un jugador canta truco y el rival, que aún no ha jugado su carta, canta envido
- **THEN** primero se responde al envido y después el rival responde al truco

### Requirement: Irse al mazo
En su turno, y también cuando le toca responder a una apuesta, un jugador MUST poder irse al mazo. El bando rival gana la mano y cobra lo que valga en ese momento: el valor anterior del truco pendiente si lo hay; si no, el truco aceptado; si no, 1. Si había un envido pendiente, cuenta como no querido; el envido ya resuelto se cobra igualmente.

#### Scenario: Irse al mazo sin apuestas
- **WHEN** un jugador se va al mazo sin que nadie haya cantado truco
- **THEN** el bando rival cobra 1 punto

### Requirement: Puntuación y partida del Truco
Al terminar la mano MUST sumarse primero el envido al bando que lo ganó y, si con eso ningún bando llega a 30, el truco al ganador de la mano. La partida MUST terminar en cuanto un bando llega a 30 puntos, y gana ese bando. Los 15 primeros puntos son las **malas** y los 15 siguientes, las **buenas**.

El resultado de cada mano MUST registrar el envido (lo cantado, si se quiso, los puntos de cada bando y el ganador), el truco (lo aceptado y el ganador de la mano, o quién se fue al mazo) y los puntos de cada bando en la mano y tras ella.

#### Scenario: Ganar con el envido
- **WHEN** un bando con 28 puntos gana un envido de 2 y pierde la mano con truco
- **THEN** llega a 30, gana la partida y el truco no se suma

#### Scenario: Fin de la partida
- **WHEN** un bando con 29 puntos gana una mano sin truco
- **THEN** llega a 30 y gana la partida

### Requirement: Vista del jugador del Truco
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- el repartidor, quién es mano y a quién le toca;
- la baza en curso y las bazas jugadas con quién jugó cada carta y su ganador o si fue parda;
- el estado del envido y del truco: lo cantado, lo pendiente, quién puede subir y, si se quiso el envido, los puntos de cada bando y el ganador;
- los puntos de cada bando y los resultados de las manos anteriores.

MUST NOT mostrar las cartas en mano de los demás.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás
