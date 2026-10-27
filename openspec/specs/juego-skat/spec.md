# juego-skat Specification

## Purpose
TBD - created by archiving change juego-skat. Update Purpose after archive.

## Requirements

### Requirement: Baraja, reparto y posiciones del Skat
El Skat MUST jugarse con 3 jugadores y la baraja francesa de 32 cartas, del 7 al As de cada palo. Las cartas MUST valer As 11, 10 10, K 4, Q 3, J 2 y las demás 0. En cada mano, el repartidor MUST dar 10 cartas a cada jugador y dejar 2 boca abajo: el *Skat*. El jugador a la izquierda del repartidor es *Vorhand*, el siguiente *Mittelhand* y el repartidor *Hinterhand*. El repartidor MUST rotar cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 10 cartas y hay 2 en el Skat

### Requirement: Subasta del Skat
La subasta MUST usar los valores del Skat en orden (18, 20, 22, 23, 24, 27, 30, 33, 35, 36, 40, 44, 45, 46, 48, 50…), y cada puja MUST ser el siguiente valor al último pujado. Se hace así:
1. Mittelhand puja a Vorhand: puja el siguiente valor o pasa. A cada puja, Vorhand acepta o pasa.
2. Cuando uno de los dos pasa, Hinterhand puja de la misma forma al que queda, que acepta o pasa.
3. El que queda es el *solista*, con el último valor pujado o aceptado.
4. Si nadie ha pujado, el que queda MAY jugar con 18 o pasar. Si pasa, la mano se anula y MUST repartirse otra con el siguiente repartidor.

#### Scenario: Gana Vorhand aceptando
- **WHEN** Mittelhand puja 18 y 20, Vorhand acepta las dos y Mittelhand pasa; después Hinterhand pasa
- **THEN** Vorhand es el solista con 20

#### Scenario: Todos pasan
- **WHEN** Mittelhand y Hinterhand pasan sin pujar, y Vorhand también pasa
- **THEN** se reparte una mano nueva con el siguiente repartidor

### Requirement: El Skat y el juego de mano
El solista MUST elegir entre coger el Skat o jugar *de mano*. Si lo coge, MUST descartarse de 2 cartas, que pasan a ser el Skat. Los puntos de las cartas del Skat MUST contar para el solista al final de la mano.

#### Scenario: Coger el Skat
- **WHEN** el solista coge el Skat
- **THEN** tiene 12 cartas hasta que se descarta de 2

### Requirement: Juegos del Skat
El solista MUST declarar uno de estos juegos:
- **de palo** (♣, ♠, ♥ o ♦): los triunfos son, de mayor a menor, J♣, J♠, J♥, J♦ y después A, 10, K, Q, 9, 8 y 7 del palo elegido;
- **Grand:** solo las cuatro J son triunfo, en ese mismo orden;
- **Nulo:** no hay triunfo, el orden de cada palo es A, K, Q, J, 10, 9, 8 y 7, y el solista gana si no hace ninguna baza.

En palo y Grand, los demás palos MUST ordenarse A, 10, K, Q, 9, 8 y 7, y las J MUST contar como del palo del triunfo, nunca del suyo.

Jugando de mano, el solista MAY anunciar en palo o Grand *schneider*, *schwarz* (que incluye schneider) u *ouvert* (que incluye los dos y deja sus cartas a la vista), y en Nulo *ouvert*. Sin jugar de mano, solo MAY anunciar ouvert en Nulo.

#### Scenario: Las J son triunfo
- **WHEN** el juego es de corazones y se sale de picas
- **THEN** quien no tiene más picas que la J de picas puede jugar cualquier carta, porque la J es triunfo

#### Scenario: Nulo ouvert
- **WHEN** el solista declara Nulo ouvert
- **THEN** los demás ven sus cartas durante toda la mano

### Requirement: Bazas del Skat
La primera baza la MUST abrir Vorhand, y cada baza siguiente, quien ganó la anterior. Cada jugador MUST seguir el palo de salida si puede; en palo y Grand, las J cuentan como del triunfo. No hay obligación de fallar ni de ganar. La baza la gana el triunfo más alto o, si no hay ninguno, la carta más alta del palo de salida. En Nulo, si el solista hace una baza, la mano MUST terminar.

#### Scenario: Seguir con una J
- **WHEN** el juego es de tréboles, se sale con la J de diamantes y el jugador tiene tréboles pero no J
- **THEN** tiene que jugar un trébol

### Requirement: Resultado y valor del juego en el Skat
En palo y Grand, el solista MUST ganar si hace al menos 61 puntos contando el Skat, y además cumple lo anunciado: 90 o más con schneider anunciado, y todas las bazas con schwarz u ouvert. Hay *schneider* si el perdedor hace 30 puntos o menos, y *schwarz* si no hace ninguna baza.

El valor de un juego de palo o Grand MUST ser su valor base (♦ 9, ♥ 10, ♠ 11, ♣ 12, Grand 24) por su multiplicador. El multiplicador es la suma de:
- los *matadores*: las J y triunfos seguidos desde el más alto que tiene el solista (*con*), o que le faltan (*sin*), contando su mano y el Skat;
- 1 por el juego;
- 1 por cada uno de estos que se cumpla: mano, schneider, schneider anunciado, schwarz, schwarz anunciado y ouvert.

El valor del Nulo MUST ser 23, 35 de mano, 46 ouvert y 59 ouvert de mano.

Si el valor del juego es menor que lo pujado, el solista MUST perder, y el juego vale el menor múltiplo de su valor base que llega a lo pujado.

#### Scenario: Con dos
- **WHEN** el solista juega de picas con la J de tréboles y la J de picas, sin la J de corazones, coge el Skat y hace 70 puntos
- **THEN** gana un juego que vale 11 × 3 = 33

#### Scenario: Juego de mano con schneider
- **WHEN** el solista juega un Grand de mano sin la J de tréboles y hace 95 puntos
- **THEN** el multiplicador es 1 (sin uno) + 1 (juego) + 1 (mano) + 1 (schneider), y vale 96

#### Scenario: Pasarse en la puja
- **WHEN** el solista pujó 36, juega de diamantes con uno y gana con 70 puntos
- **THEN** pierde, porque su juego vale 18, y el juego cuenta como 36

### Requirement: Puntuación y partida del Skat
Al terminar cada mano, el solista MUST sumar el valor del juego si gana, o restar el doble si pierde. Los otros dos no suman ni restan. La partida MUST durar las rondas elegidas (1, 2 o 3; cada ronda son 3 manos, una por repartidor), sin contar las manos anuladas, y la gana quien más puntos tenga. Si hay empate, ganan todos los que empatan en cabeza.

#### Scenario: Solista que pierde
- **WHEN** el solista pierde un juego que vale 24
- **THEN** resta 48 puntos

#### Scenario: Fin de la partida
- **WHEN** se juega la última mano de la última ronda
- **THEN** la partida termina y gana quien más puntos tiene

### Requirement: Vista del jugador en el Skat
Cada jugador MUST ver:
- su mano y cuántas cartas tienen los demás;
- la subasta: quién puja, a quién y el último valor;
- el solista, si cogió el Skat y el juego y los anuncios declarados;
- la baza en curso, la última baza y las cartas jugadas en la mano;
- las cartas del solista si juega ouvert;
- los puntos de la partida y el resultado de las manos anteriores, con el Skat de cada una.

Las manos ajenas y el Skat MUST quedar ocultos, salvo para el solista el Skat que cogió y su descarte.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de las manos de los demás ni del Skat
