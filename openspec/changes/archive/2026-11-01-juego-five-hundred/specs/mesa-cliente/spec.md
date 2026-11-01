## ADDED Requirements

### Requirement: Five Hundred en la suite
El menú MUST incluir el Five Hundred junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 4 en parejas a 500 puntos. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Five Hundred
- **WHEN** el jugador elige el Five Hundred en el menú y empieza
- **THEN** se abre su mesa con su mano de 10 cartas, su compañero enfrente y la subasta

### Requirement: Mesa del Five Hundred
La mesa del Five Hundred MUST mostrar:
- la mano del jugador y la de cada rival boca abajo;
- cuando le toca pujar, las pujas que puede hacer en una tabla de bazas por palo, el misère, el misère abierto y pasar;
- la última puja de cada jugador y la puja más alta;
- cuando gana la subasta, el descarte: toca 3 cartas de su mano para descartarlas;
- al salir con el comodín sin triunfo, los botones para nombrar el palo;
- en el misère abierto, las cartas de quien juega;
- el contrato y quién lo juega, las bazas de cada pareja y los puntos de la partida.

Al acabar cada mano, la mesa MUST mostrar un resumen con el contrato, las bazas de cada pareja y lo que suma o resta cada una.

#### Scenario: Pujar
- **WHEN** al jugador le toca pujar y toca 7 corazones
- **THEN** la mesa muestra su puja y le toca al siguiente

#### Scenario: Descartar de la viuda
- **WHEN** el jugador gana la subasta
- **THEN** tiene 13 cartas, toca 3 para descartarlas y sale en la primera baza

#### Scenario: Fin de la partida
- **WHEN** una pareja llega a 500 cumpliendo su contrato
- **THEN** sale la pantalla de fin con la pareja ganadora y los puntos de cada una
