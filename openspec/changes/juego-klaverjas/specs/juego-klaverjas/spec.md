## ADDED Requirements

### Requirement: Baraja y reparto del Klaverjas
El Klaverjas MUST jugarse entre 4, en parejas: los asientos 0 y 2 contra 1 y 3. Se usan 32 cartas francesas: del 7 al 10, J, Q, K y A de cada palo. En cada mano, cada jugador MUST recibir 8 cartas. El repartidor de la primera mano es el asiento 3 y pasa al siguiente en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 8 cartas, no quedan cartas y se propone un palo de triunfo

### Requirement: Propuesta del triunfo del Klaverjas
Al empezar cada mano MUST proponerse un palo al azar. Por turnos, desde el siguiente al repartidor, cada jugador MUST decir si juega con ese palo de triunfo o pasa. El primero que juega MUST hacer de su pareja la que juega la mano, con el palo propuesto como triunfo. Si pasan los cuatro, el siguiente al repartidor MUST jugar y elegir el palo de triunfo que quiera. En cualquier caso, la primera baza la MUST salir el siguiente al repartidor.

#### Scenario: Jugar con el palo propuesto
- **WHEN** el palo propuesto es corazones, el asiento 0 pasa y el 1 juega
- **THEN** corazones es el triunfo, juega la pareja del 1 y sale el 0

#### Scenario: Pasan todos
- **WHEN** los cuatro pasan
- **THEN** el siguiente al repartidor elige cualquier palo de triunfo y juega su pareja

### Requirement: Órdenes y puntos de las cartas del Klaverjas
El orden de las cartas, de mayor a menor, y sus puntos MUST ser:
- **En el triunfo:** J 20, 9 14, A 11, 10 10, K 4, Q 3, 8 0 y 7 0.
- **En los demás palos:** A 11, 10 10, K 4, Q 3, J 2, 9 0, 8 0 y 7 0.

Las cartas suman 152 y la última baza MUST sumar 10 más: 162 por mano.

#### Scenario: La Jota del triunfo
- **WHEN** el triunfo es picas y en la baza están el As y la Jota de picas
- **THEN** gana la Jota de picas

#### Scenario: El 10 gana al Rey
- **WHEN** el triunfo es picas, salen corazones y en la baza están el Rey y el 10 de corazones
- **THEN** gana el 10 de corazones

### Requirement: Bazas del Klaverjas
Las bazas MUST seguir las reglas de Rotterdam:
- hay que seguir el palo de salida si se puede;
- si sale triunfo, hay que echar un triunfo más alto que los de la baza si se puede;
- si no se puede seguir el palo, hay que fallar con un triunfo, aunque la baza la vaya ganando el compañero;
- si ya hay un triunfo en la baza, hay que echar uno más alto si se puede; si no se puede, MUST NOT echarse un triunfo más bajo, salvo que solo queden triunfos en la mano;
- sin triunfos ni cartas del palo, cualquier carta.

La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida. El ganador sale en la siguiente baza.

#### Scenario: Fallar aunque gane el compañero
- **WHEN** el triunfo es tréboles, salen corazones, el compañero va ganando con el As y el jugador no tiene corazones pero tiene tréboles
- **THEN** solo puede jugar tréboles

#### Scenario: Subir el triunfo
- **WHEN** el triunfo es tréboles, salen corazones, hay en la baza el 10 de tréboles y el jugador, sin corazones, tiene el As y el 8 de tréboles y el 7 de picas
- **THEN** solo puede jugar el As de tréboles

#### Scenario: Sin poder subir
- **WHEN** el triunfo es tréboles, salen corazones, hay en la baza la Jota de tréboles y el jugador, sin corazones, tiene el 8 de tréboles y el 7 de picas
- **THEN** solo puede jugar el 7 de picas

#### Scenario: Subir cuando sale triunfo
- **WHEN** sale el As de tréboles, que es triunfo, y el jugador tiene el 9 y el 8 de tréboles
- **THEN** solo puede jugar el 9 de tréboles

### Requirement: Roem del Klaverjas
Al ganar una baza, el ganador MUST anotar para su pareja el roem de las cartas de la baza:
- **Escalera** del mismo palo, en el orden 7, 8, 9, 10, J, Q, K, A: de 3 cartas 20 y de 4 cartas 50.
- **Cuatro iguales:** 100; cuatro Jotas, 200.
- **Stuk:** el Rey y la Dama del triunfo en la baza, 20, que se suma a la escalera si la hay.

La pareja que gana las 8 bazas de la mano (pit) MUST sumar 100 de roem.

#### Scenario: Escalera en la baza
- **WHEN** el triunfo es picas y una baza tiene el 8, el 9 y el 10 de corazones y el 7 de diamantes
- **THEN** quien la gana anota 20 de roem

#### Scenario: Stuk
- **WHEN** el triunfo es picas y una baza tiene el Rey y la Dama de picas
- **THEN** quien la gana anota 20 de roem

#### Scenario: Pit
- **WHEN** una pareja gana las 8 bazas
- **THEN** suma 100 de roem además de los 162

### Requirement: Nat del Klaverjas
Al acabar la mano, cada pareja MUST sumar los puntos de las cartas de sus bazas, los 10 de la última y su roem. Si la pareja que juega suma más que la otra, cada una MUST anotar lo suyo. Si no (nat), la otra pareja MUST anotar los 162 y todo el roem de la mano, y la que juega nada.

#### Scenario: Gana la que juega
- **WHEN** la pareja que juega hace 100 de cartas y 20 de roem, y la otra 62 sin roem
- **THEN** anotan 120 y 62

#### Scenario: Nat
- **WHEN** la pareja que juega hace 80 de cartas y la otra 82, sin roem
- **THEN** la otra anota 162 y la que juega nada

### Requirement: Partida del Klaverjas
La partida MUST durar 8 manos. Al acabar la octava, gana la pareja con más puntos; con los mismos puntos, es empate.

#### Scenario: Fin de la partida
- **WHEN** acaba la octava mano
- **THEN** la partida termina y gana la pareja con más puntos

### Requirement: Vista del Klaverjas
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno;
- el palo propuesto, quién ha pasado, el triunfo y la pareja que juega;
- la baza en curso y la última baza con su roem;
- las cartas jugadas en la mano;
- los puntos de cartas y el roem de cada pareja en la mano, los resultados de las manos anteriores y los puntos de la partida.

Cada jugador MUST NOT ver las manos de los demás.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás, pero no cuáles
