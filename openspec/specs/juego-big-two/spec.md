# juego-big-two Specification

## Purpose
TBD - created by archiving change juego-big-two. Update Purpose after archive.

## Requirements

### Requirement: Reparto y orden del Big Two
El Big Two MUST jugarse con 4 jugadores, cada uno por su cuenta, y la baraja francesa de 52 cartas: 13 a cada uno en cada mano. El orden de los números MUST ser, de menor a mayor, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A y 2. Entre cartas del mismo número, el palo MUST desempatar: diamantes < tréboles < corazones < picas.

#### Scenario: El 2 es la más alta
- **WHEN** se comparan el As de picas y el 2 de diamantes
- **THEN** gana el 2 de diamantes

#### Scenario: Desempate por palo
- **WHEN** se comparan el 9 de corazones y el 9 de tréboles
- **THEN** gana el 9 de corazones

### Requirement: Jugadas del Big Two
Una jugada MUST ser una de estas:
- **suelta:** una carta;
- **pareja:** dos del mismo número;
- **trío:** tres del mismo número;
- **de 5:** de menor a mayor, escalera (5 números seguidos en el orden del juego, sin dar la vuelta), color (5 del mismo palo), full (un trío y una pareja), póker (cuatro del mismo número y una carta cualquiera) y escalera de color.

Una jugada solo MUST poder superarse con otra del mismo número de cartas. Las comparaciones MUST hacerse así:
- **sueltas:** por número y palo;
- **parejas:** por número y, a igualdad, por la carta más alta;
- **tríos:** por número;
- **de 5 de distinto tipo:** gana el tipo más alto;
- **de 5 del mismo tipo:**
  - las escaleras y las escaleras de color, por su carta más alta;
  - los colores, por su carta más alta;
  - el full, por el número del trío;
  - el póker, por el número de las cuatro.

#### Scenario: Pareja contra pareja
- **WHEN** en la mesa hay una pareja de 8 y el jugador tiene una pareja de 10 y un trío de 5
- **THEN** puede jugar la pareja de 10, pero no el trío

#### Scenario: Full contra color
- **WHEN** en la mesa hay un color y el jugador tiene un full
- **THEN** el full la supera

#### Scenario: Escalera sin vuelta
- **WHEN** el jugador tiene K, A, 2, 3 y 4
- **THEN** no forman escalera

### Requirement: Rondas del Big Two
En cada mano MUST empezar quien tiene el 3 de diamantes, y su primera jugada MUST llevarlo. Después, por turno, cada jugador MUST superar la última jugada de la mesa o pasar; pasar no le impide jugar más tarde en la misma ronda. Cuando los otros tres pasan seguidos tras una jugada, la ronda MUST terminar: la mesa se vacía y quien hizo esa jugada sale con la jugada que quiera (sin poder pasar).

#### Scenario: Primera jugada con el 3 de diamantes
- **WHEN** empieza una mano
- **THEN** sale el jugador que tiene el 3 de diamantes, y todas sus jugadas legales lo llevan

#### Scenario: Todos pasan
- **WHEN** un jugador suelta una pareja y los otros tres pasan
- **THEN** la mesa queda vacía y vuelve a salir ese jugador con lo que quiera

### Requirement: Puntos y partida del Big Two
La mano MUST terminar cuando un jugador se queda sin cartas. Cada uno de los demás MUST sumar tantos puntos como cartas le quedan, el doble si le quedan 10 o más y el triple si le quedan 13. Cuando al terminar una mano alguien llega a 50 puntos o más, la partida MUST terminar y ganar quien tenga menos puntos (o los que empaten con menos). Si no, MUST repartirse otra mano.

#### Scenario: Puntos de una mano
- **WHEN** termina una mano y a los demás les quedan 3, 10 y 13 cartas
- **THEN** suman 3, 20 y 39 puntos

#### Scenario: Fin de la partida
- **WHEN** al terminar una mano los totales son 52, 30, 18 y 41
- **THEN** la partida termina y gana el jugador con 18

### Requirement: Vista del jugador en el Big Two
Cada jugador MUST ver:
- su mano y cuántas cartas tienen los demás;
- la última jugada de la mesa y quién la hizo;
- quién ha pasado desde entonces y de quién es el turno;
- las cartas ya jugadas en la mano;
- los puntos de cada uno y el resultado de las manos anteriores.

Las manos ajenas MUST quedar ocultas.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás
