# juego-schnapsen Specification

## Purpose
TBD - created by archiving change juego-schnapsen. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Schnapsen
El Schnapsen MUST jugarse con 2 jugadores y la baraja francesa de 20 cartas: As, 10, K, Q y J de cada palo. El orden MUST ser, de mayor a menor, As, 10, K, Q y J, y sus valores 11, 10, 4, 3 y 2. En cada mano, el repartidor MUST dar 5 cartas a cada jugador y poner boca arriba la siguiente, la *carta vuelta*, cuyo palo es el triunfo. Las otras 9 quedan boca abajo en el mazo, y la carta vuelta MUST ser la última que se roba. El repartidor MUST alternarse cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 5 cartas, hay una carta vuelta a la vista, quedan 9 en el mazo y sale el que no reparte

### Requirement: Bazas con el mazo abierto en el Schnapsen
Mientras el mazo esté abierto y tenga cartas, MUST poderse jugar cualquier carta. La baza la gana el triunfo más alto o, si no hay ninguno, la carta más alta del palo de salida. Tras cada baza, el ganador MUST robar primero y el otro después, y el ganador sale en la siguiente.

#### Scenario: Sin obligación de seguir el palo
- **WHEN** con el mazo abierto sale el As de picas y el jugador tiene picas
- **THEN** puede jugar cualquier carta de su mano

#### Scenario: Robar tras la baza
- **WHEN** termina una baza con cartas en el mazo
- **THEN** los dos vuelven a tener 5 cartas y el ganador ha robado la primera

### Requirement: Cambiar la J del triunfo en el Schnapsen
En su turno de salida, antes de jugar y mientras el mazo esté abierto y con cartas, el jugador que tiene la J del triunfo MAY cambiarla por la carta vuelta, y la J MUST quedar como carta vuelta.

#### Scenario: Cambio de la J
- **WHEN** la carta vuelta es el As de corazones y el jugador que sale tiene la J de corazones
- **THEN** puede cambiarla: se queda el As de corazones y la J de corazones queda boca arriba bajo el mazo

### Requirement: Cantes del Schnapsen
En su turno de salida, el jugador que tiene el K y la Q de un mismo palo MAY cantarlos: 20 puntos, o 40 si son del triunfo. Después MUST salir con el K o la Q de ese palo. Cada pareja se canta una sola vez. Los puntos de un cante MUST sumarse solo cuando el jugador haya ganado al menos una baza en la mano; hasta entonces quedan pendientes.

#### Scenario: Cantar 40
- **WHEN** el jugador que sale tiene el K y la Q del triunfo y los canta
- **THEN** suma 40 puntos si ya ha ganado alguna baza, y tiene que salir con el K o la Q del triunfo

#### Scenario: Cante pendiente
- **WHEN** el jugador que aún no ha ganado ninguna baza canta 20
- **THEN** los 20 puntos no cuentan hasta que gane su primera baza

### Requirement: Cerrar el mazo en el Schnapsen
En su turno de salida, mientras el mazo tenga cartas, el jugador MAY cerrarlo. Desde entonces no se roba y rigen las reglas estrictas, como cuando el mazo se agota.

Con las reglas estrictas, al responder MUST cumplirse:
- si se tiene el palo de salida, hay que jugarlo, y con una carta que gane la baza si se tiene;
- si no se tiene el palo, hay que jugar triunfo si se tiene;
- si no, cualquier carta.

#### Scenario: Cerrar el mazo
- **WHEN** el jugador que sale cierra el mazo
- **THEN** después de cada baza nadie roba

#### Scenario: Seguir y ganar con el mazo cerrado
- **WHEN** con el mazo cerrado sale el K de picas y el jugador tiene el As y la J de picas
- **THEN** tiene que jugar el As de picas

#### Scenario: Fallar con el mazo agotado
- **WHEN** con el mazo agotado sale el K de picas, el jugador no tiene picas y tiene triunfos
- **THEN** tiene que jugar un triunfo

### Requirement: Fin de la mano y puntos de partida del Schnapsen
Los puntos de un jugador en la mano MUST ser los de las cartas de sus bazas más sus cantes que ya cuentan. La mano MUST terminar:
- en cuanto un jugador llega a 66 puntos, que gana la mano;
- si el mazo se agotó sin cerrarse y se juegan todas las bazas sin que nadie llegue, gana quien hizo la última baza;
- si se cerró el mazo y se juegan todas las bazas sin que quien lo cerró llegue a 66, gana el otro.

El ganador de la mano MUST apuntarse puntos de partida:
- 3 si el perdedor no hizo ninguna baza;
- 2 si el perdedor hizo menos de 33 puntos;
- 1 en otro caso.

Si se cerró el mazo, MUST contar el estado del rival en el momento de cerrar. Si quien cerró no gana la mano, el otro MUST apuntarse 2, o 3 si al cerrar aún no tenía ninguna baza.

La partida MUST terminar cuando un jugador llega a 7 puntos de partida, y la gana él.

#### Scenario: Llegar a 66
- **WHEN** un jugador con 60 puntos gana una baza de 10
- **THEN** la mano termina y la gana él

#### Scenario: El rival sin bazas
- **WHEN** un jugador gana la mano y el rival no ha hecho ninguna baza
- **THEN** se apunta 3 puntos de partida

#### Scenario: Cierre fallido
- **WHEN** quien cerró el mazo no llega a 66 y el otro tenía bazas al cerrar
- **THEN** el otro gana la mano y se apunta 2 puntos de partida

### Requirement: Vista del jugador en el Schnapsen
Cada jugador MUST ver:
- su mano y cuántas cartas tiene el rival;
- cuántas cartas quedan en el mazo, la carta vuelta y si el mazo está cerrado;
- la baza en curso, la última baza y las cartas jugadas en la mano;
- los puntos de la mano de cada uno, sus bazas y los cantes;
- los puntos de partida y el resultado de las manos anteriores.

La mano del rival y las cartas boca abajo del mazo MUST quedar ocultas.

#### Scenario: Mano del rival oculta
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano del rival ni de las boca abajo del mazo
