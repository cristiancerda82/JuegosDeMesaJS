# juego-sheepshead Specification

## Purpose
TBD - created by archiving change juego-sheepshead. Update Purpose after archive.

## Requirements

### Requirement: Baraja y triunfos del Sheepshead
El Sheepshead MUST jugarse entre 5 jugadores con 32 cartas francesas (del 7 al As).

Los puntos de las cartas MUST ser: As 11, 10 10, K 4, Q 3, J 2 y el resto 0, con 120 en total.

Los triunfos MUST ser 14, de mayor a menor:
- Q de tréboles, Q de picas, Q de corazones y Q de diamantes;
- J de tréboles, J de picas, J de corazones y J de diamantes;
- As, 10, K, 9, 8 y 7 de diamantes.

En tréboles, picas y corazones, el orden sin las Q ni las J MUST ser As, 10, K, 9, 8, 7.

#### Scenario: Las damas mandan
- **WHEN** en una baza se juegan la J de tréboles, la Q de diamantes y el As de diamantes
- **THEN** gana la Q de diamantes

#### Scenario: El 10 gana al K
- **WHEN** en una baza de corazones se juegan el K y el 10 de corazones y nadie echa triunfo
- **THEN** gana el 10

### Requirement: Reparto del Sheepshead
En cada mano, cada jugador MUST recibir 6 cartas y las 2 restantes MUST quedar boca abajo en el blind. En la primera mano reparte el asiento 4, y el que reparte pasa al siguiente en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 6 cartas y hay 2 en el blind que nadie ve

### Requirement: Coger el blind en el Sheepshead
Empezando por el que sigue al que reparte, cada jugador MUST elegir entre coger el blind o pasar. El primero que lo coge es el picker y la ronda acaba.

El picker:
- MUST quedarse las 2 cartas del blind;
- MUST enterrar 2 cartas de su mano, que cuentan como puntos suyos al final de la mano;
- MUST NOT enterrar la J de diamantes.

Si los 5 pasan, se juega el leaster.

#### Scenario: Coger y enterrar
- **WHEN** el tercer jugador coge el blind y entierra 2 cartas
- **THEN** es el picker, tiene 6 cartas y sus 2 enterradas cuentan para su bando

#### Scenario: No se entierra la J de diamantes
- **WHEN** el picker tiene la J de diamantes y va a enterrar
- **THEN** no puede enterrarla

### Requirement: Compañero del Sheepshead
Con picker, su compañero MUST ser el jugador que tiene la J de diamantes. Nadie MUST saber quién es (salvo él mismo) hasta que la juega. Si la J de diamantes es del picker, MUST jugar solo contra los cuatro.

#### Scenario: Se descubre el compañero
- **WHEN** un jugador que no es el picker juega la J de diamantes
- **THEN** todos ven que es el compañero del picker

#### Scenario: El picker solo
- **WHEN** el picker tiene la J de diamantes
- **THEN** juega solo y, al jugarla, todos ven que no tiene compañero

### Requirement: Bazas del Sheepshead
- **Salida:** en la primera baza sale el que sigue al que reparte; después, quien gana la baza anterior.
- **Al responder:** el jugador MUST seguir el palo de salida si puede, contando todos los triunfos como un palo; si no, puede echar cualquier carta.
- **Sin obligaciones de más:** no hay obligación de ganar la baza ni de fallar.
- **Ganadora:** la baza la gana el triunfo más alto o, si no hay triunfo, la carta más alta del palo de salida.

#### Scenario: Seguir al triunfo con una J
- **WHEN** sale el 7 de diamantes y el jugador tiene la J de picas y el As de tréboles
- **THEN** solo puede echar la J de picas

#### Scenario: Sin el palo, cualquier carta
- **WHEN** sale el As de corazones y el jugador no tiene corazones
- **THEN** puede echar cualquier carta

### Requirement: Puntos de la mano del Sheepshead con picker
El bando del picker (con el blind enterrado) MUST ganar con 61 puntos o más. Cada jugador MUST anotar según esta tabla:

| Resultado del bando del picker | Picker | Compañero | Cada rival |
|---|---|---|---|
| Gana (61 a 90) | +2 | +1 | −1 |
| Gana con schneider (91 o más) | +4 | +2 | −2 |
| Gana con schwarz (todas las bazas) | +6 | +3 | −3 |
| Pierde (31 a 60) | −4 | −2 | +2 |
| Pierde con schneider (30 o menos) | −8 | −4 | +4 |
| Pierde con schwarz (ninguna baza) | −12 | −6 | +6 |

Si el picker juega solo, MUST anotar lo suyo más lo del compañero. Las anotaciones de una mano suman siempre 0.

#### Scenario: Gana el picker con su compañero
- **WHEN** el bando del picker suma 75
- **THEN** el picker anota +2, el compañero +1 y cada rival −1

#### Scenario: Pierde con schneider
- **WHEN** el bando del picker suma 28 y ganó alguna baza
- **THEN** el picker anota −8, el compañero −4 y cada rival +4

#### Scenario: Gana solo
- **WHEN** el picker juega solo y suma 95
- **THEN** anota +8 y cada rival −2

### Requirement: Leaster del Sheepshead
Si nadie coge el blind:
- cada jugador MUST jugar para sí;
- el blind MUST sumarse a quien gana la última baza;
- gana la mano quien hace menos puntos con al menos una baza;
- si empatan, gana el que hizo menos bazas; si sigue el empate, el primero en el orden de juego desde el que sigue al que reparte;
- el ganador MUST anotar +4 y cada uno de los otros, −1.

#### Scenario: Gana el leaster
- **WHEN** todos pasan y, de los que ganaron alguna baza, el jugador 3 hace menos puntos
- **THEN** el jugador 3 anota +4 y los demás −1

#### Scenario: Sin bazas no se gana
- **WHEN** el jugador 2 no gana ninguna baza en el leaster
- **THEN** no puede ganar el leaster aunque tenga 0 puntos

### Requirement: Fin de la partida del Sheepshead
La partida MUST terminar tras 10 manos. Gana quien tiene más puntos; si varios empatan arriba, ganan todos ellos.

#### Scenario: Fin a las 10 manos
- **WHEN** termina la décima mano
- **THEN** la partida acaba y gana el jugador con más puntos

### Requirement: Vista del jugador en el Sheepshead
La vista de cada jugador MUST mostrar:
- su mano;
- cuántas cartas tienen los otros;
- quién ha pasado y quién es el picker;
- el compañero, en cuanto juega la J de diamantes;
- si es el picker, sus cartas enterradas;
- la baza en curso, la última baza, las bazas y los puntos de cartas de cada uno en la mano;
- el marcador y el resumen de las manos anteriores.

La vista MUST NOT mostrar:
- las manos ajenas;
- el blind (salvo al picker, que lo recoge);
- las cartas enterradas a quien no es el picker;
- quién es el compañero antes de que juegue la J de diamantes.

#### Scenario: El compañero oculto
- **WHEN** el jugador no es el picker ni tiene la J de diamantes, y aún no se ha jugado
- **THEN** su vista no dice quién es el compañero
