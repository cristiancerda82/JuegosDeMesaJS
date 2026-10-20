## ADDED Requirements

### Requirement: Reparto de la Cuatrola
La Cuatrola MUST jugarse con la baraja española de 40 cartas y 4 jugadores. En cada mano se MUST repartir las 40 cartas, 10 a cada jugador. El reparto pasa al siguiente asiento en cada mano, y es **mano** el siguiente al repartidor. La primera mano la reparte el asiento 3, así que el asiento 0 es mano.

#### Scenario: Reparto de una mano
- **WHEN** empieza una partida de Cuatrola
- **THEN** cada jugador tiene 10 cartas y le toca hablar al asiento 0

### Requirement: Subasta de la Cuatrola
Antes de jugar, los jugadores MUST subastar, empezando por la mano y en orden de asiento. En su turno, cada jugador que no ha pasado MUST pasar o pujar una modalidad más alta que la vigente:
- **con rey**, si nadie ha pujado;
- **solo**, si nadie ha pujado o la puja vigente es «con rey».

Quien pasa ya no vuelve a hablar en esa mano. La subasta acaba cuando, tras una puja, los otros tres han pasado, o cuando alguien puja «solo», que ya no se puede superar. Quien hizo la última puja es el **jugador**. Si pasan los cuatro sin pujar, la mano no cuenta y se MUST repartir otra con el siguiente repartidor. Las pujas y los pases MUST ser visibles para todos.

#### Scenario: Primera puja
- **WHEN** nadie ha pujado y le toca al asiento 0
- **THEN** puede pasar, pujar con rey o pujar solo

#### Scenario: Subir a solo
- **WHEN** el asiento 0 puja con rey y le toca al asiento 1
- **THEN** puede pasar o pujar solo, y no puede pujar con rey

#### Scenario: Solo cierra la subasta
- **WHEN** el asiento 1 puja solo
- **THEN** la subasta termina y el asiento 1 es el jugador

#### Scenario: Todos pasan en la Cuatrola
- **WHEN** los cuatro pasan sin pujar
- **THEN** se reparte otra mano con el siguiente repartidor y el número de manos jugadas no cambia

### Requirement: Triunfo y rey llamado
Al acabar la subasta, el jugador MUST elegir el palo de triunfo entre los cuatro. Si juega con rey, MUST nombrar además un rey que no tenga en la mano; si tiene los cuatro reyes, nombra un caballo que no tenga, y si tiene también los cuatro caballos, una sota. Quien tiene la carta llamada es su **compañero** en esa mano, y los otros dos son los defensores. El triunfo y la carta llamada MUST ser visibles para todos, pero quién es el compañero MUST quedar oculto para los demás hasta que juega la carta llamada. Después, sale la mano en la primera baza.

#### Scenario: Llamar un rey
- **WHEN** el jugador, que juega con rey, tiene el Rey de oros y el de copas, y elige copas de triunfo
- **THEN** puede llamar el Rey de espadas o el de bastos, y no el de oros ni el de copas

#### Scenario: El compañero se descubre al jugar el rey
- **WHEN** el asiento 2 tiene el rey llamado y lo juega
- **THEN** todos ven que el asiento 2 es el compañero del jugador

#### Scenario: Compañero oculto
- **WHEN** el rey llamado aún no se ha jugado
- **THEN** la vista de cada jugador que no lo tiene no dice quién es el compañero

### Requirement: Orden de las cartas en la Cuatrola
Las cartas MUST ordenarse así, de la más alta a la más baja:
- **Matadores**, que son triunfo sea cual sea el palo elegido: la espadilla (As de espadas), la malilla (el 7 del triunfo si es oros o copas, el 2 del triunfo si es espadas o bastos), el basto (As de bastos) y, si el triunfo es oros o copas, el punto (su As).
- **El resto del triunfo:** Rey, Caballo y Sota; después, si es oros o copas, 2, 3, 4, 5 y 6; si es espadas o bastos, 7, 6, 5, 4 y 3.
- **Los palos que no son triunfo:** en oros y copas, Rey, Caballo, Sota, As, 2, 3, 4, 5, 6 y 7; en espadas y bastos, Rey, Caballo, Sota, 7, 6, 5, 4, 3 y 2. El As de espadas y el de bastos son siempre del triunfo.

Gana la baza el triunfo más alto; si no hay triunfo, la carta más alta del palo de salida.

#### Scenario: La espadilla gana siempre
- **WHEN** el triunfo es oros y en una baza se juegan el As de espadas, el 7 de oros y el As de oros
- **THEN** gana el As de espadas

#### Scenario: El As de bastos es triunfo
- **WHEN** el triunfo es copas, sale el Rey de bastos y otro jugador echa el As de bastos
- **THEN** gana el As de bastos, porque es triunfo

#### Scenario: Oros al revés
- **WHEN** el triunfo es espadas y en una baza de oros se juegan el 2 y el 6 de oros
- **THEN** gana el 2 de oros

### Requirement: Obligaciones en la Cuatrola
Cada jugador MUST seguir el palo de salida si puede; el palo de una carta es el triunfo si es un matador o del palo de triunfo. Si no puede seguirlo, MUST poder jugar cualquier carta: no hay obligación de fallar ni de superar.

Privilegio de los matadores: si la carta de salida es un triunfo, los matadores más altos que ella no cuentan para la obligación. Quien solo tiene matadores más altos que la salida puede jugar cualquier carta, y quien tiene otros triunfos puede echar esos o sus matadores.

#### Scenario: Seguir el palo
- **WHEN** sale una copa, que no es triunfo, y el jugador tiene copas
- **THEN** solo puede jugar copas

#### Scenario: Sin el palo, libre
- **WHEN** sale una copa y el jugador no tiene copas
- **THEN** puede jugar cualquier carta

#### Scenario: Matador no forzado
- **WHEN** el triunfo es oros, sale el Rey de oros y el jugador solo tiene de triunfo la espadilla
- **THEN** puede jugar cualquier carta

### Requirement: Cobro en la Cuatrola
Al terminar las 10 bazas, el jugador (con su compañero, si juega con rey) MUST ganar la mano si su bando ha hecho 6 bazas o más. El cobro en fichas es:
- **con rey, ganan:** cada defensor paga 1 ficha a cada uno de la pareja;
- **con rey, pierden:** el jugador paga 2 a cada defensor, y el compañero no paga nada;
- **solo, gana:** cobra 2 de cada uno de los otros tres;
- **solo, pierde:** paga 2 a cada uno de los otros tres.

Si el bando ganador hace las 10 bazas (**bola**), el cobro se MUST doblar.

El resultado de cada mano MUST registrar:
- el jugador, la modalidad, el triunfo, la carta llamada y el compañero;
- las bazas de cada bando;
- si ganó y si hubo bola;
- las fichas que ganó o perdió cada jugador y las fichas tras la mano.

#### Scenario: Gana con rey
- **WHEN** el jugador y su compañero hacen 7 bazas
- **THEN** cada uno de los dos gana 2 fichas y cada defensor pierde 2

#### Scenario: Pierde con rey
- **WHEN** el jugador y su compañero hacen 5 bazas
- **THEN** el jugador pierde 4 fichas, cada defensor gana 2 y el compañero se queda igual

#### Scenario: Bola solo
- **WHEN** el jugador que juega solo hace las 10 bazas
- **THEN** gana 12 fichas y cada uno de los otros pierde 4

#### Scenario: Las fichas se conservan en la Cuatrola
- **WHEN** termina cualquier mano
- **THEN** la suma de las fichas de los cuatro sigue siendo 0

### Requirement: Fin de la partida de Cuatrola
Todos MUST empezar con 0 fichas, y el saldo puede ser negativo. La partida MUST durar el número de manos de la configuración: 4, 8 (por defecto) o 12. Las manos en que todos pasan no cuentan. Al terminar, gana el jugador con más fichas; si hay empate, ganan todos los empatados.

#### Scenario: Fin de la Cuatrola por manos
- **WHEN** termina la octava mano de una partida de 8
- **THEN** la partida termina y gana quien más fichas tiene

### Requirement: Vista del jugador en la Cuatrola
Cada jugador MUST ver solo su mano y lo público:
- cuántas cartas tiene cada uno;
- las pujas y los pases;
- el jugador, la modalidad, el triunfo y la carta llamada;
- el compañero, solo si es él mismo o cuando ya se jugó la carta llamada;
- la baza en curso, la última baza y las bazas de la mano;
- las bazas de cada jugador;
- las fichas de cada uno y los resultados de las manos anteriores.

#### Scenario: Manos ajenas ocultas en la Cuatrola
- **WHEN** un jugador pide su vista
- **THEN** ve sus 10 cartas y solo el número de cartas de los demás
