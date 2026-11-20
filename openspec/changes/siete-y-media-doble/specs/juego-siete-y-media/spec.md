## MODIFIED Requirements

### Requirement: Liquidación de la mano
Al terminar la mano se MUST destapar la carta tapada de todos los jugadores y liquidar cada punto que no se pasó. Si la banca se pasó, o el punto tiene más que la banca, la banca le paga su apuesta. En cualquier otro caso, incluido el empate, el punto pierde su apuesta y la cobra la banca. Si está activado el pago doble (por defecto sí), un punto que gana con siete y media natural (exactamente dos cartas: un 7 y una figura) cobra el doble de su apuesta. Si a la banca no le alcanzan las fichas, MUST pagar en orden de turno hasta quedarse sin fichas.

#### Scenario: La banca gana los empates
- **WHEN** un punto se planta con 6 y la banca se planta con 6
- **THEN** el punto pierde su apuesta y la cobra la banca

#### Scenario: La banca se pasa
- **WHEN** la banca se pasa y quedan dos puntos plantados
- **THEN** la banca paga su apuesta a cada uno de los dos

#### Scenario: Siete y media natural
- **WHEN** con el pago doble activado un punto que apostó 5 gana con un 7 y una Sota
- **THEN** cobra 10 fichas de la banca

#### Scenario: Siete y media de tres cartas sin la opción
- **WHEN** con el pago doble activado y sin la opción de cualquier siete y media, un punto que apostó 5 gana con un 4, un 3 y una Sota
- **THEN** cobra 5 fichas de la banca

## ADDED Requirements

### Requirement: Cobrar el doble con cualquier siete y media
La Siete y media MAY jugarse con la opción «Con cualquier siete y media» (desactivada por defecto), que solo cuenta con el pago doble activado. Una partida o una sala sin esa opción, o sin pago doble, MUST liquidarse como siempre.

Con la opción y el pago doble, todo punto que gana con siete y media MUST cobrar el doble de su apuesta, tenga las cartas que tenga. La banca MUST seguir ganando los empates, también a siete y media, y pagar en orden de turno mientras le alcancen las fichas.

#### Scenario: Siete y media de tres cartas con la opción
- **WHEN** con la opción un punto que apostó 5 gana con un 4, un 3 y una Sota
- **THEN** cobra 10 fichas de la banca

#### Scenario: Empate a siete y media
- **WHEN** con la opción un punto y la banca terminan los dos con siete y media
- **THEN** el punto pierde su apuesta y la cobra la banca

#### Scenario: Sin pago doble
- **WHEN** la opción está marcada pero el pago doble no
- **THEN** la partida se juega sin la opción y nadie cobra el doble
