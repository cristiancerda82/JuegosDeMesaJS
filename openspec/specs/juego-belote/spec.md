# juego-belote Specification

## Purpose
TBD - created by archiving change juego-belote. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Belote
El Belote MUST jugarse con 4 jugadores en dos parejas (0 y 2 contra 1 y 3) y la baraja francesa de 32 cartas, del 7 al As de cada palo. En cada mano, el repartidor MUST dar 5 cartas a cada jugador y poner boca arriba la siguiente: la *carta vuelta*. Las otras 11 quedan en el mazo, ocultas. El repartidor MUST rotar cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 5 cartas, hay una carta vuelta a la vista y quedan 11 en el mazo

### Requirement: Elegir el triunfo en el Belote
La elección del triunfo MUST hacerse en dos vueltas, empezando por el jugador a la izquierda del repartidor:
- **Primera vuelta:** cada jugador MAY *tomar* el palo de la carta vuelta, o pasar. Si alguien lo toma, ese palo es el triunfo.
- **Segunda vuelta:** si todos pasan, cada jugador MAY nombrar un palo distinto del de la carta vuelta, o pasar. Si alguien lo nombra, ese palo es el triunfo.
- **Sin triunfo:** si todos pasan en las dos vueltas, la mano se anula y MUST repartirse otra con el siguiente repartidor.

En cuanto alguien elige el triunfo, quien lo eligió MUST llevarse la carta vuelta y 2 cartas del mazo, y cada uno de los demás 3. Todos MUST acabar con 8 cartas.

#### Scenario: Tomar la carta vuelta
- **WHEN** la carta vuelta es el 10 de corazones y el primer jugador la toma
- **THEN** el triunfo es corazones, ese jugador tiene el 10 de corazones en la mano y los cuatro tienen 8 cartas

#### Scenario: Nombrar en la segunda vuelta
- **WHEN** todos pasan en la primera vuelta con la carta vuelta de corazones
- **THEN** en la segunda vuelta se puede nombrar picas, diamantes o tréboles, pero no corazones

#### Scenario: Todos pasan dos veces
- **WHEN** los 4 pasan en las dos vueltas
- **THEN** se reparte una mano nueva y el repartidor es el siguiente

### Requirement: Orden y valor de las cartas del Belote
En el palo del triunfo, el orden MUST ser, de mayor a menor, J, 9, A, 10, K, Q, 8 y 7, y sus valores 20, 14, 11, 10, 4, 3, 0 y 0. En los demás palos, el orden MUST ser A, 10, K, Q, J, 9, 8 y 7, y sus valores 11, 10, 4, 3, 2, 0, 0 y 0. Las cartas de una mano suman 152 puntos.

#### Scenario: El 9 del triunfo
- **WHEN** el triunfo es picas
- **THEN** el 9 de picas gana al As de picas y pierde contra la J de picas

### Requirement: Bazas del Belote
La primera baza la MUST abrir el jugador a la izquierda del repartidor, y cada baza siguiente, quien ganó la anterior. Al jugar, MUST cumplirse:
- **Seguir el palo:** si se tiene el palo de salida, hay que jugarlo.
- **Montar en el triunfo:** si se sale de triunfo, hay que jugar uno más alto que el más alto de la baza si se puede.
- **Fallar:** si no se tiene el palo de salida, hay que jugar triunfo, salvo que la baza vaya ganándola el compañero, que entonces se puede jugar cualquier carta.
- **Montar al fallar:** si hay que jugar triunfo y la baza ya tiene alguno, hay que jugar uno más alto si se puede; si no, cualquier triunfo.

La baza la gana el triunfo más alto o, si no hay ninguno, la carta más alta del palo de salida.

#### Scenario: Montar cuando se sale de triunfo
- **WHEN** el triunfo es corazones, se sale con el As de corazones y el jugador tiene la J y el 8 de corazones
- **THEN** tiene que jugar la J de corazones

#### Scenario: Fallar si no se tiene el palo
- **WHEN** se sale de picas, la baza la va ganando un rival y el jugador no tiene picas pero sí triunfos
- **THEN** tiene que jugar un triunfo

#### Scenario: El compañero va ganando
- **WHEN** se sale de picas, la baza la va ganando su compañero y el jugador no tiene picas
- **THEN** puede jugar cualquier carta

### Requirement: Belote-rebelote
El jugador que tiene el rey y la dama del triunfo MUST anunciar «Belote» al jugar la primera de las dos y «Rebelote» al jugar la segunda. Al jugar la segunda, su pareja MUST sumar 20 puntos en la mano. El anuncio es automático.

#### Scenario: Belote y rebelote
- **WHEN** un jugador con el rey y la dama del triunfo juega las dos en la mano
- **THEN** se anuncia «Belote» con la primera y «Rebelote» con la segunda, y su pareja suma 20

### Requirement: Puntos y partida del Belote
Al terminar las 8 bazas, cada pareja MUST sumar el valor de las cartas de sus bazas, la última baza 10 más (*diez de últimas*) y el belote si lo tuvo. Entonces:
- si la pareja que eligió el triunfo hizo más puntos que la otra, o los mismos, cada pareja se apunta los suyos;
- si hizo menos (*dentro*), la otra pareja se apunta 162 y el belote se lo apunta la pareja que lo tuvo;
- si una pareja hizo las 8 bazas (*capot*), se apunta 252 en lugar de 162, más el belote que tuviera cada una.

La partida MUST terminar al acabar una mano en la que alguna pareja llegue a 501 puntos, y la gana la que tenga más. Con empate, se juega otra mano.

#### Scenario: La pareja que toma cumple
- **WHEN** la pareja que eligió el triunfo hace 92 puntos de cartas y la otra 70
- **THEN** cada pareja se apunta sus puntos

#### Scenario: Dentro
- **WHEN** la pareja que eligió el triunfo hace 70 puntos y la otra 92
- **THEN** la pareja que eligió no se apunta nada y la otra se apunta 162

#### Scenario: Capot
- **WHEN** una pareja hace las 8 bazas
- **THEN** se apunta 252 y la otra nada

### Requirement: Vista del jugador en el Belote
Cada jugador MUST ver:
- su mano y cuántas cartas tienen los demás;
- la carta vuelta mientras se elige el triunfo, y quién ha pasado;
- el triunfo y quién lo eligió;
- la baza en curso, la última baza, las cartas jugadas en la mano y los puntos de las bazas de cada pareja;
- los anuncios de belote y rebelote;
- los puntos de cada pareja y el resultado de las manos anteriores.

Las manos ajenas y las cartas del mazo MUST quedar ocultas.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás ni del mazo
