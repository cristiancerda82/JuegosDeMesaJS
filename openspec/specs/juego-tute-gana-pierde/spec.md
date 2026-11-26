# juego-tute-gana-pierde Specification

## Purpose
TBD - created by archiving change juego-tute-gana-pierde. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Tute gana-pierde
El Tute gana-pierde MUST jugarse entre 3 jugadores, cada uno contra los demás, con la baraja española de 40 cartas sin los doses (36 cartas). En cada mano, el que reparte MUST dar 12 cartas a cada jugador, de tres en tres, empezando por el siguiente a él, sin volver ninguna carta de triunfo. MUST salir el siguiente al que reparte, y el que reparte MUST pasar al siguiente en cada mano.

#### Scenario: Reparto de la primera mano
- **WHEN** empieza una partida
- **THEN** cada jugador tiene 12 cartas, ninguna es un 2, no hay triunfo y sale el siguiente al que reparte

#### Scenario: Cambia el que reparte
- **WHEN** termina una mano y la partida sigue
- **THEN** reparte el siguiente al que repartió y se vuelven a dar 12 cartas a cada uno

### Requirement: Valor y orden de las cartas del Tute gana-pierde
Las cartas de cada palo MUST ordenarse, de mayor a menor, As, Tres, Rey, Caballo, Sota, 7, 6, 5 y 4, y valer 11, 10, 4, 3 y 2 tantos el As, el Tres, el Rey, el Caballo y la Sota; las demás, nada. Quien gana la última baza MUST sumar 10 tantos más (las 10 de últimas).

#### Scenario: El Tres gana al Rey
- **WHEN** en una baza sin triunfo se sale con el Rey de oros y otro jugador echa el Tres de oros
- **THEN** la baza es de quien echó el Tres

#### Scenario: Diez de últimas
- **WHEN** un jugador gana la última baza de la mano
- **THEN** suma 10 tantos además de los de las cartas

### Requirement: Bazas y obligaciones del Tute gana-pierde
Quien gana una baza MUST salir en la siguiente. Al responder, cada jugador MUST:
- asistir al palo de salida y, si puede, superar la carta que va ganando de ese palo;
- sin el palo, si hay triunfo, fallar con un triunfo y, si la baza ya la gana un triunfo, superarlo;
- sin el palo, si la baza la gana un triunfo y no puede superarlo, jugar cualquier carta;
- sin el palo ni triunfos, o sin triunfo en la mano en juego, jugar cualquier carta.

#### Scenario: Asistir y montar
- **WHEN** se sale con el Caballo de copas y un jugador tiene el As y el 4 de copas
- **THEN** solo puede echar el As de copas

#### Scenario: Sin triunfo no hay que fallar
- **WHEN** aún no hay triunfo y un jugador no tiene el palo de salida
- **THEN** puede echar cualquier carta

#### Scenario: Sin poder superar el fallo
- **WHEN** hay triunfo, un jugador no tiene el palo de salida, la baza la gana un triunfo y sus triunfos son menores
- **THEN** puede echar cualquier carta

### Requirement: Triunfo y cantes del Tute gana-pierde
Al empezar la mano no MUST haber triunfo. Cuando una baza tenga el Rey y el Caballo de un mismo palo, quien la gane MUST cantar a la fuerza:
- si aún no hay triunfo, las cuarenta: suma 40 tantos y ese palo es triunfo a partir de la baza siguiente;
- si ya hay triunfo, las veinte: suma 20 tantos en ese palo.

No se MUST poder cantar de otra manera. La mano MAY terminar sin que nazca el triunfo.

#### Scenario: Nace el triunfo
- **WHEN** sin triunfo, en una baza caen el Rey y el Caballo de espadas y la gana el As de espadas
- **THEN** quien echó el As suma 40 tantos de las cuarenta y las espadas son triunfo desde la baza siguiente

#### Scenario: Las veinte
- **WHEN** las espadas son triunfo y en una baza caen el Rey y el Caballo de bastos
- **THEN** quien gana la baza suma 20 tantos de las veinte en bastos

#### Scenario: La baza en que nace el triunfo se juega sin él
- **WHEN** en la baza en la que nace el triunfo de oros un jugador echó un oro sin tener el palo de salida
- **THEN** ese oro no gana la baza

### Requirement: Tantos y penalización del Tute gana-pierde
Al terminar las 12 bazas, cada jugador MUST sumar los tantos de sus cartas, sus cantes y, si las ganó, las 10 de últimas. La penalización MUST ser para quien no ha hecho ni más ni menos tantos que nadie:
- si los tres tienen tantos distintos, para el del medio;
- si dos empatan, para los que no tienen el mínimo: el tercero si tiene más que ellos, o los dos si el tercero tiene menos;
- si los tres empatan, para nadie.

#### Scenario: Pierde el del medio
- **WHEN** un jugador hace 120 tantos, otro ninguno y el tercero 10
- **THEN** la penalización es para el de 10

#### Scenario: Empatan los dos de abajo
- **WHEN** un jugador hace 100 tantos y los otros dos 15 cada uno
- **THEN** la penalización es para el de 100

#### Scenario: Empatan los dos de arriba
- **WHEN** un jugador hace 10 tantos y los otros dos 60 cada uno
- **THEN** la penalización es para los dos de 60

### Requirement: Fin de la partida del Tute gana-pierde
La partida MUST terminar al acabar la mano en la que algún jugador llega al límite de penalizaciones: 6 (por defecto) o 3, según la configuración. MUST ganar los jugadores con menos penalizaciones.

#### Scenario: Llega al límite
- **WHEN** un jugador llega a 6 penalizaciones con el límite de 6
- **THEN** la partida termina y ganan los que tienen menos penalizaciones

### Requirement: Vista del jugador del Tute gana-pierde
La vista de cada jugador MUST mostrar:
- su mano y cuántas cartas tienen los demás;
- la baza en curso, la última baza y las bazas jugadas en la mano, cada una con el triunfo que regía;
- el triunfo, o que aún no lo hay, y los cantes de la mano;
- los tantos y las bazas de cada jugador en la mano;
- las penalizaciones y los resultados de las manos anteriores.

La vista no MUST mostrar las cartas de las manos de los demás.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** ve su mano y solo cuántas cartas tienen los demás
