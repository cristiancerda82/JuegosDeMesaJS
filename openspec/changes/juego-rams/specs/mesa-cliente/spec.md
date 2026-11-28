## ADDED Requirements

### Requirement: Rams en la suite
El menú MUST incluir el Rams junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido y el número de jugadores (de 3 a 6). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Rams
- **WHEN** el jugador elige el Rams con 4 jugadores y empieza
- **THEN** se abre su mesa con sus 5 cartas, tres rivales, el pinte y sus 5 fichas

### Requirement: Mesa del Rams
La mesa del Rams MUST mostrar:
- la mano del jugador, ordenada por palos, y las de los rivales boca abajo;
- junto a cada jugador, sus fichas y lo que ha dicho en la mano, o que se ha retirado sin fichas;
- el pinte en la mesa y, cuando el que reparte se lo queda, a la vista en su mano;
- el triunfo, el número de la mano y las fichas del jugador;
- la baza en curso y a quién le toca.

Cuando le toca hablar, la mesa MUST ofrecer al jugador jugar, pasar y, si puede, coger la niña. Cuando reparte y le toca descartar, MUST dejarle elegir la carta que deja. Al terminar cada mano, MUST mostrar un resumen con las bazas y las fichas de cada jugador, quién queda ramsé y quién se retira.

La pantalla de fin MUST mostrar el orden en que los jugadores se quedaron sin fichas y quién pierde.

#### Scenario: Hablar desde la mesa
- **WHEN** al jugador le toca hablar
- **THEN** la mesa le ofrece «¡Rams!», «Paso» y, si nadie la ha cogido y no reparte, «Coger la niña»

#### Scenario: Resumen de la mano
- **WHEN** termina una mano
- **THEN** sale el resumen con las bazas y las fichas de cada jugador
