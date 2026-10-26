# juego-casino Specification

## Purpose
TBD - created by archiving change juego-casino. Update Purpose after archive.

## Requirements

### Requirement: Jugadores y reparto del Casino
El Casino MUST jugarse con la baraja francesa de 52 cartas y 2, 3 o 4 jugadores (2 por defecto), cada uno por su cuenta. Con 4, la configuración MUST permitir jugar en parejas (0 y 2 contra 1 y 3): entonces las cartas recogidas, las barridas y los puntos son de la pareja.

Al empezar cada mano, el repartidor MUST dar 4 cartas a cada jugador y poner 4 boca arriba en la mesa. Cuando todos los jugadores se quedan sin cartas y queda mazo, MUST dar otras 4 a cada uno, sin poner más en la mesa. Empieza el jugador a la izquierda del repartidor, y el repartidor rota cada mano.

#### Scenario: Reparto de 2 jugadores
- **WHEN** empieza una mano de 2 jugadores
- **THEN** cada uno tiene 4 cartas, la mesa tiene 4 y el mazo 40

#### Scenario: Nuevo reparto
- **WHEN** los 2 jugadores se quedan sin cartas y quedan 40 en el mazo
- **THEN** cada uno recibe 4 cartas, la mesa no recibe ninguna y quedan 32

### Requirement: Valores del Casino
El As MUST valer 1 y del 2 al 10, su número. Las figuras (J, Q y K) no tienen valor de suma: solo se recogen por pareja (una J recoge las J de la mesa) y no entran en construcciones.

#### Scenario: Figura
- **WHEN** el jugador juega una Q y en la mesa hay una Q y una construcción de 10
- **THEN** solo puede recoger la Q

### Requirement: Recoger en el Casino
Al recoger con una carta, el jugador MUST llevarse, junto con ella:
- las cartas sueltas de la mesa de su mismo número;
- las construcciones de su valor;
- y, con una carta numérica, las combinaciones de cartas sueltas que suman su valor, escogidas de forma que se lleve las más cartas posibles sin repetir ninguna.

Si con eso deja la mesa vacía, MUST apuntarse una barrida, salvo que sea la última jugada de la mano. El jugador pasa a ser el último que ha recogido.

#### Scenario: Recoger por número y por suma
- **WHEN** el jugador juega un 8 y en la mesa hay un 8, un 5, un 3 y un 2
- **THEN** recoge el 8 y el 5 con el 3, y en la mesa queda el 2

#### Scenario: Barrida
- **WHEN** el jugador juega un 9 y en la mesa solo hay un 4 y un 5, y no es la última jugada de la mano
- **THEN** recoge las dos cartas y se apunta una barrida

### Requirement: Construir en el Casino
Una construcción MUST ser un montón de la mesa con un valor (del 2 al 10), un dueño y la marca de si es múltiple. Para construir, el jugador MUST tener en la mano otra carta del valor que resulta, y MAY:
- **construir:** juntar su carta con una o varias cartas sueltas de la mesa cuya suma con ella dé el valor (un 3 sobre un 5, teniendo un 8);
- **subir** una construcción que no sea múltiple, de cualquier dueño, añadiéndole su carta: el nuevo valor es la suma (un 2 sobre una construcción de 6 hace una de 8);
- **hacer múltiple** una construcción, añadiéndole su carta y cartas sueltas que juntas sumen el mismo valor (un 5 y un 3 sueltos sobre una construcción de 8), o su carta sola si es de ese valor.

Quien construye, sube o hace múltiple una construcción pasa a ser su dueño. Una construcción múltiple no se puede subir.

#### Scenario: Construir
- **WHEN** el jugador tiene un 3 y un 8, y en la mesa hay un 5
- **THEN** puede juntar el 3 con el 5 en una construcción de 8 suya

#### Scenario: Sin la carta para recogerla
- **WHEN** el jugador tiene un 3 y un 7, y en la mesa hay un 5
- **THEN** no puede construir un 8

#### Scenario: Subir una construcción
- **WHEN** el rival tiene en la mesa una construcción de 6, y el jugador tiene un 2 y un 8
- **THEN** puede subirla a 8 con su 2, y la construcción pasa a ser suya

#### Scenario: Construcción múltiple
- **WHEN** el jugador tiene una construcción de 8, y juega otro 8 sobre ella teniendo un tercer 8
- **THEN** la construcción sigue valiendo 8, es múltiple y ya no se puede subir

### Requirement: Dejar una carta en el Casino
El jugador MAY dejar su carta boca arriba en la mesa, sin recoger ni construir, salvo que tenga en la mesa una construcción suya: entonces MUST recoger o construir.

#### Scenario: Con construcción propia no se deja
- **WHEN** el jugador tiene una construcción de 8 en la mesa
- **THEN** dejar una carta no es una acción legal

### Requirement: Fin de la mano y puntos del Casino
Cuando el mazo se acaba y nadie tiene cartas, la mano MUST terminar: las cartas que quedan en la mesa, también las de las construcciones, se las lleva el último que recogió. Después se MUST puntuar:
- más cartas: 3 (con empate, nadie);
- más picas: 1 (con empate, nadie);
- el 10 de diamantes (Big Casino): 2;
- el 2 de picas (Little Casino): 1;
- cada As: 1;
- cada barrida: 1.

El resultado de la mano MUST registrar el desglose de cada jugador o pareja.

#### Scenario: Puntos de una mano
- **WHEN** un jugador termina con 30 cartas, 8 picas, el 10 de diamantes, 2 Ases y una barrida, y el otro con 22 cartas, 5 picas, el 2 de picas y 2 Ases
- **THEN** el primero suma 3 + 1 + 2 + 2 + 1 = 9 y el segundo 1 + 2 = 3

### Requirement: Partida del Casino
La partida MUST jugarse a 21 puntos: al terminar una mano en la que alguien llega a 21 o más, gana quien más puntos tiene. Si hay empate en lo más alto, se juega otra mano.

#### Scenario: Llegar a 21
- **WHEN** al terminar una mano los totales son 23 y 18
- **THEN** la partida termina y gana el que tiene 23

### Requirement: Vista del jugador en el Casino
Cada jugador MUST ver su mano, cuántas cartas tienen los demás y quedan en el mazo, la mesa (las cartas sueltas y las construcciones con su valor, su dueño, sus cartas y si son múltiples), las cartas que ha recogido cada uno o cada pareja, las barridas, quién recogió el último, la última acción, los puntos y el resultado de las manos anteriores. Las manos ajenas y el mazo MUST quedar ocultos.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás ni del mazo
