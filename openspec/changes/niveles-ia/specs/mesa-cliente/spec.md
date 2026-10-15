## ADDED Requirements

### Requirement: Elegir el nivel de la IA
Las opciones de cada juego contra la máquina MUST incluir «Nivel de la IA» con tres opciones: Fácil, Normal y Difícil, con Normal por defecto. Cada juego MUST recordar en el dispositivo el último nivel elegido y proponerlo la próxima vez. Todos los rivales de la IA de la partida MUST jugar con el nivel elegido. Los solitarios MUST NOT mostrar esta opción.

#### Scenario: Elegir Difícil
- **WHEN** el jugador elige «Difícil» en las opciones de la Brisca y empieza
- **THEN** el rival juega con la IA difícil, y la próxima vez que abra las opciones de la Brisca aparece «Difícil» elegido

#### Scenario: Solitario sin nivel
- **WHEN** el jugador abre las opciones del Klondike
- **THEN** no hay opción de nivel de la IA

### Requirement: El nivel se guarda con la partida
La partida guardada MUST incluir el nivel de la IA, y al retomarla la IA MUST seguir con ese nivel. Una partida guardada sin nivel (de una versión anterior) MUST retomarse con el nivel Normal.

#### Scenario: Retomar una partida en difícil
- **WHEN** el jugador recarga a mitad de una partida empezada en Difícil y la continúa
- **THEN** la IA sigue jugando en Difícil

### Requirement: Reacción de la IA en el Burro según el nivel
En el Burro, el retraso con el que la IA se planta MUST depender del nivel:
- **Fácil:** más lento que en Normal (aproximadamente entre 2 y 5 segundos).
- **Normal:** como hasta ahora.
- **Difícil:** más rápido (aproximadamente entre 0,6 y 2 segundos).

#### Scenario: Burro en difícil
- **WHEN** en una partida de Burro en Difícil un rival se planta
- **THEN** los demás rivales reaccionan antes, de media, que en Normal
