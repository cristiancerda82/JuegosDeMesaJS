# juego-picas Specification

## Purpose
TBD - created by archiving change juego-picas. Update Purpose after archive.

## Requirements

### Requirement: Reparto de Picas
Picas MUST jugarse con una baraja francesa de 52 cartas y 4 jugadores en dos parejas: los asientos 0 y 2 contra los asientos 1 y 3. En cada mano se MUST repartir las 52 cartas, 13 a cada jugador. En la primera mano reparte el asiento 3, y el reparto pasa al siguiente en cada mano.

#### Scenario: Primera mano
- **WHEN** empieza una partida de Picas
- **THEN** cada jugador tiene 13 cartas y le toca apostar al asiento 0

### Requirement: Apuesta en Picas
Antes de jugar, empezando por el jugador a la izquierda del que reparte y siguiendo el turno, cada jugador MUST apostar una vez cuántas bazas hará: de 1 a 13, o Nil (ninguna). Las apuestas MUST ser públicas. El contrato de cada pareja es la suma de las apuestas de sus dos jugadores, sin contar los Nil. Cuando han apostado los cuatro, empiezan las bazas.

#### Scenario: Apostar
- **WHEN** los asientos 0, 1, 2 y 3 apuestan 4, Nil, 3 y 5
- **THEN** el contrato de la pareja 0–2 es 7, el de la pareja 1–3 es 5, y el asiento 1 juega a Nil

### Requirement: Bazas en Picas
Sale a la primera baza el jugador a la izquierda del que reparte; a las siguientes, quien ganó la anterior. Cada jugador MUST seguir el palo de salida si tiene cartas de ese palo; si no tiene, puede echar cualquier carta. Las picas son siempre triunfo. Gana la baza la pica más alta jugada o, si no hay ninguna, la carta más alta del palo de salida. El orden de las cartas de mayor a menor es As, K, Q, J, 10… 2.

No se MUST poder salir de picas hasta que las picas estén rotas, es decir, hasta que alguien haya echado una pica en una baza que no salió de picas, salvo que el jugador que sale solo tenga picas.

#### Scenario: Seguir el palo
- **WHEN** sale el 5 de corazones y el jugador tiene corazones
- **THEN** solo puede jugar corazones

#### Scenario: Fallar con pica
- **WHEN** sale el As de corazones, el siguiente no tiene corazones y juega el 2 de picas, y nadie más juega picas
- **THEN** la baza es para el 2 de picas y las picas quedan rotas

#### Scenario: Picas sin romper
- **WHEN** las picas no están rotas y el jugador que sale tiene picas y otras cartas
- **THEN** no puede salir de picas

#### Scenario: Solo picas
- **WHEN** las picas no están rotas y el jugador que sale solo tiene picas
- **THEN** puede salir de picas

### Requirement: Puntos de la mano en Picas
Al terminar las 13 bazas, cada pareja MUST sumar o restar puntos así:
- **Contrato:** si las bazas de la pareja (sin contar las del jugador que dijo Nil) llegan al contrato, suma 10 por cada baza del contrato y 1 por cada baza de más, que son sacos. Si no llegan, resta 10 por cada baza del contrato. Con contrato 0 (los dos dijeron Nil) no suma ni resta nada por el contrato.
- **Nil:** cada jugador que dijo Nil y no hizo ninguna baza suma 100 a su pareja; si hizo alguna, resta 100. Las bazas del jugador que dijo Nil MUST contar como sacos de su pareja.
- **Sacos:** cada pareja MUST llevar la cuenta de sus sacos de toda la partida. Al llegar a 10, pierde 100 puntos y se le descuentan 10 sacos.

El resultado de la mano (apuestas, bazas, puntos de cada pareja, sacos y totales) MUST quedar a la vista de todos. Si la partida no ha terminado, se reparte la siguiente mano.

#### Scenario: Cumplir con sacos
- **WHEN** la pareja 0–2 tiene contrato 7 y hace 9 bazas
- **THEN** suma 72 puntos y 2 sacos

#### Scenario: No cumplir
- **WHEN** la pareja 1–3 tiene contrato 5 y hace 4 bazas
- **THEN** resta 50 puntos

#### Scenario: Nil cumplido y fallado
- **WHEN** el asiento 1 dijo Nil y no hizo ninguna baza, y el asiento 0 dijo Nil e hizo una
- **THEN** la pareja 1–3 suma 100 por el Nil y la pareja 0–2 resta 100, y esa baza del asiento 0 es un saco de su pareja

#### Scenario: Diez sacos
- **WHEN** una pareja con 8 sacos acumulados cumple su contrato con 3 bazas de más
- **THEN** suma el contrato y 3 puntos, pierde 100 por llegar a 10 sacos y se queda con 1 saco

### Requirement: Partida de Picas
La partida MUST terminar al acabar la mano en la que alguna pareja llega a 500 puntos o más. Gana la pareja con más puntos; si las dos tienen los mismos, se MUST jugar otra mano. El resultado MUST registrar los puntos de cada jugador (los de su pareja).

#### Scenario: Llegar a 500
- **WHEN** al acabar una mano la pareja 0–2 tiene 510 puntos y la pareja 1–3 tiene 480
- **THEN** la partida termina y ganan los asientos 0 y 2

#### Scenario: Las dos pasan de 500
- **WHEN** al acabar una mano la pareja 0–2 tiene 505 y la pareja 1–3 tiene 530
- **THEN** ganan los asientos 1 y 3

### Requirement: Vista del jugador en Picas
Cada jugador MUST ver:
- su mano;
- cuántas cartas tienen los demás;
- la fase (apuesta o bazas) y de quién es el turno;
- la apuesta de cada jugador y el contrato de cada pareja;
- la baza en curso, la última baza terminada y las bazas que lleva cada jugador en la mano;
- todas las cartas jugadas en las bazas de la mano, y si las picas están rotas;
- los resultados de las manos terminadas, los puntos y los sacos de cada pareja.

Las manos de los demás MUST quedar ocultas.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista durante las bazas
- **THEN** ve su mano, las apuestas y las cartas jugadas, pero no las cartas que les quedan a los demás
