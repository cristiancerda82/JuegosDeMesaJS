## ADDED Requirements

### Requirement: Reparto y triunfo del Julepe
El Julepe MUST jugarse con la baraja española de 40 cartas y de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta. En cada mano se MUST repartir 5 cartas a cada jugador que tiene fichas. La última carta del repartidor se muestra a todos y su palo es el triunfo. La carta sigue en su mano y se ve mientras no la juegue ni la descarte. Las cartas que sobran forman el mazo de descartes, boca abajo.

El reparto pasa al siguiente jugador con fichas en cada mano, y es **mano** el siguiente al repartidor. La primera mano la reparte el último asiento, así que el asiento 0 es mano.

#### Scenario: Reparto con 4 jugadores
- **WHEN** empieza una partida de 4 jugadores
- **THEN** cada uno tiene 5 cartas, quedan 20 en el mazo, el triunfo es el palo de la última carta del repartidor y esa carta está a la vista

### Requirement: Bote y puesta
Al empezar cada mano, el repartidor MUST poner 10 fichas en el bote, o las que le queden si tiene menos. Al bote se suman también los julepes que se pagaron en la mano anterior.

#### Scenario: Primera mano
- **WHEN** empieza una partida
- **THEN** el bote tiene 10 fichas y el repartidor tiene 40

### Requirement: Jugar o pasar
Antes de descartar, cada jugador, desde la mano hasta el repartidor, MUST decidir si **juega** la mano o **pasa**. Los que pasan no juegan cartas en esa mano ni cobran ni pagan. Las decisiones son visibles para todos.

El repartidor decide el último:
- si antes de él solo ha querido jugar uno, MUST jugar;
- si no ha querido jugar nadie, se lleva el bote entero sin jugar y la mano termina.

#### Scenario: Repartidor obligado
- **WHEN** en una mano de 4 jugadores solo el asiento 1 quiere jugar
- **THEN** el repartidor no puede pasar

#### Scenario: Nadie juega
- **WHEN** todos pasan hasta el repartidor
- **THEN** el repartidor cobra el bote y empieza la mano siguiente

### Requirement: Descarte
Cuando todos han decidido, cada jugador que juega, en orden desde la mano, MUST poder descartar las cartas que quiera, incluso ninguna, y robar del mazo otras tantas. No puede descartar más cartas de las que quedan en el mazo. Los demás ven cuántas cartas cambió cada uno, pero no cuáles.

#### Scenario: Mazo corto
- **WHEN** a un jugador le toca descartar y en el mazo quedan 2 cartas
- **THEN** puede descartar como mucho 2 cartas

### Requirement: Bazas del Julepe
Tras los descartes, los jugadores que juegan MUST jugar 5 bazas entre ellos, en orden de asiento y saltando a los que pasaron. Sale en la primera el primero que juega desde la mano, y cada baza la abre quien ganó la anterior.

El orden de las cartas es el de la Brisca: As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2. Cada jugador MUST cumplir estas obligaciones:
- seguir el palo de salida y superar con él la carta que va ganando si puede;
- si no tiene el palo, jugar triunfo y superar el triunfo más alto si puede;
- si no tiene ni el palo ni triunfo, jugar cualquier carta.

#### Scenario: Superar con el palo
- **WHEN** la salida es el Caballo de copas y el jugador tiene el 2 y el Rey de copas
- **THEN** solo puede jugar el Rey de copas

### Requirement: Cobro y julepe
Al terminar las 5 bazas, cada jugador que jugó MUST cobrar del bote una quinta parte por cada baza ganada, redondeada hacia abajo. Lo que sobra se queda en el bote para la mano siguiente. Cada jugador que jugó e hizo menos de 2 bazas MUST pagar **julepe**: lo que valía el bote en esa mano, que va al bote de la mano siguiente. Si no tiene tantas fichas, paga las que le queden.

Un jugador que se queda sin fichas MUST quedar eliminado: no recibe cartas ni decide en las manos siguientes. El resultado de cada mano MUST registrar:
- quién jugó;
- las bazas de cada uno;
- lo que cobró y lo que pagó cada uno;
- el bote;
- las fichas tras la mano.

#### Scenario: Cobro y julepe
- **WHEN** con un bote de 10 juegan tres jugadores y hacen 3, 2 y 0 bazas
- **THEN** cobran 6, 4 y 0 fichas, y el tercero paga 10 de julepe al bote de la mano siguiente

### Requirement: Fin de la partida del Julepe
Cada jugador MUST empezar con 50 fichas. La partida MUST terminar al acabar el número de manos configurado (12 por defecto, o 6 o 20), o antes si solo un jugador tiene fichas. Las fichas que queden en el bote no son de nadie. Ganan el jugador o los jugadores con más fichas, y la puntuación final de cada uno son sus fichas.

#### Scenario: Fin por manos
- **WHEN** termina la duodécima mano con 70, 55, 40 y 30 fichas
- **THEN** la partida termina y gana el jugador con 70

### Requirement: Vista del jugador del Julepe
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- la carta de triunfo mientras esté a la vista, y el triunfo;
- el repartidor, la mano, la fase (decidir, descartar o jugar) y a quién le toca;
- quién juega y quién pasa, y cuántas cartas cambió cada uno;
- las cartas que quedan en el mazo;
- la baza en curso y las bazas jugadas;
- las bazas de cada jugador;
- el bote, las fichas de cada uno, los eliminados, el número de la mano y el total;
- los resultados de las manos anteriores.

MUST NOT mostrar las cartas en mano de los demás (salvo la carta de triunfo a la vista), ni las del mazo, ni las descartadas.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás salvo la carta de triunfo a la vista, ni del mazo, ni de los descartes
