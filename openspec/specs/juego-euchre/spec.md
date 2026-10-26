# juego-euchre Specification

## Purpose
TBD - created by archiving change juego-euchre. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Euchre
El Euchre MUST jugarse con 4 jugadores en dos parejas (0 y 2 contra 1 y 3) y la baraja francesa de 24 cartas, del 9 al As de cada palo. En cada mano, el repartidor MUST dar 5 cartas a cada jugador y poner boca arriba la primera de las 4 que sobran: la *carta vuelta*. Las otras 3 quedan ocultas y no se juegan. El repartidor MUST rotar cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 5 cartas y hay una carta vuelta a la vista

### Requirement: Elegir el triunfo en el Euchre
La elección del triunfo MUST hacerse en dos vueltas, empezando por el jugador a la izquierda del repartidor:
- **Primera vuelta:** cada jugador MAY *pedir* el palo de la carta vuelta, o pasar. Si alguien lo pide, ese palo es el triunfo, y el repartidor MUST añadir la carta vuelta a su mano y descartarse de una carta cualquiera.
- **Segunda vuelta:** si todos pasan, cada jugador MAY nombrar un palo distinto del de la carta vuelta, o pasar. Si alguien lo nombra, ese palo es el triunfo.
- **Sin triunfo:** si todos pasan en las dos vueltas, la mano se anula y MUST repartirse otra con el siguiente repartidor.

Quien pide o nombra el triunfo es el *que elige*, y su pareja la *que elige*.

#### Scenario: Pedir la carta vuelta
- **WHEN** la carta vuelta es el 10 de corazones y el primer jugador la pide
- **THEN** el triunfo es corazones, y el repartidor tiene 6 cartas hasta que se descarta de una

#### Scenario: Nombrar en la segunda vuelta
- **WHEN** todos pasan en la primera vuelta con la carta vuelta de corazones
- **THEN** en la segunda vuelta se puede nombrar picas, diamantes o tréboles, pero no corazones

#### Scenario: Todos pasan dos veces
- **WHEN** los 4 pasan en las dos vueltas
- **THEN** se reparte una mano nueva y el repartidor es el siguiente

### Requirement: Jugar solo en el Euchre
Al pedir o nombrar el triunfo, el jugador MAY elegir jugar solo. Entonces su compañero MUST dejar la mano: no juega ninguna baza, y las bazas son de 3 cartas. Si el compañero que deja la mano es el repartidor, no recoge la carta vuelta.

#### Scenario: Jugar solo
- **WHEN** un jugador pide el triunfo jugando solo
- **THEN** su compañero no juega en ninguna baza de la mano

### Requirement: Orden de las cartas del Euchre
En el palo del triunfo, el orden MUST ser, de mayor a menor:
- la J del triunfo (*bower derecho*);
- la J del otro palo del mismo color (*bower izquierdo*), que MUST contar como del palo del triunfo a todos los efectos;
- A, K, Q, 10 y 9.

En los demás palos, el orden MUST ser A, K, Q, J, 10 y 9.

#### Scenario: El bower izquierdo
- **WHEN** el triunfo es corazones
- **THEN** la J de diamantes es triunfo, gana al As de corazones y pierde contra la J de corazones

### Requirement: Bazas del Euchre
La primera baza la MUST abrir el jugador a la izquierda del repartidor (o el siguiente, si ese deja la mano), y cada baza siguiente, quien ganó la anterior. Cada jugador MUST seguir el palo de salida si tiene, contando el bower izquierdo como del triunfo. La baza la gana el triunfo más alto o, si no hay ninguno, la carta más alta del palo de salida.

#### Scenario: El bower izquierdo obliga como triunfo
- **WHEN** el triunfo es corazones, sale un triunfo y el jugador solo tiene de corazones la J de diamantes
- **THEN** tiene que jugar la J de diamantes

#### Scenario: Salir de diamantes con el bower izquierdo en la mano
- **WHEN** el triunfo es corazones, se sale de diamantes y el jugador solo tiene de diamantes la J
- **THEN** puede jugar cualquier carta, porque la J de diamantes es triunfo

### Requirement: Puntos y partida del Euchre
Al terminar las 5 bazas, MUST puntuarse:
- la pareja que eligió, si hace 3 o 4 bazas: 1 punto;
- si hace las 5: 2 puntos, o 4 si quien eligió jugaba solo;
- si hace menos de 3: 2 puntos para los rivales (*euchre*).

La partida MUST terminar cuando una pareja llega a 10 puntos, y la gana esa pareja.

#### Scenario: Euchre
- **WHEN** la pareja que eligió el triunfo hace 2 bazas
- **THEN** los rivales suman 2 puntos

#### Scenario: Las cinco jugando solo
- **WHEN** quien eligió jugando solo hace las 5 bazas
- **THEN** su pareja suma 4 puntos

### Requirement: Vista del jugador en el Euchre
Cada jugador MUST ver:
- su mano y cuántas cartas tienen los demás;
- la carta vuelta mientras se elige el triunfo, y quién ha pasado;
- el triunfo, quién lo eligió y si juega solo;
- la baza en curso, la última baza y las bazas de cada uno;
- los puntos de cada pareja y el resultado de las manos anteriores.

Las manos ajenas, las 3 cartas ocultas y la carta que descartó el repartidor MUST quedar ocultas, salvo para él su propio descarte.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás ni de las ocultas
