# juego-briscola-chiamata Specification

## Purpose
TBD - created by archiving change juego-briscola-chiamata. Update Purpose after archive.

## Requirements

### Requirement: Baraja, orden y puntos de la Briscola Chiamata
La Briscola Chiamata MUST jugarse entre 5 jugadores con la baraja española de 40 cartas.

En cada palo, el orden de mayor a menor MUST ser As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2. Las cartas MUST valer: el As 11 puntos, el 3 10, el Rey 4, el Caballo 3 y la Sota 2; las demás, nada (120 puntos en total).

#### Scenario: El 3 gana al Rey
- **WHEN** sin triunfos en la baza, sale el Rey de copas y se echa el 3 de copas
- **THEN** el 3 de copas va ganando la baza

#### Scenario: Puntos de una baza
- **WHEN** una baza tiene el As, el 3, la Sota, el 7 y el 2 de oros
- **THEN** vale 23 puntos

### Requirement: Reparto y subasta de la Briscola Chiamata
En cada mano MUST repartirse 8 cartas a cada jugador. En la primera mano reparte el asiento 4; después, el siguiente.

Desde el siguiente al que reparte, por turno, cada jugador MUST pujar más bajo que la última puja, o pasar; quien pasa MUST NOT volver a pujar. Las pujas, de la más alta a la más baja, MUST ser:
- las de carta: As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2, cada una con 61 puntos;
- las de puntos: «2 con N», con N de 62 a 120.

La subasta termina cuando todos menos uno han pasado tras una puja. Si los cuatro primeros en hablar pasan, el que reparte MUST pujar (solo puede pujar el As).

#### Scenario: Subasta ganada
- **WHEN** el asiento 0 puja el As, el 1 puja el Rey, el 2 puja el 7 y los demás pasan
- **THEN** el asiento 2 gana la subasta con el 7 y necesita 61 puntos

#### Scenario: Subasta por puntos
- **WHEN** tras una puja del 2, un jugador puja «2 con 70» y los demás pasan
- **THEN** ese jugador gana la subasta llamando un 2 y necesita 70 puntos

#### Scenario: El que reparte no puede pasar
- **WHEN** los cuatro primeros en hablar pasan
- **THEN** el que reparte solo tiene como acción legal pujar el As

### Requirement: Llamada y compañero oculto
Quien gana la subasta MUST nombrar un palo. La carta llamada MUST ser la de su puja (un 2 en las pujas de puntos) de ese palo, y ese palo MUST ser el triunfo de la mano. La carta llamada y el triunfo MUST verse en la vista de todos.

Quien tiene la carta llamada MUST ser el compañero del llamador. Hasta que se juega la carta llamada, la vista de los demás MUST NOT decir quién es el compañero; la del compañero sí lo dice.

Si el llamador nombra el palo de una carta que tiene él mismo, MUST jugar solo contra los otros cuatro; los demás MUST NOT saberlo hasta que la juega.

#### Scenario: Compañero secreto
- **WHEN** el llamador llama el Rey de oros y lo tiene el asiento 3
- **THEN** el asiento 3 ve que es el compañero, y los asientos 1, 2 y 4 no saben quién lo es

#### Scenario: Se descubre el compañero
- **WHEN** el asiento 3 juega el Rey de oros llamado
- **THEN** todos ven que el asiento 3 es el compañero del llamador

#### Scenario: Llamar una carta propia
- **WHEN** el llamador tiene el 3 de copas y llama el 3 de copas
- **THEN** juega solo contra los otros cuatro

### Requirement: Bazas de la Briscola Chiamata
Se juegan 8 bazas; en la primera sale el siguiente al que reparte, y en las demás quien ganó la anterior. Cada jugador MUST poder echar cualquier carta de su mano: no hay obligación de seguir el palo ni de fallar. La baza MUST ganarla el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida.

#### Scenario: Libertad para echar
- **WHEN** sale una copa y el jugador tiene copas
- **THEN** puede echar también cualquier otra carta de su mano

#### Scenario: El triunfo gana
- **WHEN** con triunfo de oros, sale el As de copas y otro jugador echa el 2 de oros
- **THEN** el 2 de oros va ganando la baza

### Requirement: Puntuación y partida de la Briscola Chiamata
Al acabar la mano, el bando del llamador (el llamador y su compañero, o el llamador solo) MUST sumar los puntos de sus bazas. Si llega a lo que pidió la puja (61, o los puntos pujados), la mano está ganada; si no, perdida.

Los puntos de partida de la mano MUST ser:
- con compañero: el llamador +2, el compañero +1 y cada defensor −1 si la gana; al revés (−2, −1 y +1) si la pierde;
- solo: el llamador +4 y cada defensor −1 si la gana; al revés si la pierde.

La partida MUST durar 5 manos. Al acabar, gana el jugador con más puntos de partida, o empatan los que más tienen.

#### Scenario: Mano ganada con compañero
- **WHEN** el llamador pujó el As y su bando suma 70 puntos
- **THEN** el llamador gana 2 puntos de partida, su compañero 1 y los otros tres pierden 1 cada uno

#### Scenario: 60 puntos no bastan
- **WHEN** el bando del llamador suma 60 puntos con una puja de carta
- **THEN** la mano está perdida: el llamador pierde 2, su compañero 1 y los otros tres ganan 1

#### Scenario: Mano ganada solo
- **WHEN** el llamador juega solo y suma 75 puntos con una puja de «2 con 75»
- **THEN** gana 4 puntos de partida y los otros cuatro pierden 1 cada uno

#### Scenario: Fin de la partida
- **WHEN** termina la quinta mano
- **THEN** la partida acaba y gana el jugador con más puntos de partida

### Requirement: Vista del jugador en la Briscola Chiamata
La vista de cada jugador MUST mostrar su mano, cuántas cartas tiene cada uno, lo que ha pujado cada uno, quién ganó la subasta, la puja, la carta llamada y el triunfo, la baza en curso y la última baza, los puntos que lleva cada jugador en la mano, los puntos de partida de cada uno y el resumen de las manos acabadas.

La vista MUST NOT mostrar las manos ajenas. El compañero MUST verse solo en la vista del propio compañero, en la del llamador cuando juega solo, o en la de todos desde que se juega la carta llamada.

#### Scenario: Sin manos ajenas
- **WHEN** un jugador pide su vista durante las bazas
- **THEN** ve sus cartas y solo cuántas tienen los demás
