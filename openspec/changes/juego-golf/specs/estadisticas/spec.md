## MODIFIED Requirements

### Requirement: Récords de los solitarios
En el Klondike, el FreeCell, el Spider, la Pirámide y el Golf, al ganar una partida se MUST guardar el mejor tiempo y el menor número de movimientos de todas las partidas ganadas de ese juego. El registro MUST indicar si la partida ha batido alguno de los dos récords.

#### Scenario: Nuevo mejor tiempo
- **WHEN** el jugador gana un Klondike en 3 minutos y su mejor tiempo era de 5
- **THEN** el mejor tiempo pasa a 3 minutos y el registro indica un récord de tiempo
