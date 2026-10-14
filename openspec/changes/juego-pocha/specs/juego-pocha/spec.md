## ADDED Requirements

### Requirement: Secuencia de manos
La partida MUST jugarse con la baraja española de 40 cartas y 3 o 4 jugadores. En cada mano, el número de cartas MUST subir de 1 en 1 hasta un máximo y después volver a bajar hasta 1. Con la duración corta (por defecto), el máximo es 5: 1, 2, 3, 4, 5, 4, 3, 2, 1. Con la duración completa, el máximo es 40 dividido entre los jugadores (10 con 4 y 13 con 3), y la mano del máximo se juega una sola vez. El reparto pasa al siguiente jugador en cada mano, y sale el siguiente al repartidor.

#### Scenario: Partida corta
- **WHEN** se juega una partida corta
- **THEN** se juegan 9 manos de 1, 2, 3, 4, 5, 4, 3, 2 y 1 cartas

#### Scenario: Partida completa con 4
- **WHEN** se juega una partida completa con 4 jugadores
- **THEN** se juegan 19 manos, de 1 a 10 cartas y de vuelta a 1

### Requirement: Triunfo
Después del reparto, la carta siguiente del mazo MUST ponerse boca arriba y su palo es el triunfo. Si se reparte toda la baraja, el triunfo lo MUST marcar la última carta repartida, que es del repartidor y todos ven mientras siga en su mano.

#### Scenario: Triunfo con baraja entera
- **WHEN** en una partida completa con 4 jugadores se reparten 10 cartas a cada uno
- **THEN** el triunfo es el palo de la última carta del repartidor, que es visible para todos

### Requirement: Apuestas
Antes de jugar la primera baza, cada jugador MUST apostar, en orden desde el siguiente al repartidor, cuántas bazas hará: un entero de 0 al número de cartas de la mano. Las apuestas MUST ser visibles para todos. Con la restricción del repartidor activada (por defecto), el repartidor, que apuesta el último, MUST NOT poder elegir la apuesta que hace que la suma de todas sea igual al número de cartas.

#### Scenario: El repartidor no cuadra
- **WHEN** en una mano de 3 cartas con 4 jugadores los tres primeros apuestan 1, 0 y 1
- **THEN** el repartidor puede apostar 0, 2 o 3, pero no 1

#### Scenario: Sin restricción
- **WHEN** la restricción del repartidor está desactivada
- **THEN** el repartidor puede apostar cualquier número de 0 al número de cartas

### Requirement: Bazas y obligaciones
Cuando todos han apostado, se MUST jugar las bazas. Sale el siguiente al repartidor y cada baza la abre quien ganó la anterior. Cada jugador MUST seguir el palo de salida si lo tiene y ganar la baza con él si puede. Si no lo tiene, MUST jugar triunfo si tiene y superar el triunfo más alto de la baza si puede. Si no tiene ni el palo ni triunfo, puede jugar cualquier carta. Gana la baza el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida, en el orden As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2.

#### Scenario: Seguir y montar
- **WHEN** la salida es el Caballo de copas y el jugador tiene el 2 y el Rey de copas
- **THEN** solo el Rey de copas es una jugada legal

### Requirement: Puntuación de la mano
Al jugarse todas las cartas de la mano, cada jugador que hizo exactamente las bazas que apostó MUST sumar 10 puntos más 5 por cada baza apostada. Cada jugador que no acertó MUST restar 5 puntos por cada baza de diferencia. El resultado de la mano MUST registrar las apuestas, las bazas hechas, los puntos de la mano y los totales.

#### Scenario: Acertar y fallar
- **WHEN** un jugador apostó 2 e hizo 2, otro apostó 0 e hizo 0 y otro apostó 1 e hizo 3
- **THEN** suman 20, 10 y −10 puntos respectivamente

### Requirement: Fin de la partida
La partida MUST terminar al acabar la última mano de la secuencia. Ganan el jugador o los jugadores con más puntos, y la puntuación final de cada uno son sus puntos.

#### Scenario: Ganador
- **WHEN** termina la última mano con totales 85, 60, 85 y 40
- **THEN** ganan los dos jugadores con 85 puntos

### Requirement: Vista del jugador
La vista de cada jugador MUST mostrar su mano, el número de cartas de los demás, el triunfo y la carta de triunfo visible, la fase (apostar o jugar), las apuestas hechas, las bazas de cada jugador en la mano, la baza en curso y la anterior, el número de cartas de la mano y su posición en la secuencia, los resultados de las manos anteriores y los totales. MUST NOT mostrar las cartas en mano de los demás, salvo la carta de triunfo visible del repartidor, ni el mazo.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás salvo la carta de triunfo visible
