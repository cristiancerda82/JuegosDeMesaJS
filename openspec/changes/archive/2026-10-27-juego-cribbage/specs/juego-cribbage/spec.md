## ADDED Requirements

### Requirement: Reparto, crib y corte del Cribbage
El Cribbage MUST jugarse con 2 jugadores y la baraja francesa de 52 cartas. En cada mano, el repartidor MUST dar 6 cartas a cada uno, y cada jugador MUST echar 2 de ellas al *crib*, que es del repartidor. Empieza descartándose el que no reparte. Después MUST descubrirse la carta de arriba del mazo (el *starter*); si es una J, el repartidor suma 2 puntos. El repartidor MUST alternarse cada mano.

#### Scenario: Echar al crib
- **WHEN** los dos jugadores echan 2 cartas cada uno
- **THEN** cada uno se queda con 4, el crib tiene 4 y se descubre el starter

#### Scenario: La J de starter
- **WHEN** el starter es la J de tréboles
- **THEN** el repartidor suma 2 puntos

### Requirement: Juego de las cartas del Cribbage
Tras el corte, los jugadores MUST jugar sus cartas por turnos, empezando por el que no reparte. La cuenta suma el valor de cada carta jugada (el As 1, del 2 al 10 su número, las figuras 10) y no puede pasar de 31. Quien juega una carta MUST sumar:
- 2 si la cuenta llega a 15;
- 2 si llega a 31;
- por las últimas cartas jugadas desde que la cuenta empezó: 2 si su carta forma pareja con la anterior, 6 si forma trío y 12 si forma póker;
- si las últimas 3 o más cartas, en cualquier orden, forman una escalera, 1 punto por carta de la escalera más larga.

Quien no tiene ninguna carta que quepa MUST decir «go». El otro sigue jugando mientras pueda; cuando ninguno puede, el último que jugó suma 1, salvo que la cuenta sea 31. Entonces la cuenta vuelve a 0 y sale el otro jugador. La última carta de la mano MUST sumar 1, salvo que llegue a 31.

#### Scenario: Quince
- **WHEN** la cuenta es 10 y el jugador juega un 5
- **THEN** suma 2 y la cuenta es 15

#### Scenario: Pareja y trío
- **WHEN** se juegan seguidos un 7, otro 7 y otro 7
- **THEN** el segundo suma 2 por la pareja y el tercero 6 por el trío

#### Scenario: Escalera en desorden
- **WHEN** se juegan seguidos un 4, un 6 y un 5
- **THEN** quien juega el 5 suma 3 por la escalera

#### Scenario: Go
- **WHEN** la cuenta es 28, al jugador solo le quedan cartas de 4 o más y dice «go», y al otro tampoco le cabe ninguna
- **THEN** el otro, que jugó la última carta, suma 1 y la cuenta vuelve a 0

### Requirement: Recuento del Cribbage
Al terminar de jugar las cartas, MUST contarse, con el starter como quinta carta y en este orden: la mano del que no reparte, la del repartidor y el crib del repartidor. Cada una suma:
- **quinces:** 2 por cada combinación de cartas que suma 15;
- **parejas:** 2 por cada pareja de cartas del mismo número;
- **escaleras:** cada escalera de 3 o más números seguidos suma 1 por carta, y se cuenta tantas veces como combinaciones distintas de cartas la forman;
- **color:** en una mano, 4 si las 4 cartas son del mismo palo y 5 si también lo es el starter; en el crib, 5 solo si lo son las 5;
- **nobs:** 1 si tiene la J del palo del starter.

El resultado de la mano MUST guardar el desglose de cada recuento y los puntos que sumó cada jugador al jugar las cartas.

#### Scenario: Una mano de 29
- **WHEN** la mano es tres 5 y la J de picas, y el starter es el 5 de picas
- **THEN** suma 29

#### Scenario: Escalera doble
- **WHEN** la mano es 3, 4, 5, 5 y el starter es un K
- **THEN** suma 12: 4 por los dos quinces (cada 5 con el K), 2 por la pareja y 6 por las dos escaleras de 3

#### Scenario: Color en el crib
- **WHEN** las 4 cartas del crib son de corazones y el starter es de picas
- **THEN** el crib no suma por color

### Requirement: Partida del Cribbage
La partida MUST terminar en cuanto un jugador llega a 121 puntos o más, en cualquier momento: al cortar, al jugar las cartas o en cualquiera de los recuentos, en su orden. Gana ese jugador.

#### Scenario: Gana contando primero
- **WHEN** los dos están a 118 y el que no reparte suma 4 al contar su mano
- **THEN** la partida termina y gana él, sin contar la mano del repartidor

### Requirement: Vista del jugador en el Cribbage
Cada jugador MUST ver:
- su mano, y las cartas que echó al crib;
- cuántas cartas tiene el otro y cuántas hay en el crib;
- quién reparte, la fase y el starter cuando se ha descubierto;
- la cuenta, las cartas jugadas desde que empezó y todas las jugadas en la mano;
- quién ha dicho «go» y la última acción con los puntos que sumó;
- los puntos de cada uno y el resultado de las manos anteriores, con las manos y el crib descubiertos.

La mano del otro, sus cartas del crib y el mazo MUST quedar ocultos hasta el recuento.

#### Scenario: Mano ajena oculta
- **WHEN** se pide la vista de un jugador mientras se juegan las cartas
- **THEN** no contiene ninguna carta de la mano del otro, ni del crib que echó, ni del mazo
