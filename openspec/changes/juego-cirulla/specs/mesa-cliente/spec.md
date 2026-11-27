## ADDED Requirements

### Requirement: Cirulla en la suite
El menú MUST incluir la Cirulla junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido y el número de jugadores (2, o 4 en parejas). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Cirulla
- **WHEN** el jugador elige la Cirulla con 2 jugadores y empieza
- **THEN** se abre su mesa con sus 3 cartas, el rival y la mesa con 4 cartas, o vacía si el que reparte se la llevó

### Requirement: Mesa de la Cirulla
La mesa de la Cirulla MUST mostrar lo mismo que la de la Scopa (la mesa, la mano, el mazo, las cartas recogidas y las escobas de cada bando y los puntos de la partida, a 51), y además:
- las cartas acusadas de cada rival, boca arriba junto a su asiento;
- un aviso con los acuses de cada ronda y con la mesa inicial que se lleva el que reparte;
- al elegir una carta, la suma que pide: su valor o lo que le falta para 15.

La mesa MUST dejar jugar solo las jugadas legales y, cuando una carta tiene varias capturas, dejar elegir cuál. Al terminar cada mano, MUST mostrar un resumen con el recuento de la Scopa, la cirulla grande y la pequeña de cada bando.

La pantalla de fin MUST mostrar los puntos de la partida y el resumen de la última mano, y decir si se ganó por los diez oros.

La mesa de la Scopa MUST seguir mostrando lo mismo que antes.

#### Scenario: Elegir la captura a 15
- **WHEN** el jugador suelta en la mesa una carta que puede capturar de dos formas
- **THEN** la mesa le deja elegir cuál

#### Scenario: Resumen de la mano
- **WHEN** termina una mano
- **THEN** sale el resumen con los puntos de cada bando, la cirulla grande y la pequeña
