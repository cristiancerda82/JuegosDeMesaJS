## ADDED Requirements

### Requirement: Reparto del Ocho loco
El Ocho loco MUST jugarse con una baraja francesa de 52 cartas y de 2 a 5 jugadores (4 por defecto), cada uno por su cuenta. En cada mano se MUST repartir 7 cartas a cada jugador con 2 jugadores y 5 con 3 o más. Después se pone boca arriba la primera carta del mazo para empezar el descarte; si es un 8, se mete al fondo del mazo y se descubre la siguiente, hasta que no sea un 8. El palo que toca es el de esa carta. Empieza el jugador a la izquierda del que reparte, y el reparto pasa al siguiente en cada mano.

#### Scenario: Reparto con 2 jugadores
- **WHEN** empieza una partida de 2 jugadores
- **THEN** cada uno tiene 7 cartas, hay una carta en el descarte y 37 en el mazo

#### Scenario: Reparto con 4 jugadores
- **WHEN** empieza una partida de 4 jugadores
- **THEN** cada uno tiene 5 cartas, hay una carta en el descarte que no es un 8 y 31 en el mazo

### Requirement: Jugar una carta
En su turno, el jugador MUST poder jugar una carta de su mano que sea del palo que toca o del mismo número que la carta de arriba del descarte. Un 8 MUST poder jugarse siempre, encima de cualquier carta, y quien lo juega elige el palo que toca después; el siguiente jugador tiene que seguir ese palo u otro 8. La carta jugada queda arriba del descarte y le toca al siguiente jugador.

#### Scenario: Por palo
- **WHEN** arriba del descarte está el 9 de corazones y el jugador juega el 3 de corazones
- **THEN** el 3 de corazones queda arriba, toca corazones y juega el siguiente

#### Scenario: Por número
- **WHEN** arriba del descarte está el 9 de corazones y el jugador juega el 9 de picas
- **THEN** el 9 de picas queda arriba y toca picas

#### Scenario: El 8 elige palo
- **WHEN** arriba del descarte está el 9 de corazones y el jugador juega el 8 de tréboles eligiendo diamantes
- **THEN** toca diamantes, y el siguiente solo puede jugar un diamante u otro 8

#### Scenario: Una carta que no casa
- **WHEN** arriba del descarte está el 9 de corazones y el jugador intenta jugar el 5 de picas
- **THEN** no es una acción legal

### Requirement: Robar y pasar
Si el jugador no tiene ninguna carta que pueda jugar, MUST robar una carta del mazo; no puede robar si tiene alguna jugable. Si la carta robada se puede jugar, MAY jugarla (eligiendo palo si es un 8) o pasar; si no, pasa. No puede jugar ninguna otra carta de su mano en ese turno.

Cuando hay que robar y el mazo está vacío, se MUST barajar el descarte, menos la carta de arriba, para formar un mazo nuevo. Si tampoco así queda ninguna carta, el jugador pasa sin robar.

#### Scenario: Robar y jugar
- **WHEN** el jugador no tiene ninguna carta jugable, roba y la carta robada casa con el descarte
- **THEN** puede jugarla o pasar, y no puede jugar ninguna otra carta

#### Scenario: Robar teniendo jugables
- **WHEN** el jugador tiene alguna carta jugable
- **THEN** robar no es una acción legal

#### Scenario: Rehacer el mazo
- **WHEN** el mazo está vacío, el descarte tiene 10 cartas y al jugador le toca robar
- **THEN** las 9 de debajo se barajan como mazo nuevo, el jugador roba una y la de arriba sigue en el descarte

### Requirement: Fin de la mano y puntos
La mano MUST terminar en cuanto un jugador juega su última carta. Ese jugador se apunta los puntos de las cartas que les quedan a los demás: el 8 vale 50, cada figura (J, Q, K) 10, el As 1 y el resto su número.

Si no queda ninguna carta para robar y todos los jugadores pasan seguidos, la mano MUST terminar bloqueada. Gana la mano quien tenga menos puntos en la suya, y se apunta los puntos de las cartas de los demás. Si varios empatan con menos puntos, nadie se apunta nada.

Al terminar una mano, el resultado de la mano (quién la gana, los puntos de lo que le quedó a cada uno y los totales) MUST quedar a la vista de todos, y si la partida no ha terminado se reparte la siguiente.

#### Scenario: Quedarse sin cartas
- **WHEN** el asiento 2 juega su última carta y a los demás les quedan un 8, un rey y un 4
- **THEN** la mano termina y el asiento 2 se apunta 64 puntos

#### Scenario: Mano bloqueada
- **WHEN** no quedan cartas para robar, todos pasan seguidos y sus manos valen 12, 30 y 7 puntos
- **THEN** la mano termina y el que tiene 7 se apunta 42 puntos

### Requirement: Partida del Ocho loco
La partida MUST terminar al acabar la primera mano tras la que algún jugador tenga 100 puntos o más; ese jugador gana y los demás pierden. El resultado MUST registrar los puntos de cada uno.

#### Scenario: Llegar a 100
- **WHEN** un jugador con 80 puntos gana una mano de 25 puntos
- **THEN** la partida termina con 105 puntos para él, y gana

### Requirement: Vista del jugador en el Ocho loco
Cada jugador MUST ver:
- su mano;
- cuántas cartas tienen los demás y cuántas quedan en el mazo;
- todo el descarte, con la carta de arriba y el palo que toca;
- de quién es el turno, y si ya ha robado en este turno;
- cuántos jugadores han pasado seguidos sin poder robar;
- de la última vez que robó cada jugador en esta mano, qué palo tocaba y qué número tenía la carta de arriba, porque entonces no tenía ninguna carta que casara;
- la última acción de cada jugador: qué carta jugó y qué palo eligió con un 8, o que robó o pasó (sin la carta robada);
- los resultados de las manos terminadas y los puntos de cada uno.

La carta robada por otro jugador y las cartas del mazo MUST quedar ocultas.

#### Scenario: La carta robada no se ve
- **WHEN** un rival roba una carta y pasa
- **THEN** el jugador ve que el rival robó y pasó, y que tiene una carta más, pero no cuál
