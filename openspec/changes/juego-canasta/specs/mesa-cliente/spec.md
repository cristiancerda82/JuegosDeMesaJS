## ADDED Requirements

### Requirement: Canasta en la suite
El menú MUST incluir la Canasta junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre con 4 jugadores en parejas, con el compañero de la IA enfrente. Como el resto de juegos con IA, la Canasta MUST poder jugarse en red.

#### Scenario: Empezar una partida de Canasta
- **WHEN** el jugador elige la Canasta en el menú y empieza
- **THEN** se abre su mesa con sus 11 cartas, su compañero enfrente, los dos rivales a los lados y el pozo con una carta

### Requirement: Mesa de la Canasta
La mesa de la Canasta MUST mostrar:
- los demás jugadores, con cuántas cartas tienen;
- las combinaciones de cada pareja, agrupadas por valor, con cuántas cartas tienen, y las canastas marcadas como limpias o sucias;
- los treses rojos de cada pareja;
- el pozo, con la carta de arriba, cuántas cartas tiene y si está congelado o tapado; el mazo, con cuántas cartas quedan;
- el marcador y, mientras su pareja no ha bajado, el mínimo de la primera bajada y lo que lleva bajado en el turno;
- abajo, la mano propia ordenada por valor.

En su turno, el jugador MUST poder:
- robar del mazo o, si puede, llevarse el pozo, marcando antes las cartas de la mano que van con la carta de arriba;
- marcar cartas de su mano y bajarlas como combinación nueva, o añadirlas a una combinación de su pareja tocándola;
- deshacer lo bajado en el turno mientras no llega al mínimo;
- descartar una carta marcada.

Los botones MUST activarse solo cuando las cartas marcadas forman una jugada legal. La mesa MUST caber en 360 × 640 sin scroll horizontal.

#### Scenario: Bajar desde la mesa
- **WHEN** la pareja del jugador ya ha bajado y él marca tres jotas y pulsa «Bajar»
- **THEN** aparece una combinación de jotas de su pareja y las tres jotas salen de su mano

#### Scenario: Llevarse el pozo desde la mesa
- **WHEN** arriba del pozo hay un 6, el jugador marca dos seises de su mano y pulsa «Coger el pozo»
- **THEN** su pareja tiene una combinación de seises y las demás cartas del pozo pasan a su mano

### Requirement: Resumen de la mano y fin de la Canasta
Al terminar cada mano, la mesa MUST mostrar el desglose de cada pareja: cartas bajadas, canastas, treses rojos, cierre, cartas en la mano, el total de la mano y el marcador. Después MUST esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último desglose y el marcador final.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra el desglose de las dos parejas y el marcador
