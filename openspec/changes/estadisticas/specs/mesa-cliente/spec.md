## ADDED Requirements

### Requirement: Pantalla de estadísticas
El menú MUST tener un botón «Estadísticas» que abre una pantalla con:
- una tarjeta por cada juego con alguna partida terminada: jugadas, ganadas, empatadas, perdidas, porcentaje de victorias, racha actual y mejor racha, y en los solitarios el mejor tiempo y el menor número de movimientos;
- el total de partidas jugadas y ganadas.

Sin partidas registradas, MUST mostrar un mensaje que invite a jugar. La pantalla MUST permitir borrar todas las estadísticas, después de confirmarlo, y volver al menú.

#### Scenario: Ver las estadísticas
- **WHEN** el jugador ha ganado una partida de Klondike y abre las estadísticas desde el menú
- **THEN** ve la tarjeta del Klondike con 1 partida jugada, 1 ganada, el 100 % de victorias y su tiempo y movimientos como récords

#### Scenario: Borrar las estadísticas
- **WHEN** el jugador pulsa «Borrar estadísticas» y lo confirma
- **THEN** la pantalla muestra que no hay partidas registradas

### Requirement: Racha y récords en el fin de partida
La pantalla de fin de partida MUST mostrar, debajo del resultado:
- la racha de victorias en curso, cuando el jugador lleva al menos 2 victorias seguidas en ese juego;
- un aviso cuando la partida bate su mejor racha o, en un solitario, su mejor tiempo o su menor número de movimientos.

#### Scenario: Aviso de récord
- **WHEN** el jugador gana un FreeCell con menos movimientos que nunca
- **THEN** la pantalla de fin avisa del nuevo récord de movimientos
