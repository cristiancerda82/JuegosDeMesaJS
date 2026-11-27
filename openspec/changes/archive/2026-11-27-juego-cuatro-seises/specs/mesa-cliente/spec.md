## ADDED Requirements

### Requirement: Cuatro seises en la suite
El menú MUST incluir el Cuatro seises junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido, la baraja (40 o 48 cartas), el número de jugadores que la dividen y el número de manos (3, 1 o 5). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Cuatro seises
- **WHEN** el jugador elige el Cuatro seises con 4 jugadores y la baraja de 40 y empieza
- **THEN** se abre su mesa con sus 10 cartas, tres rivales y el fondo con 4 fichas

#### Scenario: Jugadores según la baraja
- **WHEN** el jugador elige la baraja de 48 en las opciones
- **THEN** puede elegir 4, 6 u 8 jugadores, pero no 5

### Requirement: Mesa del Cuatro seises
La mesa del Cuatro seises MUST mostrar:
- una fila por palo con los huecos de su escalera, las cartas puestas y los huecos donde se puede jugar;
- la mano del jugador, ordenada por palos, y cuántas cartas y fichas tiene cada rival;
- el fondo, el número de la mano y las fichas del jugador;
- de quién es el turno y la última jugada o el último pase.

La mesa MUST dejar jugar solo las cartas que encajan y ofrecer el botón de pasar solo cuando no hay ninguna. Al terminar cada mano, MUST mostrar un resumen con quién se lleva el fondo, los pases de cada jugador, lo que gana o paga cada uno y los saldos.

La pantalla de fin MUST mostrar la clasificación por fichas y el resumen de la última mano.

La mesa del Cinquillo MUST seguir mostrando lo mismo que antes.

#### Scenario: Pasar y pagar
- **WHEN** al jugador le toca y no tiene ninguna carta que encaje
- **THEN** solo puede pasar y, al hacerlo, el fondo sube una ficha

#### Scenario: Resumen de la mano
- **WHEN** termina una mano
- **THEN** sale el resumen con quién se lleva el fondo y lo que gana o paga cada uno
