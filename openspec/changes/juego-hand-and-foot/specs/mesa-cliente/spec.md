## ADDED Requirements

### Requirement: Hand and Foot en la suite
El menú MUST incluir el Hand and Foot junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el modo asistido. La partida es siempre a 4 rondas. Como el resto de juegos con IA, MUST poder jugarse en red con 4 jugadores en parejas.

#### Scenario: Empezar una partida de Hand and Foot
- **WHEN** el jugador elige el Hand and Foot y empieza
- **THEN** se abre su mesa con sus 11 cartas de mano, su compañero enfrente y el pie de cada uno boca abajo

### Requirement: Mesa del Hand and Foot
La mesa del Hand and Foot MUST mostrar:
- la mano del jugador (o su pie, cuando lo juega), y de los demás cuántas cartas tienen en la mano y si ya juegan su pie;
- el mazo, el descarte con su carta de arriba, y si se puede coger;
- las combinaciones y los treses rojos de cada pareja, con los libros marcados como limpios, sucios o de comodines;
- cuántos libros limpios y sucios tiene la pareja del jugador y cuántos le faltan para cerrar;
- la ronda, el mínimo de la primera bajada y si cada pareja ya ha bajado;
- los puntos de cada pareja.

Cuando le toca, el jugador MUST poder robar del mazo, coger el descarte cuando puede, bajar combinaciones nuevas eligiendo las cartas, añadir cartas a las combinaciones de su pareja, deshacer la primera bajada mientras no llega al mínimo, y descartar.

Al acabar cada ronda, la mesa MUST mostrar un resumen con lo que suma y resta cada pareja y el total, y esperar a que pulse «Siguiente ronda».

#### Scenario: Coger el pie
- **WHEN** el jugador baja todas las cartas de su mano
- **THEN** la mesa le muestra las 11 cartas de su pie y marca que ya juega el pie

#### Scenario: Lo que falta para cerrar
- **WHEN** la pareja del jugador tiene 1 libro limpio y 2 sucios
- **THEN** la mesa muestra que le falta 1 libro limpio para cerrar

#### Scenario: Fin de la partida
- **WHEN** termina la cuarta ronda
- **THEN** sale la pantalla de fin con la pareja ganadora y los puntos de cada pareja
