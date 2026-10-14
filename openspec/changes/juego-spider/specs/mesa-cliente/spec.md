## ADDED Requirements

### Requirement: Spider en la suite
El menú MUST incluir el Spider junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de palos (1, 2 o 4) y si se puede repartir con columnas vacías.

#### Scenario: Empezar una partida de Spider
- **WHEN** el jugador elige el Spider en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Spider con la configuración elegida

### Requirement: Mesa del Spider
La mesa del Spider MUST mostrar las 10 columnas sin scroll horizontal en una pantalla de 360 px de ancho, comprimiendo las cartas boca abajo y las columnas largas para que quepan en la altura.

El jugador MUST poder:
- mover una carta o una escalera arrastrándola o tocándola y tocando el destino; con un doble toque va al mejor destino;
- repartir tocando el mazo;
- deshacer y abandonar.

La mesa MUST resaltar los destinos legales de la carta elegida y mostrar los repartos que quedan, las escaleras completadas, los movimientos y el tiempo.

#### Scenario: Mover una escalera tocando
- **WHEN** el jugador toca la primera carta de una escalera del mismo palo y después una columna en la que encaja
- **THEN** toda la escalera pasa a esa columna

#### Scenario: Repartir
- **WHEN** el jugador toca el mazo
- **THEN** aparece una carta nueva al final de cada columna y quedan menos repartos

### Requirement: Fin del Spider
Al completar las 8 escaleras, la mesa MUST mostrar la victoria con los movimientos y el tiempo. Al abandonar, MUST mostrar la partida como abandonada.

#### Scenario: Abandonar el Spider
- **WHEN** el jugador abandona y lo confirma
- **THEN** ve la pantalla de partida abandonada con la opción de jugar otra vez
