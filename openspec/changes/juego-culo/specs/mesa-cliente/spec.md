## ADDED Requirements

### Requirement: Culo en la suite
El menú MUST incluir el Culo junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 3 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, el Culo MUST poder jugarse en red.

#### Scenario: Empezar una partida de Culo
- **WHEN** el jugador elige el Culo en el menú y empieza con las opciones por defecto
- **THEN** se abre su mesa con sus 10 cartas ordenadas de menor a mayor y tres rivales de la IA

### Requirement: Mesa del Culo
La mesa del Culo MUST mostrar:
- los rivales, con cuántas cartas tienen, su cargo de la mano anterior, si han pasado en la ronda y, si ya han salido, su puesto;
- en el centro, la jugada que hay que superar y quién la hizo, y la mano que se juega;
- abajo, la mano propia ordenada de menor a mayor.

En su turno, el jugador MUST poder marcar cartas de su mano y pulsar «Jugar», que solo se activa si las marcadas forman una jugada legal, o «Pasar» si puede pasar. Cuando hay una jugada que superar, al tocar una carta la mesa MUST marcar también otras de su valor hasta el número de cartas que pide la ronda, para que superar sea un solo toque más; al abrir, cada toque marca o desmarca una sola carta. En el intercambio, el presidente o el vicepresidente MUST marcar las cartas que devuelve y pulsar «Devolver»; los demás ven qué intercambio se está haciendo. La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

#### Scenario: Superar desde la mesa
- **WHEN** la jugada que hay que superar son dos cincos y el jugador toca uno de sus dos sietes
- **THEN** quedan marcados los dos sietes, se activa «Jugar», y al pulsarlo pasan al centro

#### Scenario: Devolver en el intercambio
- **WHEN** empieza la segunda mano, el jugador es el presidente, marca dos cartas y pulsa «Devolver»
- **THEN** esas cartas salen de su mano y empieza la mano

### Requirement: Resumen de la mano y fin del Culo
Al terminar cada mano, la mesa MUST mostrar el orden de salida con el cargo y los puntos de cada uno y el marcador, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar la clasificación con los puntos de cada uno.

#### Scenario: Resumen tras una mano
- **WHEN** termina la primera mano
- **THEN** el resumen muestra quién es presidente y quién es culo, con sus puntos, y el marcador de la partida
