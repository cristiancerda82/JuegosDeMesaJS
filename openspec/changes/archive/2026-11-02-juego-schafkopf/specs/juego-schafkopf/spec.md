## ADDED Requirements

### Requirement: Baraja y reparto del Schafkopf
El Schafkopf MUST jugarse entre 4 jugadores con 32 cartas francesas: A, 10, K, Q, J, 9, 8 y 7 de cada palo. Las damas hacen de Ober y las jotas de Unter. Las cartas MUST valer: As 11, 10 10, rey 4, dama 3 y jota 2; las demás, nada; en total, 120. En cada mano, cada jugador MUST recibir 8 cartas. El repartidor de la primera mano es el asiento 3 y pasa al siguiente en cada mano. Elige contrato primero y sale en la primera baza el jugador siguiente al repartidor.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 8 cartas, no quedan cartas y le toca anunciar al jugador siguiente al repartidor

### Requirement: Elección del contrato del Schafkopf
Desde el siguiente al repartidor y una sola vez cada uno, cada jugador MUST pasar o anunciar un contrato de rango mayor que el más alto anunciado hasta entonces. El orden, de menor a mayor, es Rufspiel, Wenz y Solo:
- **Rufspiel:** el jugador llama a un As de tréboles, picas o diamantes. Solo MAY llamarlo si tiene alguna carta de ese palo que no sea dama ni jota y no tiene ese As.
- **Wenz:** sin más elección.
- **Solo:** el jugador elige el palo de triunfo.

Al acabar la ronda, juega quien anunció el contrato más alto. Si todos pasan, la mano MUST terminar sin jugarse, sin fichas, y se reparte la siguiente.

#### Scenario: Un contrato más alto
- **WHEN** el jugador 0 anuncia un Rufspiel y el jugador 1 un Solo de tréboles
- **THEN** el jugador 2 solo puede pasar, porque no hay contrato más alto que el Solo, y juega el jugador 1

#### Scenario: As que no se puede llamar
- **WHEN** el jugador tiene el As de picas, o no tiene picas que no sean dama ni jota
- **THEN** no puede llamar al As de picas

#### Scenario: Todos pasan
- **WHEN** los cuatro jugadores pasan
- **THEN** la mano termina sin fichas y se reparte la siguiente con el siguiente repartidor

### Requirement: Triunfos del Schafkopf
Los triunfos MUST ser, de mayor a menor:
- **Rufspiel:** las damas de tréboles, picas, corazones y diamantes; las jotas en el mismo orden; y los corazones A, 10, K, 9, 8 y 7.
- **Solo:** como el Rufspiel, con el palo elegido en lugar de los corazones.
- **Wenz:** solo las jotas de tréboles, picas, corazones y diamantes. En el Wenz, las damas van en su palo, entre el rey y el 9.

En los palos que no son triunfo, el orden MUST ser A, 10, K, (dama en el Wenz), 9, 8 y 7.

#### Scenario: La dama de diamantes es triunfo
- **WHEN** en un Rufspiel sale el As de corazones y otro jugador echa la dama de diamantes
- **THEN** gana la dama de diamantes

#### Scenario: En el Wenz la dama no es triunfo
- **WHEN** en un Wenz sale el rey de picas y otro jugador echa la dama de picas
- **THEN** gana el rey de picas

### Requirement: Bazas del Schafkopf
Cada jugador MUST seguir el palo de salida si puede, contando todos los triunfos como un palo: si sale un triunfo, hay que echar triunfo; si sale un palo, hay que echar una carta de ese palo que no sea triunfo. Si no puede, MAY echar cualquier carta. La baza la MUST ganar el triunfo más alto o, sin triunfos, la carta más alta del palo de salida. El ganador sale en la siguiente baza.

En el Rufspiel, el dueño del As llamado:
- MUST echarlo cuando sale su palo;
- MUST NOT descartarlo en una baza de otro palo, salvo en la última;
- si sale con una carta del palo llamado, MUST salir con el As.

Al echar el As llamado, todos MUST saber quién es el compañero.

#### Scenario: Seguir con triunfo
- **WHEN** en un Rufspiel sale la jota de picas y el jugador tiene el 7 de corazones y el As de tréboles
- **THEN** solo puede echar el 7 de corazones

#### Scenario: La dama no sigue su palo
- **WHEN** en un Rufspiel sale el As de tréboles y el jugador solo tiene de tréboles la dama
- **THEN** puede echar cualquier carta, porque la dama es triunfo

#### Scenario: El As llamado sale con su palo
- **WHEN** se llamó al As de picas, sale el 9 de picas y su dueño tiene el As y el 7 de picas
- **THEN** tiene que echar el As de picas

#### Scenario: No se descarta el As llamado
- **WHEN** se llamó al As de picas, sale diamantes, su dueño no tiene diamantes y no es la última baza
- **THEN** puede echar cualquier carta menos el As de picas

### Requirement: Puntos y fichas de la mano del Schafkopf
Al acabar las 8 bazas, el lado del jugador (él y su compañero en el Rufspiel, o él solo) MUST ganar si suma 61 puntos o más; con 60 o menos, gana el otro lado. La tarifa de la mano MUST ser:
- 10 en el Rufspiel y 50 en el Wenz y el Solo;
- 10 más si el lado que pierde hace 30 puntos o menos (Schneider);
- otros 10 más si el lado que pierde no gana ninguna baza (Schwarz);
- 10 más por cada Laufende: los triunfos más altos seguidos, desde el primero, que tiene un mismo lado al empezar la mano, si son 3 o más (2 o más en el Wenz).

En el Rufspiel, cada jugador del lado que gana MUST cobrar la tarifa y cada uno del que pierde, pagarla. En el Wenz y el Solo, el que juega solo MUST cobrar la tarifa de cada uno de los otros tres, o pagársela a cada uno si pierde. Las fichas de los cuatro siempre suman 0.

#### Scenario: Rufspiel ganado
- **WHEN** en un Rufspiel sin Laufende el lado del jugador hace 65 puntos
- **THEN** él y su compañero cobran 10 fichas cada uno y los otros dos pagan 10 cada uno

#### Scenario: Con 60 se pierde
- **WHEN** el lado del jugador hace 60 puntos
- **THEN** pierde la mano

#### Scenario: Solo con Schneider
- **WHEN** en un Solo sin Laufende el que juega hace 95 puntos
- **THEN** la tarifa es 60 y cobra 180 fichas, 60 de cada uno

#### Scenario: Laufende
- **WHEN** en un Rufspiel el lado del jugador tiene al empezar las damas de tréboles, picas y corazones y no la de diamantes, y gana sin Schneider
- **THEN** hay 3 Laufende y la tarifa es 40

### Requirement: Partida del Schafkopf
La partida MUST durar 12 manos, contando las que se terminan sin jugar porque todos pasan. Al acabar, MUST ganar el jugador con más fichas; si varios empatan con el máximo, ganan todos ellos, y si empatan los cuatro, la partida queda en empate.

#### Scenario: Fin de la partida
- **WHEN** termina la duodécima mano
- **THEN** la partida termina y gana el jugador con más fichas

### Requirement: Vista del Schafkopf
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno;
- lo anunciado en la ronda de contratos, el contrato, quién juega, el triunfo y el As llamado;
- el compañero en el Rufspiel, solo cuando se ha echado el As llamado o si es él mismo;
- la baza en curso, la última baza, las bazas y los puntos de cartas de cada jugador en la mano;
- las cartas jugadas en la mano y los palos que cada uno no ha seguido;
- los resultados de las manos anteriores y las fichas de cada jugador.

Cada jugador MUST NOT ver las manos de los demás ni, mientras no se eche el As llamado, quién lo tiene.

#### Scenario: Compañero oculto
- **WHEN** en un Rufspiel aún no se ha echado el As llamado y mira la mesa un jugador que no lo tiene
- **THEN** no ve quién es el compañero

#### Scenario: El dueño del As sabe que es compañero
- **WHEN** en un Rufspiel mira la mesa el jugador que tiene el As llamado
- **THEN** ve que es el compañero del que juega
