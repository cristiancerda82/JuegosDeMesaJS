## ADDED Requirements

### Requirement: Sevens en la suite
El menú MUST incluir el Sevens junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 3 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Sevens MUST poder jugarse en red.

#### Scenario: Empezar una partida de Sevens
- **WHEN** el jugador elige el Sevens en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 13 cartas y tres rivales de la IA

### Requirement: Mesa del Sevens
La mesa del Sevens MUST mostrar:
- las cuatro escaleras, una por palo, con las cartas puestas de la más baja a la más alta y el hueco del 7 en los palos sin abrir;
- los rivales, con cuántas cartas tienen y su última acción;
- abajo, la mano propia, con las cartas jugables resaltadas.

En su turno, el jugador MUST poder jugar una carta legal tocándola, o pulsar «Pasar» si no tiene ninguna. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Jugar una carta
- **WHEN** al jugador le toca y toca el 8 de corazones, con la escalera de corazones en el 7
- **THEN** la escalera de corazones pasa a ir del 7 al 8

### Requirement: Resumen de la mano y fin del Sevens
Al terminar cada mano, la mesa MUST mostrar quién se quedó sin cartas, las cartas que le quedaron a cada uno y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar la clasificación con los puntos.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra quién ganó la mano y los puntos de cada uno
