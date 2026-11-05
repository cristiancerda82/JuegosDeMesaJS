# juego-tysiacha Specification

## Purpose
TBD - created by archiving change juego-tysiacha. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Tysiącha
El Tysiącha MUST jugarse entre 3 jugadores con 24 cartas francesas: 9, 10, J, Q, K y As de cada palo.

En cada palo, el orden de mayor a menor y los puntos MUST ser:

| Carta | As | 10 | K | Q | J | 9 |
|---|---|---|---|---|---|---|
| Puntos | 11 | 10 | 4 | 3 | 2 | 0 |

En total suman 120 puntos.

En cada mano, cada jugador MUST recibir 7 cartas y las 3 restantes MUST quedar boca abajo en el prikup. En la primera mano reparte el asiento 2, y el que reparte pasa al siguiente en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 7 cartas y hay 3 en el prikup que nadie ve

#### Scenario: Orden de las cartas
- **WHEN** en una baza sin triunfo de corazones se juegan el K, el 10 y la Q de corazones
- **THEN** gana el 10

### Requirement: Subasta del Tysiącha
- **Apertura:** el jugador que sigue al que reparte MUST abrir la subasta con 100, sin poder pasar.
- **Turnos:** después, por turno, cada jugador que no ha pasado MUST subir la puja de 5 en 5 o pasar. Quien pasa no vuelve a pujar en esa mano.
- **Límite:** un jugador MUST NOT pujar más de 120 si no tiene en la mano el K y la Q de algún palo, ni más de 120 más lo que suman los matrimonios que tiene.
- **Fin:** la subasta acaba cuando los otros dos jugadores han pasado. El que queda es el declarante y su última puja, el contrato. Si los otros dos pasan sin que nadie suba, el contrato es 100.

#### Scenario: Apertura obligada
- **WHEN** empieza la subasta
- **THEN** el jugador que sigue al que reparte puja 100 sin elegir, y le toca al siguiente

#### Scenario: Sin matrimonio no pasa de 120
- **WHEN** la puja está en 120 y el jugador al que le toca no tiene ningún matrimonio
- **THEN** solo puede pasar

#### Scenario: Gana la subasta
- **WHEN** la puja está en 115 y los otros dos pasan
- **THEN** quien pujó 115 es el declarante con un contrato de 115

### Requirement: Prikup y contrato del Tysiącha
Acabada la subasta:
- el prikup MUST enseñarse a todos y pasar a la mano del declarante;
- el declarante MUST dar una carta boca abajo a cada rival, primero al que le sigue y luego al otro, de modo que los tres tienen 8 cartas;
- después, el declarante MUST fijar el contrato: el mismo u otro mayor, de 5 en 5, sin pasar de 120 más lo que suman los matrimonios que tiene en la mano.

Cada rival MUST ver la carta que recibe. El otro rival no la ve.

#### Scenario: Prikup enseñado
- **WHEN** acaba la subasta
- **THEN** los tres ven las 3 cartas del prikup y el declarante tiene 10 cartas

#### Scenario: Dar las cartas
- **WHEN** el declarante da una carta a cada rival
- **THEN** los tres tienen 8 cartas y cada rival ve la carta que recibió

#### Scenario: Subir el contrato
- **WHEN** el declarante ganó con 110, tiene el matrimonio de diamantes y fija 140
- **THEN** el contrato es 140

#### Scenario: Tope del contrato
- **WHEN** el declarante tiene solo el matrimonio de picas
- **THEN** no puede fijar más de 160

### Requirement: Bazas del Tysiącha
- **Salida:** sale el declarante en la primera baza; después sale quien gana la baza anterior.
- **Al responder:**
  - el jugador MUST seguir el palo de salida si puede;
  - si no puede y hay triunfo, MUST echar triunfo si tiene;
  - si no, puede echar cualquier carta;
  - no hay obligación de ganar la baza.
- **Ganadora:** la baza la gana el triunfo más alto o, si no hay triunfo en ella, la carta más alta del palo de salida.
- **Triunfo:** al empezar la mano no hay triunfo.

#### Scenario: Sin triunfo al empezar
- **WHEN** en la primera baza no se ha cantado ningún matrimonio y un jugador sin el palo de salida echa el As de otro palo
- **THEN** la baza la gana la carta más alta del palo de salida

#### Scenario: Obligación de triunfar
- **WHEN** el triunfo es tréboles y un jugador sin el palo de salida tiene tréboles
- **THEN** solo puede echar tréboles

#### Scenario: Sin obligación de ganar
- **WHEN** un jugador tiene el As y el 9 del palo de salida y en la mesa está el 10
- **THEN** puede echar cualquiera de los dos

### Requirement: Matrimonios del Tysiącha
Un jugador MUST cantar un matrimonio cuando sale con el K o la Q de un palo, tiene la otra carta de la pareja en la mano y ha ganado al menos una baza en la mano.

El matrimonio:
- MUST sumar a los puntos del jugador en la mano: 100 en corazones, 80 en diamantes, 60 en tréboles y 40 en picas;
- MUST hacer triunfo su palo desde esa misma baza, hasta que se cante otro.

Cada matrimonio se canta una sola vez.

#### Scenario: Cantar
- **WHEN** un jugador que ya ganó una baza sale con la Q de diamantes y tiene el K de diamantes
- **THEN** suma 80 y diamantes pasa a ser el triunfo

#### Scenario: Sin baza no se canta
- **WHEN** el declarante sale en la primera baza con el K de corazones y tiene la Q
- **THEN** no canta y sigue sin haber triunfo

#### Scenario: Cambio de triunfo
- **WHEN** el triunfo es picas y otro jugador canta el matrimonio de tréboles
- **THEN** el triunfo pasa a ser tréboles

### Requirement: Puntos de la mano del Tysiącha
Cada jugador suma en la mano los puntos de las cartas de las bazas que gana y los de sus matrimonios.

- **Declarante:** si suma al menos el contrato, MUST anotar el contrato. Si no, MUST restar el contrato.
- **Rivales:** cada uno MUST anotar sus puntos redondeados al múltiplo de 5 más cercano. Si termina en 2,5 se redondea hacia arriba.

#### Scenario: Cumple el contrato
- **WHEN** el declarante con contrato 120 suma 135
- **THEN** anota 120

#### Scenario: No cumple el contrato
- **WHEN** el declarante con contrato 140 suma 125
- **THEN** resta 140

#### Scenario: Redondeo de un rival
- **WHEN** un rival suma 37 en una mano y otro suma 43
- **THEN** el primero anota 35 y el segundo 45

### Requirement: Barril del Tysiącha
- **Subir:** cuando un jugador llega a 880 o más sin ganar la partida, su marcador MUST quedar en 880 y sube al barril.
- **En el barril:** solo puede cambiar su marcador como declarante. Si cumple un contrato que le lleva a la meta, MUST anotarlo; si lo cumple sin llegar, no anota. Si no lo cumple, MUST restarlo y baja del barril. Como rival no anota nada.
- **Caer:** si tras 3 manos en el barril sigue en él, MUST bajar a 760 y sale del barril.

#### Scenario: Subir al barril
- **WHEN** un jugador con 850 anota 45 como rival
- **THEN** su marcador es 880 y está en el barril

#### Scenario: En el barril como rival
- **WHEN** un jugador en el barril suma 30 puntos como rival
- **THEN** su marcador sigue en 880

#### Scenario: Caer del barril
- **WHEN** un jugador lleva 3 manos en el barril sin ganar
- **THEN** su marcador baja a 760 y ya no está en el barril

### Requirement: Fin de la partida del Tysiącha
La partida MUST terminar cuando el declarante cumple el contrato y su marcador llega a 1000 o más. Gana ese jugador.

#### Scenario: Ganar la partida
- **WHEN** un jugador en el barril es declarante con contrato 120 y lo cumple
- **THEN** su marcador es 1000 y gana la partida

### Requirement: Vista del jugador en el Tysiącha
La vista de cada jugador MUST mostrar:
- su mano;
- cuántas cartas tienen los otros;
- la subasta (pujas y pases), el declarante y el contrato;
- el prikup en cuanto se enseña;
- la carta que el declarante le dio, si es un rival; si es el declarante, las dos que dio;
- el triunfo, los matrimonios cantados, la baza en curso, la última baza y los puntos de cada uno en la mano;
- los marcadores, quién está en el barril y cuántas manos lleva, y el resumen de las manos anteriores.

La vista MUST NOT mostrar las manos ajenas, el prikup antes de enseñarse ni la carta que recibió el otro rival.

#### Scenario: Prikup oculto en la subasta
- **WHEN** un jugador mira la mesa durante la subasta
- **THEN** ve 3 cartas boca abajo en el prikup y no sabe cuáles son

#### Scenario: Carta dada al otro rival
- **WHEN** el declarante da una carta a cada rival
- **THEN** cada rival ve solo la suya
