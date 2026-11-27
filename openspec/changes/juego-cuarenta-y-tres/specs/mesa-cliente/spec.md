## ADDED Requirements

### Requirement: Cuarenta y tres en la suite
El menú MUST incluir el Cuarenta y tres junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido y el número de manos (6 o 3). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Cuarenta y tres
- **WHEN** el jugador elige el Cuarenta y tres y empieza
- **THEN** se abre su mesa con sus 13 cartas, dos rivales y la muestra a la vista

### Requirement: Mesa del Cuarenta y tres
La mesa del Cuarenta y tres MUST mostrar:
- la mano del jugador, ordenada por palos, y las de los rivales boca abajo;
- la muestra y el triunfo;
- los tantos de cada jugador en la mano y su saldo;
- el número de la mano y cuántas tiene la partida;
- la baza en curso y a quién le toca.

Cuando el jugador puede cambiar la muestra, la mesa MUST ofrecerle un botón para hacerlo, y MUST avisar cuando la cambia otro jugador. La mesa MUST dejar jugar solo las cartas permitidas por las obligaciones. Al terminar cada mano, MUST mostrar un resumen con los tantos de cada jugador, quién ganó las últimas, lo que cada uno cobra o paga respecto a 43 y los saldos.

La pantalla de fin MUST mostrar la clasificación por saldo y el resumen de la última mano.

#### Scenario: Cambiar la muestra desde la mesa
- **WHEN** al jugador le toca y tiene la carta con la que se cambia la muestra
- **THEN** la mesa le ofrece cambiarla y, al pulsar, la muestra pasa a su mano

#### Scenario: Resumen de la mano
- **WHEN** termina una mano
- **THEN** sale el resumen con los tantos de cada jugador y lo que cobra o paga cada uno
