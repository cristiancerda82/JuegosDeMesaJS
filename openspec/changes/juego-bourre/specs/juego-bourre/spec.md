## ADDED Requirements

### Requirement: Baraja, fichas y entrada del Bourré
El Bourré MUST jugarse entre 5 jugadores con la baraja francesa de 52 cartas. En cada palo, el orden de mayor a menor MUST ser As, K, Q, J, 10, 9, 8, 7, 6, 5, 4, 3, 2.

Cada jugador MUST empezar con 100 fichas. Al empezar cada mano, cada jugador con fichas MUST poner 1 en el bote. Un jugador sin fichas queda fuera de la partida.

#### Scenario: Entrada
- **WHEN** empieza la primera mano
- **THEN** cada jugador tiene 99 fichas y el bote tiene 5

### Requirement: Reparto y triunfo del Bourré
En cada mano:
- cada jugador con fichas MUST recibir 5 cartas;
- la última carta del que reparte MUST enseñarse a todos (la vuelta), y su palo es el triunfo;
- la vuelta es del que reparte, que MUST NOT descartarse de ella;
- el resto forma el mazo.

En la primera mano reparte el asiento 4. Después, reparte el siguiente jugador con fichas.

#### Scenario: Reparto
- **WHEN** empieza una mano con los cinco jugadores
- **THEN** cada uno tiene 5 cartas, todos ven la vuelta del que reparte y quedan 27 en el mazo

### Requirement: Jugar o pasar en el Bourré
Desde el siguiente al que reparte, cada jugador con cartas MUST decidir si juega la mano o pasa. Quien pasa deja sus cartas y no juega las bazas.
- Si nadie juega, el bote MUST quedarse para la mano siguiente.
- Si juega uno solo, MUST llevarse el bote sin jugar.

#### Scenario: Pasar
- **WHEN** un jugador pasa
- **THEN** no juega esa mano y su entrada se queda en el bote

#### Scenario: Juega uno solo
- **WHEN** solo un jugador decide jugar
- **THEN** se lleva el bote y empieza otra mano

### Requirement: Cambio de cartas del Bourré
Si juegan dos o más, por turno desde el siguiente al que reparte, cada jugador que juega MUST poder descartarse de 0 a 5 cartas (sin la vuelta, si es el que reparte) y robar otras tantas del mazo.

#### Scenario: Cambiar dos cartas
- **WHEN** un jugador se descarta de 2 cartas y roba
- **THEN** sigue con 5 cartas y el mazo tiene 2 menos

### Requirement: Bazas del Bourré
- **Salida:** en la primera baza sale el primer jugador que juega después del que reparte; después, quien gana la baza anterior.
- **El As de triunfo:** el jugador que sale y tiene el As de triunfo MUST salir con él.
- **Al responder:**
  - con cartas del palo de salida, el jugador MUST echar una de ellas, y una que gane la baza si puede;
  - sin el palo, si tiene triunfo MUST echar un triunfo, y uno más alto que el triunfo más alto de la baza si puede;
  - si no tiene ni el palo ni triunfo, puede echar cualquier carta.
- **Ganadora:** la baza la gana el triunfo más alto o, si no hay triunfo, la carta más alta del palo de salida.

#### Scenario: Salir con el As de triunfo
- **WHEN** el triunfo es corazones y el que sale tiene el As de corazones
- **THEN** solo puede salir con el As de corazones

#### Scenario: Ganar si se puede
- **WHEN** sale el 9 de picas y el jugador tiene el 7 y el Q de picas
- **THEN** solo puede echar el Q de picas

#### Scenario: Superar el triunfo
- **WHEN** el triunfo es diamantes, el jugador no tiene el palo de salida y en la baza hay el 10 de diamantes, y él tiene el 5 y el K de diamantes
- **THEN** solo puede echar el K de diamantes

### Requirement: Bote y bourré
Al acabar las bazas:
- quien ha hecho más bazas MUST llevarse el bote; si varios empatan con más bazas, el bote MUST quedarse para la mano siguiente;
- cada jugador que jugó y no hizo ninguna baza MUST pagar al bote de la mano siguiente tanto como había en el bote al empezar las bazas, o todas sus fichas si tiene menos.

#### Scenario: Gana el bote
- **WHEN** con 5 fichas en el bote un jugador hace 3 bazas y los otros 1 cada uno
- **THEN** se lleva las 5 fichas

#### Scenario: Bourré
- **WHEN** con 5 fichas en el bote un jugador juega y no hace ninguna baza
- **THEN** paga 5 fichas, que van al bote de la mano siguiente

#### Scenario: Empate
- **WHEN** dos jugadores hacen 2 bazas cada uno
- **THEN** nadie se lleva el bote, que pasa a la mano siguiente

### Requirement: Fin de la partida del Bourré
La partida MUST terminar tras 15 manos o cuando solo queda un jugador con fichas. Gana quien tiene más fichas; si varios empatan arriba, ganan todos ellos. Lo que quede en el bote no cuenta.

#### Scenario: Fin a las 15 manos
- **WHEN** termina la mano 15
- **THEN** la partida acaba y gana el jugador con más fichas

### Requirement: Vista del jugador en el Bourré
La vista de cada jugador MUST mostrar:
- su mano;
- cuántas cartas tienen los otros;
- la vuelta y el triunfo;
- quién juega y quién pasa;
- cuántas cartas cambió cada uno;
- cuántas quedan en el mazo;
- la baza en curso, la última baza y las bazas de cada uno;
- el bote, las fichas y el resumen de las manos anteriores.

La vista MUST NOT mostrar:
- las manos ajenas (salvo la vuelta);
- las cartas descartadas;
- el mazo.

#### Scenario: Descartes ocultos
- **WHEN** un rival se descarta de 3 cartas
- **THEN** el jugador ve que cambió 3, pero no cuáles
