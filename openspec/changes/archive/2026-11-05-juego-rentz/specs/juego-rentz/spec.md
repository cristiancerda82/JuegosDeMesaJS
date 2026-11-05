## ADDED Requirements

### Requirement: Baraja y reparto del Rentz
El Rentz MUST jugarse entre 4 jugadores con 32 cartas francesas (del 7 al As). En cada palo, el orden de mayor a menor MUST ser As, K, Q, J, 10, 9, 8, 7.

En cada mano, cada jugador MUST recibir 8 cartas. En la primera mano reparte el asiento 0, y el que reparte pasa al siguiente en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 8 cartas

### Requirement: Elegir contrato en el Rentz
En cada mano, el que reparte MUST elegir uno de los siete contratos que aún no ha jugado él:
- sin bazas;
- sin corazones;
- sin damas;
- sin el K de corazones;
- sin la última baza;
- dominó;
- bazas.

Cada jugador MUST jugar cada contrato una sola vez como el que elige. La partida tiene así 28 manos.

#### Scenario: Contratos que quedan
- **WHEN** el jugador ya eligió sin damas y dominó en sus manos anteriores
- **THEN** solo puede elegir entre los otros cinco

#### Scenario: Cada uno los suyos
- **WHEN** otro jugador ya eligió sin damas
- **THEN** el jugador aún puede elegirlo

### Requirement: Bazas del Rentz
En los contratos de bazas:
- **Salida:** en la primera baza sale el que eligió el contrato; después, quien gana la baza anterior.
- **Al responder:** el jugador MUST seguir el palo de salida si puede; si no, puede echar cualquier carta.
- **Ganadora:** no hay triunfo, y la baza la gana la carta más alta del palo de salida.

#### Scenario: Sin triunfo
- **WHEN** sale el 7 de picas y los demás echan el As de corazones, el 8 de picas y el K de tréboles
- **THEN** gana el 8 de picas

### Requirement: Puntos de los contratos del Rentz
Cada contrato MUST puntuar así:

| Contrato | Puntos |
|---|---|
| Sin bazas | −5 por cada baza ganada |
| Sin corazones | −5 por cada corazón ganado |
| Sin damas | −10 por cada dama ganada |
| Sin el K de corazones | −40 para quien gane el K de corazones |
| Sin la última baza | −40 para quien gane la última baza |
| Bazas | +5 por cada baza ganada |

En sin corazones, sin damas y sin el K de corazones, la mano MUST acabar en cuanto se han ganado todas las cartas que restan.

#### Scenario: Sin damas
- **WHEN** en sin damas un jugador gana una baza con dos damas
- **THEN** anota −20

#### Scenario: Se acaba antes
- **WHEN** en sin el K de corazones alguien gana el K de corazones en la tercera baza
- **THEN** la mano se acaba y esa persona anota −40

#### Scenario: Bazas positivas
- **WHEN** en el contrato de bazas un jugador gana 3 bazas
- **THEN** anota +15

### Requirement: Dominó del Rentz
En el dominó:
- abre el que eligió el contrato;
- cada palo MUST empezarse con su J;
- después, cada palo crece de uno en uno hacia arriba (Q, K, As) y hacia abajo (10, 9, 8, 7);
- quien no tiene ninguna carta que encaje MUST pasar, y si tiene alguna, MUST poner una;
- quien se queda sin cartas deja de jugar.

Por orden de acabar, los jugadores MUST anotar +40, +20, +10 y 0.

#### Scenario: Abrir con una J
- **WHEN** empieza el dominó y aún no hay ninguna fila
- **THEN** solo se pueden poner J

#### Scenario: Pasar
- **WHEN** a un jugador no le encaja ninguna carta
- **THEN** pasa y le toca al siguiente que tiene cartas

#### Scenario: Puntos del dominó
- **WHEN** acaban en el orden 2, 0, 3 y 1
- **THEN** anotan +40 el 2, +20 el 0, +10 el 3 y 0 el 1

### Requirement: Fin de la partida del Rentz
La partida MUST terminar tras 28 manos. Gana quien tiene más puntos; si varios empatan arriba, ganan todos ellos.

#### Scenario: Fin de la partida
- **WHEN** termina la mano 28
- **THEN** la partida acaba y gana el jugador con más puntos

### Requirement: Vista del jugador en el Rentz
La vista de cada jugador MUST mostrar:
- su mano;
- cuántas cartas tienen los otros;
- el contrato de la mano;
- los contratos que ha jugado cada uno;
- la baza en curso, la última baza y las filas del dominó;
- los puntos de la mano;
- el marcador y el resumen de las manos anteriores.

La vista MUST NOT mostrar las manos ajenas.

#### Scenario: Manos ocultas
- **WHEN** un jugador mira la mesa
- **THEN** ve su mano y cuántas cartas tiene cada uno de los demás, pero no cuáles
