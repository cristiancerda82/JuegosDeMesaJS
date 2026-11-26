## ADDED Requirements

### Requirement: Tute gana-pierde en la suite
El menú MUST incluir el Tute gana-pierde junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido y el límite de penalizaciones (6 o 3). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Tute gana-pierde
- **WHEN** el jugador elige el Tute gana-pierde y empieza
- **THEN** se abre su mesa con sus 12 cartas, dos rivales y «Sin triunfo»

### Requirement: Mesa del Tute gana-pierde
La mesa del Tute gana-pierde MUST mostrar:
- la mano del jugador, ordenada por palos, y las de los rivales boca abajo;
- los tantos de cada jugador en la mano y sus penalizaciones;
- el triunfo, o «Sin triunfo» mientras no nace, y un aviso cuando alguien canta;
- la baza en curso y a quién le toca.

La mesa MUST dejar jugar solo las cartas permitidas por las obligaciones. Al terminar cada mano, MUST mostrar un resumen con los tantos de cada jugador (cartas, cantes y últimas), quién se lleva la penalización y las penalizaciones de cada uno.

La pantalla de fin MUST mostrar la clasificación por penalizaciones y el resumen de la última mano.

#### Scenario: Aviso de las cuarenta
- **WHEN** un jugador gana una baza con el Rey y el Caballo de un palo y aún no había triunfo
- **THEN** la mesa avisa de que ha cantado las cuarenta y muestra ese palo como triunfo

#### Scenario: Resumen de la mano
- **WHEN** termina una mano
- **THEN** sale el resumen con los tantos de cada jugador y quién se lleva la penalización
