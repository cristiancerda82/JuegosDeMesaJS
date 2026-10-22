## ADDED Requirements

### Requirement: Picas en la suite
El menú MUST incluir Picas junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. Como el resto de juegos con IA, Picas MUST poder jugarse en red.

#### Scenario: Empezar una partida de Picas
- **WHEN** el jugador elige Picas en el menú y empieza
- **THEN** se abre su mesa con 13 cartas en la mano, un compañero enfrente y dos rivales de la IA

### Requirement: Mesa de Picas
La mesa de Picas MUST usar la mesa de bazas compartida y mostrar:
- junto a cada jugador, su apuesta y las bazas que lleva en la mano («3 / 1»), o «Nil»;
- en la barra de información, el contrato y las bazas de cada pareja, los puntos y los sacos de cada pareja, y si las picas están rotas;
- la baza en curso y la última baza.

Cuando le toca apostar, el jugador MUST ver una ventana con su mano y botones para Nil y de 1 a 13, con las apuestas de los que ya hablaron. Durante las bazas solo MUST poder tocar las cartas legales.

Al terminar cada mano, MUST verse un resumen con las apuestas, las bazas, los puntos de cada pareja, los sacos y los totales, antes de repartir la siguiente.

#### Scenario: Apostar desde la mesa
- **WHEN** al jugador le toca apostar y pulsa «4»
- **THEN** su apuesta aparece junto a su nombre y le toca al siguiente

#### Scenario: Salir sin picas rotas
- **WHEN** al jugador le toca salir, las picas no están rotas y tiene otras cartas
- **THEN** sus picas no se pueden tocar

### Requirement: Fin de Picas
Al terminar, la pantalla de fin MUST mostrar qué pareja ganó, con los puntos de las dos y el resumen de la última mano.

#### Scenario: Ganar Picas
- **WHEN** la pareja del jugador llega a 500 puntos con más que la otra
- **THEN** ve la pantalla de victoria con los puntos de las dos parejas
