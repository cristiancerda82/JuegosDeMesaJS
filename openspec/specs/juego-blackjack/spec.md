# juego-blackjack Specification

## Purpose
TBD - created by archiving change juego-blackjack. Update Purpose after archive.

## Requirements

### Requirement: Jugadores, fichas y manos del Blackjack
La partida MUST admitir de 1 a 4 jugadores (2 por defecto) contra la banca, que juega la máquina con las reglas de esta spec y no ocupa ningún asiento. Cada jugador MUST empezar con 100 fichas. La partida dura un número de manos de la configuración: 5, 10 o 20 (10 por defecto). Un jugador que al empezar una mano tiene menos de 2 fichas no juega esa mano ni las siguientes.

#### Scenario: Empezar el Blackjack
- **WHEN** empieza una partida de 3 jugadores
- **THEN** cada uno tiene 100 fichas y le toca apostar al asiento 0

### Requirement: Apuesta en el Blackjack
Al empezar cada mano, cada jugador que juega MUST apostar, por turno desde el asiento 0, un número par de fichas entre 2 y 20, sin pasar de sus fichas. Las apuestas MUST ser visibles para todos. Cuando han apostado todos, se reparte.

#### Scenario: Apuesta limitada por las fichas
- **WHEN** un jugador con 7 fichas va a apostar
- **THEN** solo puede apostar 2, 4 o 6 fichas

### Requirement: Reparto y valores del Blackjack
En cada mano se MUST barajar una baraja francesa completa de 52 cartas. Cada jugador recibe dos cartas boca arriba; la banca, una boca arriba y otra boca abajo, que nadie ve hasta que la descubre.

Del 2 al 10, cada carta vale su número; la J, la Q y la K valen 10; el As vale 11 o 1, lo que más convenga sin pasar de 21. Una mano es **blanda** si cuenta un As como 11. Un As y una carta de 10 como dos primeras cartas de una mano sin separar son **blackjack**.

#### Scenario: El As que se ajusta
- **WHEN** un jugador tiene un As, un 6 y un 9
- **THEN** su mano vale 16, contando el As como 1

#### Scenario: Blackjack
- **WHEN** las dos primeras cartas de un jugador son un As y una Q
- **THEN** tiene blackjack

### Requirement: Blackjack de la banca
Tras el reparto, si la carta visible de la banca es un As o vale 10, la banca MUST mirar su carta tapada. Si tiene blackjack, la descubre y la mano termina sin que jueguen los jugadores: quien también tenga blackjack recupera su apuesta y los demás la pierden.

#### Scenario: La banca tiene blackjack
- **WHEN** la banca muestra un As, tiene una K tapada y un jugador tiene 20
- **THEN** la mano termina, la banca descubre su blackjack y el jugador pierde su apuesta

### Requirement: Turno de los jugadores en el Blackjack
Por turnos desde el asiento 0, cada jugador MUST jugar su mano:
- **Pedir:** recibe una carta boca arriba y sigue en su turno. Si pasa de 21, pierde su apuesta y su mano termina. Si llega a 21, se planta solo.
- **Plantarse:** su mano termina.
- **Doblar:** solo con las dos primeras cartas de una mano y si le quedan fichas para cubrir otra apuesta igual. Dobla la apuesta, recibe exactamente una carta más y su mano termina.
- **Separar:** solo con las dos primeras cartas, si son del mismo valor (dos cartas de 10 cuentan como del mismo valor), si no ha separado ya en esta mano y si le quedan fichas para otra apuesta igual. Las dos cartas pasan a ser dos manos con una apuesta igual cada una; cada mano recibe una segunda carta y se juegan una tras otra. Los ases separados reciben una sola carta cada uno y se plantan solos. Después de separar no se puede doblar.

Un jugador con blackjack no juega: se planta solo.

#### Scenario: Pasarse
- **WHEN** un jugador con 15 pide y le sale una Q
- **THEN** su mano vale 25, pierde su apuesta y le toca al siguiente

#### Scenario: Doblar
- **WHEN** un jugador con 11 y una apuesta de 10 dobla
- **THEN** su apuesta pasa a 20, recibe una sola carta y su turno termina

#### Scenario: Separar ochos
- **WHEN** un jugador con dos ochos y una apuesta de 10 separa
- **THEN** juega dos manos, cada una con un 8, una carta nueva y una apuesta de 10, primero una y luego la otra

#### Scenario: Doblar sin fichas
- **WHEN** un jugador con 11, una apuesta de 10 y 14 fichas quiere doblar
- **THEN** doblar no es una acción legal

### Requirement: Juego de la banca y pago
Cuando han jugado todos, la banca MUST descubrir su carta tapada y pedir mientras su mano valga 16 o menos; con 17 o más se planta, también con un 17 blando. Si todas las manos de los jugadores se han pasado, la banca no pide.

Después se MUST liquidar cada mano que no se pasó:
- si la banca se pasó o la mano vale más que la banca, el jugador gana lo apostado;
- si la mano es un blackjack y la banca no tiene blackjack, gana 3 por cada 2 apostadas;
- si valen lo mismo, recupera su apuesta;
- si vale menos, la pierde.

Una mano separada que suma 21 con dos cartas vale 21, no es blackjack. El resultado de la mano (cartas de la banca y de cada mano, apuestas, ganancias y fichas de cada jugador) MUST quedar a la vista de todos. Si la partida no ha terminado, empieza la siguiente mano.

#### Scenario: La banca se pasa
- **WHEN** la banca tiene 16, pide, le sale un 8 y un jugador se plantó con 13
- **THEN** la banca se pasa con 24 y el jugador gana lo apostado

#### Scenario: Blackjack paga 3 a 2
- **WHEN** un jugador con una apuesta de 10 tiene blackjack y la banca termina con 20
- **THEN** el jugador gana 15 fichas

#### Scenario: Empate
- **WHEN** un jugador se planta con 19 y la banca termina con 19
- **THEN** el jugador recupera su apuesta, sin ganar ni perder

#### Scenario: Banca con 17 blando
- **WHEN** la banca tiene un As y un 6
- **THEN** se planta con 17

### Requirement: Fin del Blackjack
La partida MUST terminar al acabar la última mano de la configuración, o antes si ningún jugador puede apostar. Con varios jugadores gana quien más fichas tenga (si empatan, ganan todos los empatados). Jugando solo, gana si termina con más de 100 fichas, empata con 100 y pierde con menos. El resultado MUST registrar las fichas de cada jugador.

#### Scenario: Gana quien más fichas tiene
- **WHEN** acaba la última mano con 130 fichas para el asiento 0 y 85 para el asiento 1
- **THEN** gana el asiento 0

#### Scenario: Jugando solo
- **WHEN** un jugador solo acaba la partida con 96 fichas
- **THEN** la partida cuenta como perdida

### Requirement: Vista del jugador en el Blackjack
Cada jugador MUST ver:
- las fichas y la apuesta de cada jugador;
- las cartas de todas las manos de los jugadores, que están boca arriba, y su valor;
- la carta visible de la banca y, solo cuando se descubre, la tapada;
- la fase (apuesta, juego o fin de la mano), de quién es el turno y qué mano juega;
- cuántas manos van y cuántas quedan;
- los resultados de las manos terminadas.

La carta tapada de la banca y el orden de la baraja MUST quedar ocultos hasta que se descubren.

#### Scenario: La carta tapada no se ve
- **WHEN** un jugador pide su vista durante el turno de los jugadores
- **THEN** ve la carta visible de la banca, pero no la tapada
