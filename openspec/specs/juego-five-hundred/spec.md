# juego-five-hundred Specification

## Purpose
TBD - created by archiving change juego-five-hundred. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Five Hundred
El Five Hundred MUST jugarse entre 4, en parejas: los asientos 0 y 2 contra 1 y 3. Se usan 43 cartas: del 5 al 10, J, Q, K y A de cada palo, el 4 de corazones, el 4 de diamantes y un comodín. En cada mano, cada jugador MUST recibir 10 cartas y quedan 3 en la viuda, boca abajo. El repartidor de la primera mano es el asiento 3 y pasa al siguiente en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 10 cartas, la viuda tiene 3 y empieza la subasta el siguiente al repartidor

### Requirement: Subasta del Five Hundred
Por turnos desde el siguiente al repartidor, cada jugador MUST pujar más alto que la puja más alta o pasar; quien pasa MUST NOT volver a pujar en la mano. Las pujas y sus valores (tabla de Avondale) MUST ser:

| Bazas | Picas | Tréboles | Diamantes | Corazones | Sin triunfo |
|---|---|---|---|---|---|
| 6 | 40 | 60 | 80 | 100 | 120 |
| 7 | 140 | 160 | 180 | 200 | 220 |
| 8 | 240 | 260 | 280 | 300 | 320 |
| 9 | 340 | 360 | 380 | 400 | 420 |
| 10 | 440 | 460 | 480 | 500 | 520 |

Además, el misère vale 250 y va justo por encima de 8 picas, y el misère abierto vale 500 y va justo por encima de 10 diamantes. La subasta MUST acabar cuando, tras una puja, pasan los otros tres; gana la puja más alta. Si pasan los cuatro sin pujar, MUST repartirse otra mano con el siguiente repartidor.

#### Scenario: Pujar más alto
- **WHEN** la puja más alta es 7 diamantes
- **THEN** se puede pujar 7 corazones, 7 sin triunfo, 8 picas o más, o pasar, pero no 7 tréboles

#### Scenario: Misère
- **WHEN** la puja más alta es 8 picas
- **THEN** se puede pujar misère

#### Scenario: Fin de la subasta
- **WHEN** el asiento 0 puja 7 picas y pasan el 1, el 2 y el 3
- **THEN** el 0 gana la subasta con 7 picas

#### Scenario: Pasan todos
- **WHEN** los cuatro pasan sin pujar
- **THEN** se reparte otra mano con el siguiente repartidor y no se anota nada

### Requirement: Viuda del Five Hundred
Quien gana la subasta MUST quedarse las 3 cartas de la viuda y descartarse de 3 cartas, boca abajo. Los descartes no cuentan para nadie.

#### Scenario: Descarte
- **WHEN** el asiento 0 gana la subasta
- **THEN** tiene 13 cartas, se descarta de 3 y vuelve a tener 10

### Requirement: Triunfos del Five Hundred
En un contrato con palo de triunfo, los triunfos de mayor a menor MUST ser:
- el comodín;
- la Jota del triunfo;
- la Jota del otro palo del mismo color, que cuenta como triunfo y no como de su palo;
- y A, K, Q, 10, 9, 8, 7, 6, 5 y 4 del triunfo.

En los demás palos el orden es A, K, Q, J, 10, 9, 8, 7, 6, 5 y 4.

Sin triunfo y en el misère, el comodín MUST ser la carta más alta y no tiene palo:
- solo se MAY echar cuando no se puede seguir el palo;
- si sale el comodín, quien sale MUST nombrar el palo que los demás deben seguir.

#### Scenario: El comodín y las Jotas
- **WHEN** el triunfo es corazones y en la baza están el As de corazones, la Jota de diamantes, la Jota de corazones y el comodín
- **THEN** gana el comodín; sin él, la Jota de corazones; y sin ella, la Jota de diamantes

#### Scenario: La otra Jota es triunfo
- **WHEN** el triunfo es corazones, salen diamantes y el jugador solo tiene de diamantes la Jota
- **THEN** no tiene diamantes y puede jugar cualquier carta

#### Scenario: El comodín sin triunfo
- **WHEN** el contrato es sin triunfo, salen picas y el jugador tiene picas y el comodín
- **THEN** debe jugar picas

### Requirement: Bazas del Five Hundred
Cada jugador MUST seguir el palo de salida si puede; si no, MAY jugar cualquier carta. Gana el triunfo más alto o, sin triunfos, la carta más alta del palo de salida. En la primera baza sale quien ganó la subasta; después, quien gana la baza. En el misère y el misère abierto, el compañero de quien juega MUST NOT jugar y las bazas son de 3 cartas. En el misère abierto, las cartas de quien juega MUST verse boca arriba desde que se juega la primera carta.

#### Scenario: Seguir el palo
- **WHEN** salen tréboles y el jugador tiene tréboles
- **THEN** solo puede jugar tréboles

#### Scenario: Misère sin compañero
- **WHEN** el asiento 0 juega misère
- **THEN** el asiento 2 no juega y cada baza tiene 3 cartas

### Requirement: Puntos de la mano del Five Hundred
Al acabar la mano:
- **Contratos de bazas:** si la pareja que juega gana al menos las bazas de su puja, MUST sumar el valor de la puja; si no, MUST restarlo. Si gana las 10 bazas con una puja de menos de 250, suma 250.
- **Rivales:** en los contratos de bazas, MUST sumar 10 por cada baza que ganan.
- **Misère:** quien lo juega MUST sumar su valor si no gana ninguna baza y restarlo si gana alguna; la mano termina en cuanto gana una. Los rivales no suman nada.

#### Scenario: Cumple
- **WHEN** la pareja que juega 7 corazones gana 8 bazas
- **THEN** suma 200 y los rivales suman 20

#### Scenario: No cumple
- **WHEN** la pareja que juega 8 picas gana 7 bazas
- **THEN** resta 240 y los rivales suman 30

#### Scenario: Todas las bazas
- **WHEN** la pareja que juega 7 picas gana las 10 bazas
- **THEN** suma 250

#### Scenario: Misère perdido
- **WHEN** quien juega misère gana una baza
- **THEN** la mano termina y resta 250

### Requirement: Partida del Five Hundred
La partida MUST terminar cuando:
- la pareja que juega llega a 500 o más al cumplir su contrato: gana esa pareja;
- una pareja baja a −500 o menos: pierde y gana la otra.

Los rivales MUST NOT pasar de 490 con los puntos de sus bazas.

#### Scenario: Gana cumpliendo
- **WHEN** una pareja con 380 cumple 7 picas
- **THEN** llega a 520 y gana la partida

#### Scenario: Los rivales no ganan con sus bazas
- **WHEN** una pareja con 480 gana 3 bazas como rival
- **THEN** se queda en 490 y la partida sigue

#### Scenario: Pierde a −500
- **WHEN** una pareja con −400 no cumple 7 picas
- **THEN** baja a −540 y pierde la partida

### Requirement: Vista del Five Hundred
Cada jugador MUST ver:
- su mano y, si ganó la subasta, sus descartes;
- cuántas cartas tiene cada uno;
- las pujas de la subasta, quién juega y el contrato;
- en el misère abierto, las cartas de quien juega desde la primera carta;
- la baza en curso, la última baza y el palo nombrado al salir con el comodín;
- las cartas jugadas en la mano y las bazas de cada pareja;
- los resultados de las manos anteriores y los puntos de la partida.

Cada jugador MUST NOT ver las manos de los demás, la viuda ni los descartes ajenos.

#### Scenario: Viuda oculta
- **WHEN** el jugador 1 mira la mesa durante la subasta
- **THEN** ve cuántas cartas tienen los demás, pero no cuáles ni las de la viuda
