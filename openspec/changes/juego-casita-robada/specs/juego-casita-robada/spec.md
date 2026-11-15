## ADDED Requirements

### Requirement: Baraja y reparto de la Casita robada
La Casita robada MUST jugarse de 2 a 4 jugadores (2 por defecto), cada uno por su cuenta, con la baraja española de 40 cartas.

Al empezar, MUST ponerse 4 cartas boca arriba en la mesa y repartirse 3 a cada jugador. Cuando todos se han quedado sin cartas y queda mazo, MUST repartirse otras 3 a cada uno. Empieza el asiento 0, y el turno pasa al siguiente tras cada jugada, también entre repartos.

#### Scenario: Empezar
- **WHEN** empieza una partida de 3 jugadores
- **THEN** hay 4 cartas en la mesa, cada jugador tiene 3, quedan 27 en el mazo y le toca al asiento 0

#### Scenario: Nuevo reparto
- **WHEN** el último jugador juega su última carta y queda mazo
- **THEN** cada jugador recibe 3 cartas nuevas

### Requirement: Jugar, capturar y robar en la Casita robada
En su turno, el jugador MUST jugar una carta de su mano:
- se lleva todas las cartas de la mesa del mismo número que la suya;
- además, MAY robar la casita entera de un rival cuya carta de arriba sea del mismo número (solo de uno);
- todo lo que se lleva MUST ir a su casita, con la carta jugada arriba;
- si no se lleva nada, su carta MUST quedarse en la mesa.

La casita de cada jugador MUST verse con su carta de arriba y cuántas cartas tiene.

#### Scenario: Llevarse las de la mesa
- **WHEN** en la mesa hay un 5 de oros, un 5 de copas y un 7, y el jugador juega el 5 de espadas
- **THEN** se lleva los dos cincos, y su casita tiene esas 3 cartas con el 5 de espadas arriba

#### Scenario: Robar una casita
- **WHEN** la casita de un rival tiene 6 cartas con un Rey arriba, y el jugador juega otro Rey y elige robarla
- **THEN** su casita gana esas 6 cartas más su Rey, que queda arriba, y la del rival queda vacía

#### Scenario: No robar
- **WHEN** el jugador puede robar una casita y elige no hacerlo
- **THEN** solo se lleva las cartas de la mesa de ese número, o deja su carta en la mesa si no hay ninguna

#### Scenario: Dejar la carta
- **WHEN** ninguna carta de la mesa ni de arriba de las casitas es del número de la carta jugada
- **THEN** la carta se queda en la mesa

### Requirement: Fin de la partida de la Casita robada
La partida MUST terminar cuando se acaban el mazo y las manos. Las cartas que quedan en la mesa MUST ir a la casita del último que se llevó cartas (de la mesa o robando); si nadie se llevó ninguna, se quedan en la mesa. Gana quien tiene más cartas en su casita; si varios empatan arriba, ganan todos ellos, y si empatan todos, es empate.

#### Scenario: Las de la mesa, para el último
- **WHEN** se juega la última carta y el último que se llevó cartas fue el asiento 1
- **THEN** las cartas de la mesa van a la casita del asiento 1 y la partida termina

#### Scenario: Gana quien más cartas tiene
- **WHEN** al terminar las casitas tienen 22 y 18 cartas
- **THEN** gana el de 22

### Requirement: Vista del jugador de la Casita robada
La vista de cada jugador MUST mostrar:
- su mano;
- las cartas de la mesa;
- la casita de cada uno, entera, porque todas sus cartas se han visto;
- cuántas cartas tienen los demás en la mano y cuántas quedan en el mazo;
- a quién le toca;
- la última jugada (quién, qué carta, qué se llevó y a quién robó).

MUST NOT mostrar las manos ajenas ni el orden del mazo.

#### Scenario: Manos ocultas
- **WHEN** un jugador mira la mesa
- **THEN** ve su mano y cuántas cartas tiene cada uno de los demás, pero no cuáles
