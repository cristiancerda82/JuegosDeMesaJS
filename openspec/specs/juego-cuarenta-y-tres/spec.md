# juego-cuarenta-y-tres Specification

## Purpose
TBD - created by archiving change juego-cuarenta-y-tres. Update Purpose after archive.

## Requirements

### Requirement: Baraja, reparto y muestra del Cuarenta y tres
El Cuarenta y tres MUST jugarse entre 3 jugadores, cada uno contra los demás, con la baraja española de 40 cartas. En cada mano, el que reparte MUST dar 13 cartas a cada jugador, de una en una, empezando por el siguiente a él. La carta que sobra, la muestra, MUST quedar boca arriba en la mesa, y su palo MUST ser el triunfo de la mano. MUST salir el siguiente al que reparte, y el que reparte MUST pasar al siguiente en cada mano.

#### Scenario: Reparto de la primera mano
- **WHEN** empieza una partida
- **THEN** cada jugador tiene 13 cartas, la muestra está boca arriba en la mesa, su palo es el triunfo y sale el siguiente al que reparte

#### Scenario: Cambia el que reparte
- **WHEN** termina una mano y la partida sigue
- **THEN** reparte el siguiente al que repartió, se vuelven a dar 13 cartas a cada uno y hay una muestra nueva

### Requirement: Cambio de la muestra del Cuarenta y tres
Una vez por mano, en su turno y antes de jugar su carta, un jugador MAY cambiar la muestra por una carta de triunfo de su mano:
- por el 7 de triunfo, si la muestra es mayor que el 7;
- por el 2 de triunfo, si la muestra es el 7 o menor.

No MUST hacer falta haber ganado ninguna baza. Si la muestra es el 2, nadie MUST poder cambiarla. La carta entregada MUST quedarse en la mesa como muestra y no jugarse. Una muestra que no se cambia MUST quedarse en la mesa sin que nadie gane sus tantos.

#### Scenario: Cambiar antes de la primera baza
- **WHEN** la muestra es el As de oros, empieza la mano y el que sale tiene el 7 de oros
- **THEN** puede cambiarlo por el As de oros, que pasa a su mano, y el 7 de oros queda en la mesa

#### Scenario: Muestra baja
- **WHEN** la muestra es el 5 de copas
- **THEN** solo puede cambiarla quien tiene el 2 de copas

#### Scenario: Una sola vez por mano
- **WHEN** un jugador ya ha cambiado la muestra en la mano
- **THEN** nadie puede volver a cambiarla hasta la mano siguiente

### Requirement: Valor y orden de las cartas del Cuarenta y tres
Las cartas de cada palo MUST ordenarse, de mayor a menor, As, Tres, Rey, Caballo, Sota, 7, 6, 5, 4 y 2, y valer 11, 10, 4, 3 y 2 tantos el As, el Tres, el Rey, el Caballo y la Sota; las demás, nada. Quien gana la última baza MUST sumar 9 tantos más (las 9 de últimas). No MUST haber cantes.

#### Scenario: El Tres gana al Rey
- **WHEN** se sale con el Rey de un palo que no es triunfo y otro jugador echa el Tres de ese palo
- **THEN** la baza es de quien echó el Tres, si nadie falla

#### Scenario: Nueve de últimas
- **WHEN** un jugador gana la última baza de la mano
- **THEN** suma 9 tantos además de los de las cartas

### Requirement: Bazas y obligaciones del Cuarenta y tres
Quien gana una baza MUST salir en la siguiente. Al responder, cada jugador MUST:
- asistir al palo de salida y, si puede, superar la carta que va ganando de ese palo;
- sin el palo, fallar con un triunfo y, si la baza ya la gana un triunfo, superarlo;
- sin el palo, si la baza la gana un triunfo y no puede superarlo, jugar cualquier carta;
- sin el palo ni triunfos, jugar cualquier carta.

#### Scenario: Asistir y montar
- **WHEN** se sale con el Caballo de copas y un jugador tiene el As y el 4 de copas
- **THEN** solo puede echar el As de copas

#### Scenario: Fallar
- **WHEN** un jugador no tiene el palo de salida y tiene triunfos
- **THEN** tiene que echar un triunfo

#### Scenario: Sin poder superar el fallo
- **WHEN** un jugador no tiene el palo de salida, la baza la gana un triunfo y sus triunfos son menores
- **THEN** puede echar cualquier carta

### Requirement: Tantos y liquidación del Cuarenta y tres
Al terminar las 13 bazas, cada jugador MUST sumar los tantos de sus cartas y, si las ganó, las 9 de últimas. Cada jugador MUST anotarse en su saldo lo que pasa de 43 tantos, o en negativo lo que le falta para llegar a 43.

#### Scenario: Liquidación del primer ejemplo del libro
- **WHEN** los jugadores hacen 50, 55 y 24 tantos
- **THEN** sus saldos suben 7 y 12 y bajan 19

#### Scenario: Liquidación del segundo ejemplo del libro
- **WHEN** los jugadores hacen 100, 10 y 19 tantos
- **THEN** sus saldos suben 57 y bajan 33 y 24

### Requirement: Fin de la partida del Cuarenta y tres
La partida MUST durar 6 manos (por defecto) o 3, según la configuración. Al acabar la última, MUST ganar los jugadores con más saldo.

#### Scenario: Última mano
- **WHEN** termina la sexta mano de una partida de 6
- **THEN** la partida termina y ganan los que tienen más saldo

### Requirement: Vista del jugador del Cuarenta y tres
La vista de cada jugador MUST mostrar:
- su mano y cuántas cartas tienen los demás;
- la muestra, el triunfo y, si se ha cambiado, quién la cambió y qué carta se llevó;
- la baza en curso, la última baza y las bazas jugadas en la mano;
- los tantos y las bazas de cada jugador en la mano;
- los saldos, el número de la mano y los resultados de las manos anteriores.

La vista no MUST mostrar las cartas de las manos de los demás.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** ve su mano, la muestra y solo cuántas cartas tienen los demás
