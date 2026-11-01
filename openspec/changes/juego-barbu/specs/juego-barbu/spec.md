## ADDED Requirements

### Requirement: Baraja y reparto del Barbu
El Barbu MUST jugarse entre 4, cada uno contra todos, con 52 cartas francesas. En cada mano, cada jugador MUST recibir 13 cartas. El repartidor de la primera mano es el asiento 0 y pasa al siguiente en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 13 cartas, no quedan cartas y el repartidor elige el contrato

### Requirement: Elección del contrato del Barbu
Al empezar cada mano, el repartidor MUST elegir un contrato entre los que aún no se han jugado en la partida: sin bazas, sin corazones, sin damas, sin el Rey de corazones, sin las dos últimas, triunfo o dominó. Si elige el triunfo, MUST elegir además el palo de triunfo. El repartidor MUST salir en la primera baza o empezar el dominó.

#### Scenario: Contratos que quedan
- **WHEN** ya se han jugado sin bazas y dominó, y reparte el siguiente
- **THEN** puede elegir entre los otros cinco contratos

#### Scenario: Triunfo
- **WHEN** el repartidor elige el triunfo
- **THEN** elige el palo de triunfo y sale en la primera baza

### Requirement: Bazas del Barbu
En los contratos de bazas, cada jugador MUST seguir el palo de salida si puede; si no, MAY jugar cualquier carta, con estas excepciones:
- **Triunfo:** sin el palo de salida, MUST fallar si tiene triunfo y, si ya hay triunfo en la baza, MUST echar uno más alto si puede. Gana el triunfo más alto o la más alta del palo de salida.
- **Sin corazones y sin el Rey de corazones:** no se MAY salir de corazones mientras se tengan cartas de otros palos.
- **Sin el Rey de corazones:** quien no puede seguir el palo y tiene el Rey de corazones MUST echarlo.

En los demás contratos, gana la baza la carta más alta del palo de salida, con el As como la más alta. El ganador sale en la siguiente baza.

#### Scenario: Seguir el palo
- **WHEN** salen picas y el jugador tiene picas
- **THEN** solo puede jugar picas

#### Scenario: Fallar en el triunfo
- **WHEN** el contrato es triunfo de tréboles, salen corazones y el jugador no tiene corazones pero tiene tréboles
- **THEN** solo puede jugar tréboles

#### Scenario: No salir de corazones
- **WHEN** el contrato es sin corazones y el jugador que sale tiene corazones y picas
- **THEN** no puede salir de corazones

#### Scenario: Echar el Rey de corazones
- **WHEN** el contrato es sin el Rey de corazones, salen picas y el jugador no tiene picas pero tiene el Rey de corazones
- **THEN** solo puede jugar el Rey de corazones

### Requirement: Puntos de los contratos de bazas del Barbu
Cada contrato de bazas MUST puntuar así:
- **Sin bazas:** −2 por cada baza ganada.
- **Sin corazones:** −2 por cada corazón ganado y −6 por el As de corazones.
- **Sin damas:** −6 por cada dama ganada.
- **Sin el Rey de corazones:** −20 para quien gana el Rey de corazones.
- **Sin las dos últimas:** −10 para quien gana la penúltima baza y −20 para quien gana la última.
- **Triunfo:** +5 por cada baza ganada.

En sin corazones, sin damas y sin el Rey de corazones, la mano MUST terminar en cuanto se han ganado todas las cartas que penalizan.

#### Scenario: Sin corazones
- **WHEN** en sin corazones un jugador gana bazas con el As y otros 3 corazones
- **THEN** anota −12

#### Scenario: La mano acaba antes
- **WHEN** en sin damas se gana la baza con la cuarta dama
- **THEN** la mano termina aunque queden cartas

#### Scenario: Sin las dos últimas
- **WHEN** un jugador gana la penúltima y la última baza
- **THEN** anota −30

### Requirement: Dominó del Barbu
En el dominó, cada jugador en su turno MUST jugar una carta que encaje, si tiene; si no, MUST pasar:
- una Jota encaja siempre: abre la fila de su palo;
- encaja la carta siguiente o la anterior a las que hay en la fila de su palo, en el orden 2, 3 … 10, J, Q, K, A.

Empieza el repartidor. Quien se queda sin cartas MUST acabar en el orden en que lo hace: el primero anota +45, el segundo +20, el tercero +5 y el último −5. La mano MUST terminar cuando tres han acabado.

#### Scenario: Abrir con una Jota
- **WHEN** la fila de picas está vacía y el jugador tiene la Jota de picas
- **THEN** puede jugarla

#### Scenario: Encajar
- **WHEN** la fila de corazones va del 9 a la Dama
- **THEN** encajan el 8 y el Rey de corazones

#### Scenario: Pasar
- **WHEN** el jugador no tiene ninguna carta que encaje
- **THEN** solo puede pasar

#### Scenario: Orden de acabar
- **WHEN** tres jugadores se han quedado sin cartas
- **THEN** anotan +45, +20 y +5 por orden, el cuarto −5, y termina la mano

### Requirement: Partida del Barbu
La partida MUST durar 7 manos, una por contrato. Al acabar la séptima, gana quien más puntos suma; si varios empatan con el máximo, ganan todos ellos.

#### Scenario: Fin de la partida
- **WHEN** acaba la séptima mano
- **THEN** se han jugado los siete contratos, la partida termina y gana quien más suma

### Requirement: Vista del Barbu
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno;
- el repartidor, el contrato y el triunfo, y los contratos que quedan;
- la baza en curso y la última baza, o las filas del dominó y quién ha acabado;
- las cartas jugadas en la mano;
- los puntos de cada uno en la mano y en la partida, y los resultados de las manos anteriores.

Cada jugador MUST NOT ver las manos de los demás.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa
- **THEN** ve cuántas cartas tienen los demás, pero no cuáles
