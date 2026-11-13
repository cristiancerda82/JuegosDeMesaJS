# juego-polignac Specification

## Purpose
TBD - created by archiving change juego-polignac. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Polignac
El Polignac MUST jugarse entre 3 y 6 jugadores con cartas francesas del 7 al As. En cada palo, el orden de mayor a menor MUST ser As, K, Q, J, 10, 9, 8, 7.

| Jugadores | Baraja | Cartas por jugador |
|---|---|---|
| 3 | 30 (sin el 7 de picas ni el de tréboles) | 10 |
| 4 | 32 | 8 |
| 5 | 30 (sin el 7 de picas ni el de tréboles) | 6 |
| 6 | 30 (sin el 7 de picas ni el de tréboles) | 5 |

En la primera mano reparte el asiento 0, y el que reparte pasa al siguiente en cada mano.

#### Scenario: Reparto con 4
- **WHEN** empieza una mano con 4 jugadores
- **THEN** cada jugador tiene 8 cartas

#### Scenario: Reparto con 5
- **WHEN** empieza una mano con 5 jugadores
- **THEN** cada jugador tiene 6 cartas y ninguno tiene el 7 de picas ni el de tréboles

### Requirement: Bazas del Polignac
- **Salida:** en la primera baza sale el jugador siguiente al que reparte (o el que anunció el general); después, quien gana la baza anterior.
- **Al responder:** el jugador MUST seguir el palo de salida si puede; si no, puede echar cualquier carta.
- **Ganadora:** no hay triunfo, y la baza la gana la carta más alta del palo de salida.

#### Scenario: Sin triunfo
- **WHEN** sale el 7 de picas y los demás echan el As de corazones, el 8 de picas y el K de tréboles
- **THEN** gana el 8 de picas

#### Scenario: Seguir el palo
- **WHEN** sale una carta de corazones y el jugador tiene corazones
- **THEN** solo puede echar corazones

### Requirement: Puntos del Polignac
Fuera del general, quien gana una baza MUST restar 1 punto por cada J que contiene, y 2 por la J de picas. La mano MUST acabar en cuanto se han ganado las cuatro J.

#### Scenario: La J de picas
- **WHEN** un jugador gana una baza con la J de picas y la J de corazones
- **THEN** anota −3 en la mano

#### Scenario: Se acaba antes
- **WHEN** se gana la cuarta J y aún quedan cartas en las manos
- **THEN** la mano se acaba y se reparte la siguiente

### Requirement: General del Polignac
La partida MAY jugarse con el general (sí por defecto). Con el general, antes de la primera baza de cada mano:
- empezando por el jugador que sale y siguiendo el orden de juego, cada jugador MUST decidir si anuncia el general o pasa;
- el primero que lo anuncia lo juega: los demás ya no deciden, y sale él;
- si todos pasan, la mano se juega como siempre.

En la mano del general, las J no cuentan:
- si el que lo juega gana todas las bazas, cada uno de los demás MUST anotar −5 y él 0;
- en cuanto pierde una baza, la mano MUST acabar: él anota −5 y los demás 0.

#### Scenario: Anunciar el general
- **WHEN** el primero en decidir pasa y el segundo anuncia el general
- **THEN** el segundo sale en la primera baza y los demás ya no deciden

#### Scenario: General cumplido
- **WHEN** el que juega el general gana todas las bazas con 4 jugadores
- **THEN** anota 0 y cada uno de los otros tres anota −5

#### Scenario: General fallido
- **WHEN** el que juega el general pierde la tercera baza
- **THEN** la mano se acaba y él anota −5

#### Scenario: Sin general
- **WHEN** la partida se juega sin el general
- **THEN** cada mano empieza directamente con la primera baza

### Requirement: Fin de la partida del Polignac
El límite de la partida MUST poder ser −10, −20 o −30 (−10 por defecto). La partida MUST terminar al acabar la mano en la que algún jugador llega al límite o lo pasa. Gana quien tiene más puntos; si varios empatan arriba, ganan todos ellos; si todos empatan, es empate.

#### Scenario: Llegar al límite
- **WHEN** con el límite en −10, un jugador con −9 gana la J de picas
- **THEN** la mano se acaba, la partida termina y gana quien tiene más puntos

### Requirement: Vista del jugador en el Polignac
La vista de cada jugador MUST mostrar:
- su mano;
- cuántas cartas tienen los otros;
- quién reparte y quién juega el general, si lo hay;
- la baza en curso y la última baza;
- las cartas jugadas en la mano y los palos que cada uno no siguió;
- los puntos de la mano;
- el marcador y el resumen de las manos anteriores.

La vista MUST NOT mostrar las manos ajenas.

#### Scenario: Manos ocultas
- **WHEN** un jugador mira la mesa
- **THEN** ve su mano y cuántas cartas tiene cada uno de los demás, pero no cuáles
