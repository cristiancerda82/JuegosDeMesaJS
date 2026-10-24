# estadisticas Specification

## Purpose
TBD - created by archiving change estadisticas. Update Purpose after archive.

## Requirements

### Requirement: Registro de partidas terminadas
Cuando una partida termina, el cliente MUST registrarla una sola vez en las estadísticas de su juego. Para cada juego se MUST llevar:
- partidas jugadas, ganadas, empatadas y perdidas;
- la racha actual de victorias seguidas y la mejor racha.

Una partida es ganada si el jugador está entre los ganadores, empatada si el resultado es un empate y perdida en cualquier otro caso. En los solitarios, abandonar cuenta como partida perdida. Las partidas sin terminar MUST NOT registrarse.

#### Scenario: Ganar suma a la racha
- **WHEN** el jugador gana una partida de Brisca con una racha de 2 victorias
- **THEN** las estadísticas de la Brisca suman una partida jugada y una ganada, y la racha pasa a 3

#### Scenario: Perder corta la racha
- **WHEN** el jugador pierde una partida con una racha de 3 y una mejor racha de 5
- **THEN** la racha vuelve a 0 y la mejor racha sigue en 5

#### Scenario: Una partida se registra una vez
- **WHEN** termina una partida y el jugador vuelve al menú
- **THEN** la partida está registrada exactamente una vez

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

### Requirement: Guardado en el dispositivo
Las estadísticas MUST guardarse en el almacenamiento local del navegador, con una versión de formato. Si no se pueden leer, no son válidas o no se pueden guardar, el cliente MUST seguir funcionando y tratar las estadísticas como vacías. El jugador MUST poder borrarlas todas.

#### Scenario: Datos dañados
- **WHEN** el almacenamiento contiene estadísticas con un formato desconocido
- **THEN** la aplicación las trata como vacías y las partidas siguientes se registran desde cero
