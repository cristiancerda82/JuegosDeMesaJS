## ADDED Requirements

### Requirement: Reparto del Tute subastado
El Tute subastado MUST jugarse con la baraja española de 40 cartas y 4 jugadores, cada uno por su cuenta. En cada mano se MUST repartir las 40 cartas, 10 a cada jugador, sin muestra. El reparto pasa al siguiente asiento en cada mano, y es **mano** el siguiente al repartidor. La primera mano la reparte el asiento 3, así que el asiento 0 es mano.

El orden y los puntos de las cartas son los del Tute: As (11), 3 (10), Rey (4), Caballo (3), Sota (2), 7, 6, 5, 4 y 2 (0). Las bazas suman 120 puntos y la última vale 10 más.

#### Scenario: Reparto de una mano
- **WHEN** empieza una partida de Tute subastado
- **THEN** cada jugador tiene 10 cartas, no hay mazo ni muestra y le toca hablar al asiento 0

### Requirement: Subasta
Antes de jugar, los jugadores MUST subastar, empezando por la mano y en orden de asiento. En su turno, cada jugador que no ha pasado MUST pujar o pasar:
- la primera puja es de 60 como mínimo;
- cada puja sube la vigente de 10 en 10, sin pasar de 230;
- quien pasa ya no vuelve a pujar en esa mano.

La subasta acaba cuando, tras una puja, los otros tres han pasado. Quien hizo esa puja es el **pujador**. Si pasan los cuatro sin pujar, la mano no cuenta y se MUST repartir otra con el siguiente repartidor. Todas las pujas y los pases MUST ser visibles para todos.

#### Scenario: Puja mínima
- **WHEN** nadie ha pujado y le toca al asiento 0
- **THEN** puede pasar o pujar 60, 70… hasta 230, y no puede pujar 50

#### Scenario: Subir la puja
- **WHEN** la puja vigente es 80
- **THEN** el siguiente que no ha pasado puede pasar o pujar de 90 en adelante

#### Scenario: Gana la subasta
- **WHEN** el asiento 1 puja 70 y después pasan los asientos 2, 3 y 0
- **THEN** el asiento 1 es el pujador con 70

#### Scenario: Todos pasan
- **WHEN** los cuatro pasan sin pujar
- **THEN** se reparte otra mano con el siguiente repartidor y el número de manos jugadas no cambia

### Requirement: Elección del triunfo
Al acabar la subasta, el pujador MUST elegir el palo de triunfo entre los cuatro, después de ver su mano. El triunfo MUST ser visible para todos. Después, el pujador sale en la primera baza.

#### Scenario: El pujador elige
- **WHEN** el asiento 2 gana la subasta
- **THEN** sus acciones legales son elegir oros, copas, espadas o bastos, y al elegir espadas el triunfo es espadas y le toca salir

### Requirement: Bazas del Tute subastado
Se MUST jugar las 10 bazas. Cada baza la abre quien ganó la anterior y gana la carta más alta del palo de salida, salvo que haya triunfo, en cuyo caso gana el triunfo más alto. Cada jugador MUST cumplir estas obligaciones:
- seguir el palo de salida y superar con él la carta que va ganando, si puede;
- si no tiene el palo, jugar triunfo y superar el triunfo más alto de la baza, si puede;
- si no tiene ni el palo ni triunfo, jugar cualquier carta.

Hay que superar siempre, aunque la baza la vaya ganando un compañero de bando: los bandos solo duran una mano.

#### Scenario: Superar al compañero
- **WHEN** un defensor va ganando la baza con el Rey de oros y otro defensor tiene el As y el 4 de oros
- **THEN** solo puede jugar el As de oros

#### Scenario: Fallar con triunfo
- **WHEN** el jugador no tiene el palo de salida y tiene triunfos
- **THEN** solo puede jugar triunfos, y si alguno supera el triunfo más alto de la baza, solo esos

### Requirement: Cantes del Tute subastado
El jugador que acaba de ganar una baza MUST poder, en su turno y antes de salir, cantar una pareja de rey y caballo del mismo palo que tenga en la mano: 40 si es del triunfo y 20 si no. Solo MUST poder hacer un cante por cada baza ganada, y cada palo solo se canta una vez por mano. El cante suma a su bando: al pujador si lo canta él, a los defensores si lo canta uno de ellos. El cante MUST ser visible para todos.

Con los 4 reyes o los 4 caballos en la mano, en las mismas condiciones, MUST poder cantar el **tute**: si lo canta el pujador, cumple en el acto; si lo canta un defensor, el pujador falla en el acto. La mano termina.

#### Scenario: Cante de un defensor
- **WHEN** un defensor gana una baza y canta las 20 en copas
- **THEN** los defensores suman 20 puntos y el defensor sigue en turno para salir

#### Scenario: Sin baza ganada no se canta
- **WHEN** un jugador tiene rey y caballo de un palo pero no ganó la última baza
- **THEN** cantar no está entre sus acciones legales

#### Scenario: Tute del pujador
- **WHEN** el pujador gana una baza y canta el tute de reyes
- **THEN** la mano termina y el pujador cumple

### Requirement: Cobro en fichas
Al terminar la mano, el pujador MUST cumplir si sus puntos (bazas, cantes y 10 de últimas) llegan a lo que pujó. El valor de la mano es una ficha por cada 10 puntos pujados:
- si cumple, cobra ese valor de cada uno de los otros tres;
- si falla, paga ese valor a cada uno de los otros tres.

El resultado de cada mano MUST registrar:
- el pujador y su puja;
- el triunfo;
- los puntos del pujador y los de los defensores;
- si cumplió y si hubo tute;
- las fichas que ganó o perdió cada jugador;
- las fichas de cada uno tras la mano.

#### Scenario: Cumple la puja
- **WHEN** el pujador pujó 80 y hace 85 puntos
- **THEN** gana 24 fichas y cada uno de los otros pierde 8

#### Scenario: Falla la puja
- **WHEN** el pujador pujó 100 y hace 95 puntos
- **THEN** pierde 30 fichas y cada uno de los otros gana 10

#### Scenario: Las fichas se conservan
- **WHEN** termina cualquier mano
- **THEN** la suma de las fichas de los cuatro sigue siendo 0

### Requirement: Fin de la partida del Tute subastado
Todos MUST empezar con 0 fichas, y el saldo puede ser negativo. La partida MUST durar el número de manos de la configuración: 4, 8 (por defecto) o 12. Las manos en que todos pasan no cuentan. Al terminar, gana el jugador con más fichas; si hay empate, ganan todos los empatados.

#### Scenario: Fin por manos
- **WHEN** termina la octava mano de una partida de 8
- **THEN** la partida termina y gana quien más fichas tiene

### Requirement: Vista del jugador en el Tute subastado
Cada jugador MUST ver solo su mano y lo público:
- cuántas cartas tiene cada uno;
- las pujas y los pases;
- el pujador, la puja y el triunfo;
- la baza en curso y la última baza;
- las cartas jugadas en la mano;
- los puntos de las bazas de cada jugador y los cantes;
- las fichas de cada uno y los resultados de las manos anteriores.

#### Scenario: Manos ajenas ocultas
- **WHEN** un jugador pide su vista
- **THEN** ve sus 10 cartas y solo el número de cartas de los demás
