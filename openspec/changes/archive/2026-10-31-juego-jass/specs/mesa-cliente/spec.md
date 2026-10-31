## ADDED Requirements

### Requirement: Jass en la suite
El menú MUST incluir el Jass junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4 en parejas a 1.000 puntos. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Jass
- **WHEN** el jugador elige el Jass en el menú y empieza
- **THEN** se abre su mesa con su mano de 9 cartas, su compañero enfrente y la elección del modo

### Requirement: Mesa del Jass
La mesa del Jass MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- cuando le toca elegir, un botón por cada modo (los cuatro palos, Obenabe y Undenufe) con su multiplicador, y el de pasar si su compañero no se lo ha pasado ya;
- el modo elegido con su multiplicador y quién lo eligió;
- las declaraciones ganadoras y el Stöck cuando se anotan;
- la baza en curso;
- los puntos de cada pareja en la mano y en la partida, sobre 1.000.

Al acabar cada mano, la mesa MUST mostrar un resumen con los puntos de cada pareja por declaraciones, Stöck y bazas, el total de la mano y los puntos de la partida.

#### Scenario: Elegir el modo
- **WHEN** al jugador le toca elegir y toca Obenabe
- **THEN** la mesa muestra Obenabe ×3 como modo y empieza la primera baza

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano en corazones en la que su pareja hace 100 puntos de bazas
- **THEN** el resumen muestra 200 a 114 por las bazas y los puntos de la partida de cada pareja

#### Scenario: Fin de la partida
- **WHEN** una pareja llega a 1.000 puntos
- **THEN** sale la pantalla de fin con la pareja ganadora y los puntos de cada una
