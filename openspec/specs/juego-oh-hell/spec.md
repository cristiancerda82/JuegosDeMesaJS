# juego-oh-hell Specification

## Purpose
TBD - created by archiving change juego-oh-hell. Update Purpose after archive.

## Requirements

### Requirement: Baraja, jugadores y secuencia de manos del Oh Hell
El Oh Hell MUST jugarse con 3 a 7 jugadores, cada uno por su cuenta, y la baraja francesa de 52 cartas. En cada palo el orden MUST ser A, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3 y 2. El máximo de cartas por mano MUST ser el mayor número que deja al menos una carta tras repartir a todos (17, 12, 10, 8 y 7 cartas con 3, 4, 5, 6 y 7 jugadores). La partida MUST jugar las manos en este orden: del máximo bajando de una en una hasta 1, y después de 2 subiendo hasta el máximo. El repartidor MUST rotar cada mano.

#### Scenario: Secuencia con 4 jugadores
- **WHEN** se juega con 4 jugadores
- **THEN** las manos reparten 12, 11… 2, 1, 2… 11 y 12 cartas: 23 manos

#### Scenario: Primera mano
- **WHEN** empieza la partida con 5 jugadores
- **THEN** cada uno recibe 10 cartas

### Requirement: Triunfo del Oh Hell
Tras repartir, la siguiente carta del mazo MUST ponerse boca arriba, y su palo MUST ser el triunfo de la mano. El resto del mazo queda oculto y no se juega.

#### Scenario: Carta del triunfo
- **WHEN** se reparte una mano
- **THEN** hay una carta boca arriba a la vista de todos y su palo es el triunfo

### Requirement: Apuestas del Oh Hell
Antes de jugar, cada jugador MUST apostar cuántas bazas hará, de 0 a las cartas de la mano, empezando por el de la izquierda del repartidor y terminando por el repartidor. El repartidor MUST NOT apostar el número que haría que la suma de todas las apuestas fuera igual a las cartas de la mano.

#### Scenario: Apuesta prohibida al repartidor
- **WHEN** en una mano de 5 cartas los demás han apostado 1, 2 y 0
- **THEN** el repartidor puede apostar cualquier número de 0 a 5 menos el 2

### Requirement: Bazas del Oh Hell
La primera baza la MUST abrir el jugador a la izquierda del repartidor, y cada baza siguiente, quien ganó la anterior. Cada jugador MUST seguir el palo de salida si puede; si no, MAY jugar cualquier carta, sin obligación de fallar. La baza la gana el triunfo más alto o, si no hay ninguno, la carta más alta del palo de salida.

#### Scenario: Sin obligación de fallar
- **WHEN** se sale de picas y el jugador no tiene picas pero sí triunfos
- **THEN** puede jugar cualquier carta de su mano

### Requirement: Puntos y partida del Oh Hell
Al terminar las bazas de una mano, quien hizo exactamente las bazas que apostó MUST sumar 10 más su apuesta; los demás no suman nada. La partida MUST terminar tras la última mano de la secuencia, y la ganan quienes tengan más puntos.

#### Scenario: Acertar la apuesta
- **WHEN** un jugador apostó 3 e hizo 3 bazas
- **THEN** suma 13 puntos

#### Scenario: Fallar la apuesta
- **WHEN** un jugador apostó 0 e hizo 1 baza
- **THEN** no suma nada

### Requirement: Vista del jugador en el Oh Hell
Cada jugador MUST ver:
- su mano y cuántas cartas tienen los demás;
- la carta del triunfo;
- las apuestas hechas y, para el repartidor, la apuesta que no puede hacer;
- la baza en curso, la última baza, las cartas que jugó cada uno en la mano y las bazas de cada uno;
- los puntos y el resultado de las manos anteriores.

Las manos ajenas y el resto del mazo MUST quedar ocultos.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de las manos de los demás ni del mazo
