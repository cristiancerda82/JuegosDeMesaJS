## ADDED Requirements

### Requirement: Baraja, orden y puntos del Twenty-Nine
El Twenty-Nine MUST jugarse entre 4 jugadores por parejas (los asientos 0 y 2 contra 1 y 3) con la baraja francesa de 32 cartas, del 7 al As.

En cada palo, el orden de mayor a menor MUST ser J, 9, As, 10, K, Q, 8 y 7. Las cartas MUST valer: la J 3 puntos, el 9 2, el As 1 y el 10 1; las demás, nada (28 puntos en total).

#### Scenario: La jota gana al As
- **WHEN** sin triunfo descubierto, sale el As de picas y se echa la J de picas
- **THEN** la baza la gana la J de picas

#### Scenario: Puntos de una baza
- **WHEN** una baza tiene la J, el 9, el 10 y el 7 de corazones
- **THEN** vale 6 puntos

### Requirement: Reparto y subasta del Twenty-Nine
En cada mano MUST repartirse primero 4 cartas a cada jugador. Desde el siguiente al que reparte, por turno, cada jugador MUST pujar un número de 16 a 28 mayor que la última puja, o pasar; quien pasa MUST NOT volver a pujar. La subasta termina cuando todos menos uno han pasado tras una puja.

Si pasan los cuatro, la mano no se juega, no cuenta y MUST repartirse otra con el siguiente que reparte.

En la primera mano reparte el asiento 3; después, el siguiente.

#### Scenario: Subasta ganada
- **WHEN** el asiento 0 puja 16, el 1 puja 18 y los demás pasan
- **THEN** el asiento 1 gana la subasta con 18

#### Scenario: Pasan los cuatro
- **WHEN** los cuatro jugadores pasan
- **THEN** se reparte otra mano con el siguiente que reparte, sin puntos para nadie

### Requirement: Triunfo oculto o sin triunfo
Quien gana la subasta MUST elegir en secreto un palo de triunfo, o jugar sin triunfo. El palo elegido MUST NOT verse en la vista de los demás hasta que se descubre. Jugar sin triunfo MUST anunciarse a todos.

#### Scenario: Triunfo secreto
- **WHEN** el que pujó elige corazones como triunfo
- **THEN** él lo ve, pero los demás solo ven que hay un triunfo oculto

### Requirement: Doblar y redoblar en el Twenty-Nine
Tras elegir el triunfo, cada rival del que pujó, por turno, MUST poder doblar o pasar. Si uno dobla, el que pujó MUST poder redoblar o pasar. La mano MUST valer 1 punto de juego, 2 si se dobló y 4 si se redobló.

Después MUST repartirse 4 cartas más a cada jugador.

#### Scenario: Doblar
- **WHEN** un rival del que pujó dobla y el que pujó no redobla
- **THEN** la mano vale 2 puntos de juego y cada jugador recibe 4 cartas más

### Requirement: Bazas y pedir el triunfo
Se juegan 8 bazas; en la primera sale el siguiente al que reparte y después quien gana la anterior.
- El jugador MUST echar una carta del palo de salida si tiene.
- Si no tiene y el triunfo está oculto, MUST poder echar cualquier carta o pedir que se descubra el triunfo. Si lo pide, el triunfo se descubre para todos y, si tiene triunfo, MUST echar uno.
- Mientras el triunfo está oculto, una carta del palo del triunfo MUST NOT ganar la baza si no es del palo de salida. Desde que se descubre (en la misma baza en que se pide), el triunfo más alto MUST ganar la baza.
- Sin triunfo, gana siempre la carta más alta del palo de salida.

#### Scenario: Pedir el triunfo
- **WHEN** el triunfo oculto es diamantes, sale picas, el jugador no tiene picas y pide el triunfo
- **THEN** todos ven que el triunfo es diamantes y, si tiene diamantes, tiene que echar uno

#### Scenario: Triunfo oculto no gana
- **WHEN** el triunfo es corazones sin descubrir, sale el As de picas y otro jugador sin picas echa el 7 de corazones sin pedir el triunfo
- **THEN** la baza la gana el As de picas

### Requirement: La pareja del Twenty-Nine
Con el triunfo descubierto, el jugador que tiene en la mano el K y la Q del triunfo MUST poder cantar la pareja en su turno, una vez por mano:
- si es del lado que pujó, la puja MUST bajar 4, sin bajar de 16;
- si es del otro lado, la puja MUST subir 4, sin pasar de 28.

Sin triunfo no hay pareja.

#### Scenario: Pareja del que pujó
- **WHEN** con una puja de 22, el compañero del que pujó canta la pareja
- **THEN** la puja pasa a ser 18

#### Scenario: Pareja de los rivales
- **WHEN** con una puja de 26, un rival del que pujó canta la pareja
- **THEN** la puja pasa a ser 28

### Requirement: Puntuación y partida del Twenty-Nine
Al acabar las bazas, si la pareja que pujó suma con sus bazas al menos la puja, MUST ganar tantos puntos de juego como vale la mano; si no, MUST perderlos.

La partida MUST terminar cuando una pareja llega a 6 puntos de juego (gana ella) o a −6 (gana la otra). Si tras 40 manos jugadas ninguna lo consigue, gana la que más tiene, o es empate.

#### Scenario: Puja cumplida
- **WHEN** la pareja que pujó 20 sin doblar hace 21 puntos
- **THEN** gana 1 punto de juego

#### Scenario: Puja fallada redoblada
- **WHEN** la pareja que pujó 18 con la mano redoblada hace 15 puntos
- **THEN** pierde 4 puntos de juego

### Requirement: Vista del jugador en el Twenty-Nine
La vista de cada jugador MUST mostrar:
- su mano y cuántas cartas tienen los demás;
- la subasta, quién pujó y la puja (con la pareja);
- si se juega sin triunfo, si el triunfo está oculto o cuál es (al que pujó, siempre);
- si la mano está doblada o redoblada;
- la baza en curso, la última baza, los puntos de cada pareja en la mano y el marcador.

La vista MUST NOT mostrar las manos ajenas ni el triunfo oculto a quien no lo eligió.

#### Scenario: Triunfo oculto en la vista
- **WHEN** el triunfo no se ha descubierto
- **THEN** la vista de un rival del que pujó no dice el palo del triunfo
