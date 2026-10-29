## ADDED Requirements

### Requirement: Baraja y reparto del Bezique
El Bezique MUST jugarse entre 2 con dos barajas de piquet: 64 cartas, del 7 al As de cada palo francés, con dos copias de cada carta. El orden de las cartas, de mayor a menor, MUST ser: A, 10, K, Q, J, 9, 8 y 7. En cada mano, cada jugador MUST recibir 8 cartas. La siguiente se vuelve boca arriba: su palo es el triunfo de la mano. El resto forma el mazo. Si la carta vuelta es un 7, el repartidor MUST sumar 10 puntos. El repartidor de la primera mano es el jugador 1, y se alterna en cada mano. Sale el que no reparte.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 8 cartas, hay una carta vuelta que marca el triunfo y quedan 47 cartas en el mazo

#### Scenario: Siete de triunfo vuelto
- **WHEN** la carta vuelta es un 7
- **THEN** el repartidor suma 10 puntos

### Requirement: Bazas del Bezique con mazo
Mientras quede mazo, cada jugador MAY jugar cualquier carta. La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida. Si las dos cartas son iguales, gana la primera. Tras cada baza:
1. el ganador MAY hacer una declaración;
2. el ganador roba la carta de arriba del mazo y después el otro jugador;
3. el ganador sale en la siguiente baza.

Cuando queda una sola carta en el mazo, el ganador la roba y el otro se lleva la carta vuelta.

#### Scenario: Sin obligación de seguir
- **WHEN** quedan cartas en el mazo y salen corazones
- **THEN** el otro jugador puede jugar cualquier carta

#### Scenario: Cartas iguales
- **WHEN** los dos juegan el As de picas
- **THEN** gana la baza el que salió

#### Scenario: Robo
- **WHEN** el ganador de una baza termina su declaración
- **THEN** roba él primero y después el otro, y los dos vuelven a tener 8 cartas

### Requirement: Declaraciones del Bezique
Tras ganar una baza mientras quede mazo, el ganador MAY hacer una sola declaración, o ninguna:
- **Cantar** una de estas combinaciones, con cartas de su mano:
  - matrimonio, el K y la Q del mismo palo: 20 puntos, o 40 si es del triunfo;
  - bézique, la Q de picas y la J de diamantes: 40;
  - doble bézique, las dos Q de picas y las dos J de diamantes: 500;
  - cuatro J de cualquier palo: 40; cuatro Q: 60; cuatro K: 80; cuatro A: 100;
  - escalera de triunfo, el A, el 10, el K, la Q y la J del triunfo: 250;
  - un 7 de triunfo: 10.
- **Cambiar** un 7 de triunfo de su mano por la carta vuelta: 10 puntos.

Las cartas cantadas MUST quedar boca arriba en la mesa, a la vista del rival, pero siguen siendo de su mano y se pueden jugar. Cada combinación MUST tener al menos una carta que no estuviera ya cantada. Una carta MUST NOT usarse dos veces en combinaciones del mismo tipo (con dos copias, cada copia una vez). El K y la Q de triunfo que ya estén en una escalera MUST NOT cantarse después como matrimonio.

#### Scenario: Matrimonio de triunfo
- **WHEN** el triunfo es corazones y el ganador de la baza tiene el K y la Q de corazones
- **THEN** puede cantarlos por 40, y quedan boca arriba en la mesa

#### Scenario: Una carta nueva
- **WHEN** un jugador cantó cuatro K y después canta un matrimonio de picas con el K de picas ya cantado y una Q de picas nueva
- **THEN** suma 20 puntos

#### Scenario: Sin repetir tipo
- **WHEN** un jugador ya cantó el matrimonio de tréboles con su único K y su única Q de tréboles
- **THEN** no puede volver a cantar ese matrimonio

#### Scenario: Cambiar el 7
- **WHEN** el ganador tiene el 7 de triunfo
- **THEN** puede cambiarlo por la carta vuelta y suma 10

### Requirement: Últimas bazas del Bezique
Cuando el mazo se acaba, las cartas cantadas MUST volver a la mano y se juegan las 8 últimas bazas, sin declaraciones. En ellas, el jugador MUST seguir el palo de salida si tiene, ganando la baza si puede. Si no tiene el palo, MUST jugar triunfo si tiene. Si tampoco, MAY jugar cualquier carta. La última baza MUST valer 10 puntos.

#### Scenario: Seguir y ganar
- **WHEN** sin mazo sale el 9 de diamantes y el otro tiene el 8 y el As de diamantes
- **THEN** solo puede jugar el As de diamantes

#### Scenario: Fallar
- **WHEN** sin mazo sale un trébol, el otro no tiene tréboles y tiene triunfos
- **THEN** tiene que jugar un triunfo

### Requirement: Puntos de la mano del Bezique
Los cantes y el 7 MUST sumarse en cuanto se declaran. Al acabar la mano, cada jugador MUST sumar 10 por cada As y cada 10 que haya ganado en sus bazas (*brisques*), y 10 quien ganó la última baza. El resultado de la mano MUST registrar los cantes, las brisques, la última baza, los puntos de la mano de cada jugador y el marcador tras la mano.

#### Scenario: Brisques
- **WHEN** termina una mano y un jugador ha ganado en sus bazas 5 Ases y 4 dieces
- **THEN** suma 90 puntos por las brisques

### Requirement: Partida del Bezique
La partida MUST jugarse a 1.000 puntos: al acabar una mano, si algún jugador llega a 1.000, gana el que más puntos tiene. Si los dos tienen los mismos, se juega otra mano. Los puntos del resultado son los del marcador.

#### Scenario: Fin de la partida
- **WHEN** al acabar una mano un jugador tiene 1.040 y el otro 880
- **THEN** la partida termina y gana el de 1.040

### Requirement: Vista del jugador en el Bezique
Cada jugador MUST ver:
- su mano, con cuáles de sus cartas están cantadas;
- las cartas cantadas del rival y cuántas cartas tiene;
- el triunfo, la carta vuelta mientras esté en la mesa y cuántas cartas quedan en el mazo;
- la baza en curso, la última baza, las cartas jugadas en la mano y los cantes hechos;
- los puntos de la mano, el marcador y el resultado de las manos anteriores.

La mano del rival, salvo sus cartas cantadas, y el mazo MUST quedar ocultos.

#### Scenario: La mano ajena no se ve
- **WHEN** un jugador pide su vista
- **THEN** ve las cartas cantadas del rival, pero ninguna otra de su mano ni del mazo
