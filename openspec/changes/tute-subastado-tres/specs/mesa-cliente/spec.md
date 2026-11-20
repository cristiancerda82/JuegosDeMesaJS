## ADDED Requirements

### Requirement: Tute subastado de 3 en el cliente
Las opciones del Tute subastado MUST permitir elegir 4 o 3 jugadores, 4 por defecto, en local y al crear una sala en red. Con 3:
- la mesa MUST enseñar a los dos rivales;
- el panel de la subasta MUST enseñar las 12 cartas del jugador y lo que dijo cada rival;
- el resumen de la mano MUST tener una fila por jugador.

La guía del Tute subastado MUST explicar la variante de 3 y decir en qué opción se activa. La guía de la Escoba MUST decir que la partida a 31 se elige en las opciones.

#### Scenario: Partida de 3 en la mesa
- **WHEN** el jugador empieza un Tute subastado con la opción de 3
- **THEN** ve a dos rivales, la subasta con sus 12 cartas empieza en 70 y el resumen de cada mano tiene tres filas

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía del Tute subastado
- **THEN** ve explicada la partida de 3 y en qué opción se elige
