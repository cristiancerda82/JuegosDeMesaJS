## ADDED Requirements

### Requirement: Baraja y reparto del Jass
El Jass MUST jugarse entre 4, en parejas: los asientos 0 y 2 contra 1 y 3. Se usan 36 cartas francesas: del 6 al 10, J, Q, K y A de cada palo. En cada mano, cada jugador MUST recibir 9 cartas. El repartidor de la primera mano es el asiento 3 y pasa al siguiente en cada mano; el jugador siguiente al repartidor tiene la elección del modo.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 9 cartas, no quedan cartas y el siguiente al repartidor tiene la elección

### Requirement: Elección del modo del Jass
Quien tiene la elección MUST elegir uno de estos modos:
- uno de los cuatro palos como triunfo;
- Obenabe: sin triunfo, con el As como carta más alta;
- Undenufe: sin triunfo, con el 6 como carta más alta.

En lugar de elegir, MAY pasar la elección a su compañero (schieben), que MUST elegir un modo y no puede volver a pasar. Quien tenía la elección MUST salir en la primera baza, aunque haya pasado.

#### Scenario: Elegir el triunfo
- **WHEN** quien tiene la elección elige corazones
- **THEN** corazones es el triunfo y quien eligió sale en la primera baza

#### Scenario: Schieben
- **WHEN** quien tiene la elección pasa
- **THEN** su compañero debe elegir un modo, no puede pasar, y la primera baza la sigue saliendo quien pasó

### Requirement: Órdenes y puntos de las cartas del Jass
El orden de las cartas, de mayor a menor, y sus puntos MUST depender del modo:
- **Triunfo, en el palo del triunfo:** J (Buur) 20, 9 (Nell) 14, A 11, K 4, Q 3, 10 10, 8 0, 7 0 y 6 0.
- **Triunfo, en los otros palos:** A 11, K 4, Q 3, J 2, 10 10, 9 0, 8 0, 7 0 y 6 0.
- **Obenabe:** A 11, K 4, Q 3, J 2, 10 10, 9 0, 8 8, 7 0 y 6 0.
- **Undenufe:** 6 11, 7 0, 8 8, 9 0, 10 10, J 2, Q 3, K 4 y A 0.

En cualquier modo, las cartas suman 152 y la última baza MUST sumar 5 más: 157 por mano.

#### Scenario: El Buur gana al As del triunfo
- **WHEN** el triunfo es picas y en la baza están el As y la Jota de picas
- **THEN** gana la Jota de picas

#### Scenario: El Nell
- **WHEN** el triunfo es picas y en la baza están el As y el 9 de picas
- **THEN** gana el 9 de picas

#### Scenario: Undenufe
- **WHEN** el modo es Undenufe, salen diamantes y en la baza están el As y el 6 de diamantes
- **THEN** gana el 6 de diamantes

### Requirement: Bazas del Jass
Cada jugador MUST seguir el palo de salida si puede, pero en el modo de triunfo MAY echar un triunfo aunque tenga del palo de salida. Si no tiene del palo de salida, MAY echar cualquier carta. Además, en el modo de triunfo:
- si sale triunfo, MUST echar triunfo si tiene, salvo que su único triunfo sea la Jota del triunfo, que nunca es obligatoria;
- si sale otro palo y ya hay un triunfo en la baza, MUST NOT echar un triunfo más bajo, salvo que solo tenga triunfos en la mano.

La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida en el orden del modo. El ganador sale en la siguiente baza.

#### Scenario: Fallar teniendo del palo
- **WHEN** el triunfo es tréboles, salen corazones y el jugador tiene corazones y tréboles
- **THEN** puede jugar cualquiera de sus corazones o de sus tréboles, pero no las cartas de otros palos

#### Scenario: El Buur no es obligatorio
- **WHEN** el triunfo es tréboles, sale triunfo y el único trébol del jugador es la Jota
- **THEN** puede jugar cualquier carta

#### Scenario: No se puede subfallar
- **WHEN** el triunfo es tréboles, salen corazones, en la baza hay el As de tréboles y el jugador tiene el 6 de tréboles y el 7 de picas, sin corazones
- **THEN** no puede jugar el 6 de tréboles

#### Scenario: Solo triunfos
- **WHEN** el triunfo es tréboles, salen corazones, en la baza hay el As de tréboles y al jugador solo le quedan el 6 y el 7 de tréboles
- **THEN** puede jugar cualquiera de los dos

### Requirement: Declaraciones del Jass
Al acabar la primera baza, las declaraciones (Weis) de cada jugador MUST compararse solas con su mano del reparto:
- **Escaleras** del mismo palo, en el orden A, K, Q, J, 10, 9, 8, 7, 6: de 3 cartas 20, de 4 50, de 5 100, de 6 150, de 7 200, de 8 250 y de 9 300.
- **Cuatro iguales:** cuatro Jotas 200, cuatro nueves 150, y cuatro Ases, Reyes, Damas o dieces 100.

La mejor declaración es la de más puntos; a igualdad, la de más cartas; luego, la de carta más alta; luego, la del triunfo; y luego, la del jugador más cercano al que salió, en el orden de juego. Solo la pareja con la mejor declaración MUST anotar todas las declaraciones de sus dos jugadores, y esas declaraciones se enseñan a todos con sus cartas.

#### Scenario: Gana la mejor declaración
- **WHEN** el jugador 0 tiene una escalera de 4 y el jugador 1 una de 3
- **THEN** la pareja del jugador 0 anota los 50 y las demás declaraciones de su pareja, y la otra pareja no anota nada

#### Scenario: Cuatro Jotas
- **WHEN** un jugador tiene las cuatro Jotas y nadie declara más
- **THEN** su pareja anota 200

### Requirement: Stöck del Jass
En el modo de triunfo, el jugador que tiene el Rey y la Dama del triunfo en su mano del reparto MUST anotar 20 (el Stöck) para su pareja al jugar la segunda de las dos, aunque su pareja no haya ganado las declaraciones.

#### Scenario: Stöck
- **WHEN** el triunfo es corazones y el jugador que tenía el Rey y la Dama de corazones juega la segunda
- **THEN** su pareja anota 20 por el Stöck, multiplicados por el modo

### Requirement: Puntos de la mano del Jass
Cada pareja MUST sumar los puntos de las cartas de sus bazas y los 5 de la última baza. La pareja que se lleva las 9 bazas (Match) MUST sumar 257 en lugar de 157. Todos los puntos de la mano (las bazas, el Match, las declaraciones y el Stöck) MUST multiplicarse según el modo: diamantes y tréboles ×1, corazones y picas ×2, Obenabe y Undenufe ×3.

#### Scenario: Mano en diamantes
- **WHEN** el triunfo es diamantes y una pareja hace 100 puntos de bazas, contando la última
- **THEN** la otra hace 57 y anotan 100 y 57

#### Scenario: Multiplicador
- **WHEN** el modo es Obenabe y una pareja hace 90 puntos de bazas, contando la última
- **THEN** anota 270 y la otra 201

#### Scenario: Match
- **WHEN** el triunfo es picas y una pareja se lleva las 9 bazas
- **THEN** anota 514 por las bazas y la otra nada

### Requirement: Partida del Jass
Los puntos MUST anotarse en el momento en que se ganan: el Stöck al jugar la segunda carta, las declaraciones al acabar la primera baza (antes que los puntos de esa baza) y los puntos de cada baza al acabarla, con los 5 de la última y el Match al acabar la mano. En cuanto una pareja llega a 1.000 puntos o más, la partida MUST terminar y gana esa pareja, aunque sea en mitad de una mano.

#### Scenario: Fin en mitad de la mano
- **WHEN** una pareja con 980 puntos gana una baza que vale 25 en la cuarta baza de la mano
- **THEN** la partida termina en ese momento y gana esa pareja

#### Scenario: Siguiente mano
- **WHEN** acaba una mano sin que ninguna pareja llegue a 1.000
- **THEN** se reparte otra mano con el siguiente repartidor

### Requirement: Vista del Jass
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno;
- quién tiene la elección, si ha pasado y el modo elegido con su multiplicador;
- sus propias declaraciones y, tras la primera baza, las declaraciones ganadoras con sus cartas;
- el Stöck si se ha anotado;
- la baza en curso y la última baza;
- las cartas jugadas en la mano;
- los puntos de cada pareja en la mano y en la partida, y los resultados de las manos anteriores.

Cada jugador MUST NOT ver las manos de los demás ni las declaraciones de la pareja que no las ganó.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás, pero no cuáles
