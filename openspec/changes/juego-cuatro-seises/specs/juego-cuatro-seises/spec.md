## ADDED Requirements

### Requirement: Barajas, jugadores y reparto del Cuatro seises
El Cuatro seises MUST jugarse con la baraja española de 40 cartas, entre 4, 5 u 8 jugadores, o con la de 48, entre 4, 6 u 8, cada uno contra los demás. En cada mano MUST repartirse toda la baraja, de una en una, empezando por el siguiente al que reparte, de forma que todos tengan las mismas cartas. El que reparte MUST pasar al siguiente en cada mano.

#### Scenario: Cuatro jugadores con la baraja de 40
- **WHEN** empieza una partida de 4 jugadores con la baraja de 40
- **THEN** cada jugador tiene 10 cartas

#### Scenario: Seis jugadores con la baraja de 48
- **WHEN** empieza una partida de 6 jugadores con la baraja de 48
- **THEN** cada jugador tiene 8 cartas, y entre todas están los ochos y los nueves

#### Scenario: Jugadores que no dividen la baraja
- **WHEN** se pide una partida de 6 jugadores con la baraja de 40
- **THEN** no se crea

### Requirement: Jugadas y escaleras del Cuatro seises
Cada palo MUST formar en la mesa una escalera que nace de su 6. El orden de cada escalera MUST ser As, 2, 3, 4, 5, 6, 7, Sota, Caballo y Rey con la baraja de 40, y As, 2… 7, 8, 9, Sota, Caballo y Rey con la de 48.

La mano MUST abrirla quien tenga el 6 de oros, jugándolo. Después, el turno MUST pasar al siguiente, y cada jugador en su turno MUST poner una carta que:
- sea la siguiente por arriba o por abajo de una escalera ya abierta;
- o sea el 6 de un palo que aún no se ha abierto.

Si tiene alguna carta así, MUST jugar una; si no, MUST pasar.

#### Scenario: Abre el 6 de oros
- **WHEN** empieza una mano
- **THEN** le toca a quien tiene el 6 de oros y solo puede jugar esa carta

#### Scenario: Alargar una escalera
- **WHEN** en la mesa solo está el 6 de oros y un jugador tiene el 5 de oros, el 7 de oros, el 6 de copas y el 3 de bastos
- **THEN** puede jugar el 5 de oros, el 7 de oros o el 6 de copas, pero no el 3 de bastos

#### Scenario: Con la baraja de 48, tras el 7 va el 8
- **WHEN** con la baraja de 48 la escalera de oros llega al 7
- **THEN** por arriba se pone el 8 de oros, no la Sota

#### Scenario: Pasar
- **WHEN** a un jugador le toca y no tiene ninguna carta que pueda poner
- **THEN** solo puede pasar

### Requirement: El fondo del Cuatro seises
Al empezar cada mano, cada jugador MUST poner 1 ficha en el fondo. Cada vez que un jugador pasa, MUST poner 1 ficha más. La mano MUST terminar cuando un jugador pone su última carta, y ese jugador MUST llevarse todas las fichas del fondo. El saldo de fichas de cada jugador MUST sumar lo que se lleva y restar lo que ha puesto.

#### Scenario: La cuenta de una mano
- **WHEN** en una mano de 4 jugadores uno se queda sin cartas sin haber pasado, y los otros tres han pasado 2, 0 y 3 veces
- **THEN** el fondo tiene 9 fichas, el ganador suma 8 y los demás restan 3, 1 y 4

### Requirement: Fin de la partida del Cuatro seises
La partida MUST durar 3 manos (por defecto), 1 o 5, según la configuración. Al acabar la última, MUST ganar los jugadores con más fichas.

#### Scenario: Última mano
- **WHEN** termina la tercera mano de una partida de 3
- **THEN** la partida termina y ganan los que tienen más fichas

### Requirement: Vista del jugador del Cuatro seises
La vista de cada jugador MUST mostrar:
- su mano y cuántas cartas tienen los demás;
- las escaleras de la mesa;
- el fondo y los pases de cada jugador en la mano;
- las cartas que se sabe que no tiene cada jugador: las que encajaban en la mesa cuando pasó;
- la última jugada o el último pase;
- los saldos de fichas y los resultados de las manos anteriores.

La vista no MUST mostrar las cartas de las manos de los demás.

#### Scenario: Lo que se sabe de quien pasa
- **WHEN** un jugador pasa cuando en la mesa solo está el 6 de oros
- **THEN** la vista de todos dice que no tiene el 5 ni el 7 de oros, ni el 6 de los otros palos

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** ve su mano, la mesa y el fondo, y solo cuántas cartas tienen los demás
