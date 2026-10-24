# juego-rummy-500 Specification

## Purpose
TBD - created by archiving change juego-rummy-500. Update Purpose after archive.

## Requirements

### Requirement: Jugadores y reparto del Rummy 500
El Rummy 500 MUST jugarse de 2 a 4 jugadores (2 por defecto), cada uno por su cuenta, con la baraja francesa de 52 cartas barajada en cada mano. Cada jugador recibe 13 cartas con 2 jugadores y 7 con 3 o 4. La siguiente carta se pone boca arriba y empieza el descarte; el resto forma el mazo. La primera mano la reparte el último asiento, así que empieza el asiento 0; después el reparto pasa al siguiente jugador.

#### Scenario: Reparto con 2 jugadores
- **WHEN** empieza una partida de 2 jugadores
- **THEN** cada uno tiene 13 cartas, el descarte 1 carta, el mazo 25 y le toca robar al asiento 0

#### Scenario: Reparto con 4 jugadores
- **WHEN** empieza una partida de 4 jugadores
- **THEN** cada uno tiene 7 cartas, el descarte 1 carta y el mazo 23

### Requirement: Robar en el Rummy 500
El descarte MUST estar abierto: todas sus cartas se ven, en orden. En su turno, cada jugador MUST empezar robando:
- la carta de arriba del mazo; o
- una carta cualquiera del descarte junto con todas las que tiene encima.

Si coge más de una carta del descarte, la de más abajo es **obligada**: MUST usarla en ese mismo turno, bajándola en una combinación o añadiéndola a una de la mesa, antes de descartar. Mientras la obligada esté pendiente, lo primero que baje o añada MUST incluirla, para que nunca se quede sin poder usarla. Solo se puede coger desde una carta si con ella y las de la mano se puede cumplir esa obligación. Si coge solo la de arriba del descarte, no tiene obligación, pero MUST NOT descartarla en ese mismo turno.

#### Scenario: Coger varias del descarte
- **WHEN** el descarte tiene, de abajo arriba, el 7 de picas, la K de corazones y el 2 de tréboles, y un jugador con el 8 y el 9 de picas coge desde el 7 de picas
- **THEN** se lleva las tres cartas y no puede descartar hasta bajar o añadir el 7 de picas

#### Scenario: Una carta que no se puede usar
- **WHEN** un jugador no puede usar el 5 de diamantes ni con su mano ni en la mesa, y el 5 tiene otras cartas encima en el descarte
- **THEN** coger desde el 5 de diamantes no es una acción legal

#### Scenario: No devolver la carta de arriba
- **WHEN** un jugador coge solo la carta de arriba del descarte, la J de tréboles
- **THEN** descartar la J de tréboles no es una acción legal en ese turno

### Requirement: Combinaciones del Rummy 500
Las combinaciones MUST ser de uno de estos tipos:
- **Grupo:** 3 o 4 cartas del mismo número.
- **Escalera:** 3 o más cartas seguidas del mismo palo. El As va abajo (A-2-3) o arriba (Q-K-A), pero una escalera no da la vuelta: K-A-2 no es escalera.

Las combinaciones bajadas MUST estar a la vista de todos, con quién puso cada carta.

#### Scenario: As arriba
- **WHEN** un jugador baja la Q, la K y el As de corazones
- **THEN** es una escalera válida

#### Scenario: Sin vuelta
- **WHEN** un jugador intenta bajar la K, el As y el 2 de picas
- **THEN** no es una combinación válida

### Requirement: Bajar, añadir y descartar en el Rummy 500
Tras robar, el jugador MAY, en cualquier orden y tantas veces como quiera:
- **bajar** una combinación nueva con cartas de su mano;
- **añadir** una carta de su mano a cualquier combinación de la mesa, propia o ajena: a un grupo de 3, la cuarta carta de ese número; a una escalera, la carta que la alarga por uno de sus extremos (el As solo por abajo junto a un 2 o por arriba junto a una K).

Después MUST descartar una carta, que pasa encima del descarte, y el turno pasa al siguiente jugador. Bajar o añadir MUST NOT dejarle sin cartas en la mano: siempre tiene que quedarle una que pueda descartar (no vale que solo le quede la que acaba de coger de arriba del descarte).

#### Scenario: Añadir a la combinación de un rival
- **WHEN** un rival tiene en la mesa la escalera 4-5-6 de corazones y el jugador tiene el 7 de corazones
- **THEN** puede añadirlo, y esa carta cuenta para el jugador

#### Scenario: Siempre queda una para descartar
- **WHEN** a un jugador le quedan tres cartas que forman un grupo
- **THEN** no puede bajarlas, porque se quedaría sin carta para descartar

### Requirement: Fin de la mano y puntos del Rummy 500
La mano MUST terminar cuando un jugador descarta su última carta, o cuando a un jugador le toca robar y el mazo está vacío.

Al terminar, cada jugador MUST sumar los puntos de las cartas que ha puesto en la mesa en esa mano (bajadas y añadidas) y restar los de las cartas que le quedan en la mano:
- el As vale 15, salvo cuando está en una escalera A-2-3 (abajo), donde vale 1;
- del 2 al 10, su número;
- la J, la Q y la K valen 10.

El resultado de la mano (quién cerró, si alguien cerró, y de cada jugador lo bajado, lo que le quedó en la mano, los puntos de la mano y el total) MUST quedar a la vista de todos.

#### Scenario: Puntos de la mano
- **WHEN** un jugador ha bajado el grupo de sietes (21) y la escalera A-2-3 de picas (6), y le queda en la mano la K de diamantes
- **THEN** suma 27 − 10 = 17 puntos en la mano

#### Scenario: El As arriba vale 15
- **WHEN** un jugador ha bajado la escalera Q-K-A de tréboles
- **THEN** esa escalera le suma 35 puntos

#### Scenario: Mazo agotado
- **WHEN** a un jugador le toca robar y el mazo está vacío
- **THEN** la mano termina sin que nadie cierre y se puntúa igual

### Requirement: Partida a 500
Tras cada mano, si algún jugador tiene 500 puntos o más, la partida MUST terminar y gana quien más puntos tenga. Si los que más tienen empatan, se MUST jugar otra mano. Los puntos pueden ser negativos.

#### Scenario: Ganar a 500
- **WHEN** tras una mano un jugador tiene 512 y el otro 430
- **THEN** la partida termina y gana el de 512

#### Scenario: Empate arriba
- **WHEN** tras una mano los dos jugadores tienen 505
- **THEN** se juega otra mano

### Requirement: Vista del jugador del Rummy 500
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- el número de cartas del mazo y todas las del descarte, en orden;
- las combinaciones de la mesa con quién puso cada carta;
- la carta obligada pendiente, si la hay, y la cogida de arriba del descarte que no se puede soltar;
- la fase del turno y a quién le toca;
- los puntos de cada uno y los resultados de las manos anteriores.

MUST NOT mostrar las cartas en mano de los demás ni el orden del mazo.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás ni del mazo
