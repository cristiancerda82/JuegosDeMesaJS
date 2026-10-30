## ADDED Requirements

### Requirement: Baraja y reparto del Doppelkopf
El Doppelkopf MUST jugarse entre 4 con 48 cartas: el A, 10, K, Q, J y 9 de cada palo francés, con dos copias de cada carta. Los valores MUST ser A 11, 10 10, K 4, Q 3, J 2 y 9 0, y suman 240 en total. En cada mano, cada jugador MUST recibir 12 cartas. El repartidor de la primera mano es el jugador 3; en cada mano pasa al siguiente. Sale el jugador a la izquierda del repartidor.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 12 cartas y no queda mazo

#### Scenario: Salida
- **WHEN** empieza la primera mano
- **THEN** reparte el jugador 3 y sale el jugador 0

### Requirement: Triunfos del Doppelkopf
En el juego normal, en la boda y en el solo de triunfo, los triunfos MUST ser, de mayor a menor: el 10 de corazones; la Q de tréboles, picas, corazones y diamantes; la J de tréboles, picas, corazones y diamantes; y el A, 10, K y 9 de diamantes. Los palos normales MUST ser tréboles y picas (A, 10, K y 9) y corazones (A, K y 9).

En el solo de Damas, solo las 8 Damas MUST ser triunfo (tréboles, picas, corazones, diamantes); en el solo de Jotas, solo las 8 Jotas, en el mismo orden. En esos dos solos, los cuatro palos son palos normales con el orden A, 10, K, J y 9 en el solo de Damas, y A, 10, K, Q y 9 en el solo de Jotas.

#### Scenario: El 10 de corazones
- **WHEN** en un juego normal se juegan la Q de tréboles y el 10 de corazones en la misma baza
- **THEN** gana el 10 de corazones

#### Scenario: Los diamantes son triunfo
- **WHEN** en un juego normal salen picas y un jugador sin picas juega el 9 de diamantes
- **THEN** ha fallado con triunfo y gana la baza si nadie juega un triunfo más alto

#### Scenario: Solo de Damas
- **WHEN** en un solo de Damas se juega el 10 de corazones
- **THEN** es una carta del palo de corazones, más baja que el As de corazones

### Requirement: Bazas del Doppelkopf
Cada jugador MUST seguir el palo de salida si puede; los triunfos cuentan como un palo. Si no puede, MAY jugar cualquier carta. La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida. Si dos cartas iguales empatan como las más altas, gana la primera que se jugó. El ganador sale en la siguiente baza.

#### Scenario: Seguir el triunfo
- **WHEN** en un juego normal sale la J de picas y el jugador tiene el 9 de diamantes
- **THEN** está obligado a jugar un triunfo

#### Scenario: Cartas iguales
- **WHEN** en una baza se juegan las dos Q de tréboles y ninguna carta más alta
- **THEN** gana el que jugó la primera

### Requirement: Parejas del Doppelkopf
En el juego normal, los dos jugadores que tienen las Q de tréboles MUST formar el bando Re y los otros dos el bando Contra. Las parejas MUST NOT mostrarse a nadie hasta que se sepan por las cartas jugadas, por los anuncios o al final de la mano. Cada jugador sabe en qué bando está.

#### Scenario: Pareja secreta
- **WHEN** el jugador 0 tiene una Q de tréboles en un juego normal
- **THEN** su vista dice que es del bando Re, pero no quién es su pareja

#### Scenario: Pareja descubierta
- **WHEN** el jugador 2 juega una Q de tréboles
- **THEN** todos los jugadores ven que el jugador 2 es del bando Re

### Requirement: Reservas del Doppelkopf
Antes de la primera baza, cada jugador, empezando por el que sale, MUST decir una vez «sano» o pedir un juego especial:
- **Boda:** solo si tiene las dos Q de tréboles. Si nadie pide un solo, el jugador de la boda juega con el primer jugador que gane una de las tres primeras bazas. Si las gana todas él, juega solo.
- **Solo de Damas, solo de Jotas o solo de triunfo:** juega solo como bando Re contra los otros tres, con los triunfos de ese solo.

El que tiene las dos Q de tréboles MUST NOT decir «sano»: tiene que pedir boda o un solo. Un solo MUST ganar a la boda; entre varios solos, gana el primero que lo pidió. Si todos dicen «sano», se juega el juego normal. Después de las reservas sale el mismo jugador.

#### Scenario: Boda
- **WHEN** el jugador 1 tiene las dos Q de tréboles y pide boda, y el jugador 3 gana la segunda baza después de que el jugador 1 ganara la primera
- **THEN** los jugadores 1 y 3 son el bando Re

#### Scenario: Boda sin pareja
- **WHEN** el jugador de la boda gana las tres primeras bazas
- **THEN** juega solo contra los otros tres

#### Scenario: Solo de Jotas
- **WHEN** el jugador 2 pide un solo de Jotas y nadie antes pidió un solo
- **THEN** el jugador 2 juega solo, y solo las Jotas son triunfo

#### Scenario: Obligado a reservar
- **WHEN** un jugador tiene las dos Q de tréboles
- **THEN** no puede decir «sano»

### Requirement: Anuncios del Doppelkopf
Durante las bazas, en su turno y antes de jugar su carta, un jugador MAY anunciar por su bando. Los anuncios MUST hacerse en este orden, cada uno después del anterior del mismo bando:
1. «Re» (bando Re) o «Contra» (bando Contra): mientras le queden al menos 11 cartas;
2. «no 90»: mientras le queden al menos 10;
3. «no 60»: mientras le queden al menos 9;
4. «no 30»: mientras le queden al menos 8;
5. «negro»: mientras le queden al menos 7.

Cada anuncio MUST ser público y descubrir el bando de quien lo hace. En la boda, MUST NOT haber anuncios hasta que se sepa la pareja, y desde entonces los plazos bajan en tantas cartas como bazas se hayan jugado.

#### Scenario: Anunciar Re
- **WHEN** en su primer turno un jugador con una Q de tréboles anuncia «Re»
- **THEN** todos ven que es del bando Re y la mano vale más

#### Scenario: Fuera de plazo
- **WHEN** a un jugador le quedan 10 cartas y su bando aún no ha anunciado
- **THEN** ya no puede anunciar «Re» ni «Contra»

#### Scenario: Bajada sin anuncio previo
- **WHEN** el bando Contra no ha anunciado «Contra»
- **THEN** ningún jugador de Contra puede anunciar «no 90»

### Requirement: Ganador de la mano del Doppelkopf
Al acabar las 12 bazas, se MUST sumar los puntos de las cartas ganadas por cada bando y decidir el ganador así:
- **Re gana** si llega a su mínimo (121, o 120 si solo anunció el bando Contra) y cumple sus bajadas: Contra con menos de 90, de 60, de 30 o sin bazas, según lo anunciado.
- **Contra gana** si Re no gana y Contra cumple sus propias bajadas.
- Si no gana ninguno, la mano solo cuenta los puntos especiales.

#### Scenario: Re con 121
- **WHEN** nadie anuncia y el bando Re suma 121
- **THEN** gana el bando Re

#### Scenario: Empate a 120
- **WHEN** nadie anuncia y cada bando suma 120
- **THEN** gana el bando Contra

#### Scenario: Bajada fallida
- **WHEN** el bando Re anunció «no 90» y Contra suma 95
- **THEN** gana el bando Contra

### Requirement: Puntos de la mano del Doppelkopf
El bando ganador MUST sumar puntos de partida:
- 1 por ganar;
- 1 por cada umbral que no alcanza el perdedor: menos de 90, menos de 60, menos de 30 y ninguna baza;
- 2 por el anuncio «Re» y 2 por «Contra», los haga quien los haga;
- 1 por cada bajada anunciada por cualquiera de los bandos;
- 1 por cada bajada del rival que no se cumple porque el ganador llega a 120 contra «no 90», a 90 contra «no 60», a 60 contra «no 30» o a 30 contra «negro»;
- 1 «contra los viejos» si gana el bando Contra fuera de los solos.

Fuera de los solos y de la boda sin pareja, cada bando MUST sumar además estos puntos especiales:
- **Zorro:** 1 por ganar una baza con el As de diamantes del bando rival.
- **Doppelkopf:** 1 por ganar una baza que vale 40 puntos o más.
- **Carlitos:** 1 por ganar la última baza con la J de tréboles.

El valor de la mano para el bando Re es sus puntos de partida (positivos si gana, negativos si gana Contra) más sus puntos especiales y menos los de Contra. Cada jugador de Re MUST sumar ese valor, multiplicado por 3 si juega solo, y cada jugador de Contra MUST restarlo. La suma de la mesa es siempre 0.

#### Scenario: Mano sencilla
- **WHEN** nadie anuncia, Re gana con 150 y no hay puntos especiales
- **THEN** cada jugador de Re suma 1 y cada jugador de Contra resta 1

#### Scenario: Con anuncio
- **WHEN** Re anunció «Re», gana con 175, Contra suma 65 y no hay puntos especiales
- **THEN** el valor es 4: 1 por ganar, 1 por menos de 90 y 2 por el «Re»

#### Scenario: Contra los viejos
- **WHEN** gana el bando Contra en un juego normal sin anuncios ni puntos especiales
- **THEN** el valor para Contra es 2

#### Scenario: Zorro
- **WHEN** un jugador de Contra gana una baza en la que un jugador de Re jugó el As de diamantes
- **THEN** el bando Contra suma un punto especial

#### Scenario: Solo
- **WHEN** un jugador gana un solo de triunfo sin anuncios con 130
- **THEN** suma 3 y cada uno de los otros tres resta 1

### Requirement: Ronda de 8 manos del Doppelkopf
La partida MUST durar 8 manos, en las que cada jugador reparte dos veces. Al acabar la octava mano, MUST ganar el jugador con más puntos; si varios empatan, ganan todos ellos.

#### Scenario: Fin de la ronda
- **WHEN** acaba la octava mano
- **THEN** la partida termina y gana el jugador con más puntos

### Requirement: Vista del Doppelkopf
Cada jugador MUST ver:
- su mano y su bando;
- cuántas cartas tiene cada uno;
- las reservas, el tipo de juego y quién juega solo o la boda, y la pareja de la boda cuando se sepa;
- los anuncios de cada uno;
- las bazas jugadas en la mano, con quién salió y la carta de cada uno, y la baza en curso;
- los bandos que ya se saben por las cartas jugadas, los anuncios o las reservas;
- los puntos de cada mano anterior y el marcador.

Cada jugador MUST NOT ver las manos de los demás ni el bando de un jugador que aún no se sabe.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás, pero no cuáles
