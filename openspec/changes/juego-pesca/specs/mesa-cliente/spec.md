## ADDED Requirements

### Requirement: Pesca en la suite
El menú MUST incluir la Pesca junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el número de jugadores (de 2 a 6, por defecto 4). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Pesca
- **WHEN** el jugador elige la Pesca con 4 jugadores y empieza
- **THEN** se abre su mesa con su mano de 5 cartas, los tres rivales y el mar

### Requirement: Mesa de la Pesca
La mesa de la Pesca MUST mostrar:
- los rivales, con su nombre, cuántas cartas tienen y sus cuartetos;
- el mar con las cartas que quedan;
- los cuartetos del jugador;
- su mano agrupada por valores.

Para pedir, el jugador MUST tocar un valor de su mano, que queda marcado, y después un rival con cartas. La mesa MUST avisar de cada petición («Rival 1 te pide sietes: le das 2», «¡A pescar!») y de cada cuarteto bajado, con una pausa para leerlo cuando juega la IA.

#### Scenario: Pedir a un rival
- **WHEN** el jugador toca sus sietes y después al Rival 1
- **THEN** pide sietes al Rival 1 y la mesa avisa de lo que le ha dado o de que tiene que pescar

#### Scenario: Fin de la partida
- **WHEN** se baja el último cuarteto
- **THEN** sale la pantalla de fin con el ganador y los cuartetos de cada jugador
