## MODIFIED Requirements

### Requirement: Menú de la suite
El cliente MUST mostrar un menú desde el que el jugador llega a todos los juegos disponibles, organizados por familias (ver la capacidad `menu-juegos`). Desde el menú, el jugador MUST poder abrir las opciones de cada juego y empezar una partida nueva.

#### Scenario: Elegir juego
- **WHEN** el jugador abre la aplicación
- **THEN** ve el menú con las familias de juegos y, a través de ellas, puede llegar a cualquier juego y empezarlo

#### Scenario: Opciones de partida
- **WHEN** el jugador prepara una partida de Brisca
- **THEN** puede elegir las variantes disponibles (número de jugadores, cambio de muestra, arrastre, número de manos) antes de empezar
