## MODIFIED Requirements

### Requirement: Récords de los solitarios
En el Klondike, el FreeCell, el Spider, la Pirámide, el Golf, TriPeaks, el Yukon y el Canfield, al ganar una partida se MUST guardar el mejor tiempo y el menor número de movimientos de todas las partidas ganadas de ese juego. El registro MUST indicar si la partida ha batido alguno de los dos récords.

En TriPeaks, además, se MUST guardar la mejor puntuación de todas sus partidas terminadas, ganadas o abandonadas. El registro MUST indicar si la partida la ha batido; como con el resto de récords, la primera partida no cuenta como récord batido. Las estadísticas guardadas antes de existir este récord MUST seguir leyéndose, con la mejor puntuación vacía.

#### Scenario: Nuevo mejor tiempo
- **WHEN** el jugador gana un Klondike en 3 minutos y su mejor tiempo era de 5
- **THEN** el mejor tiempo pasa a 3 minutos y el registro indica un récord de tiempo

#### Scenario: Mejor puntuación en TriPeaks
- **WHEN** el jugador abandona un TriPeaks con 85 puntos y su mejor puntuación era 60
- **THEN** la mejor puntuación pasa a 85 y el registro indica un récord de puntos

#### Scenario: Estadísticas anteriores
- **WHEN** el almacenamiento tiene estadísticas guardadas sin mejor puntuación
- **THEN** se leen igual y la mejor puntuación de cada juego queda vacía
