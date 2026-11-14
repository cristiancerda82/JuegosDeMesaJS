## ADDED Requirements

### Requirement: Variantes de los libros en las opciones y la guía
Las opciones de estos juegos MUST mostrar una casilla por cada variante de reglas nueva, desactivada por defecto, tanto en local como al crear una sala en red:
- Tute, Guiñote y Butifarra: sobrefallo libre;
- Escoba: premios de los oros y los sietes;
- Chinchón: colocar las sueltas y reenganche;
- Ocho loco: cartas especiales.

La guía de cada uno de esos juegos MUST incluir una línea que explique la variante y diga en qué opción se activa.

Las mesas MUST enseñar lo que pide cada variante activa:
- la mesa del Ocho loco, el sentido del juego y la obligación pendiente (echar un As o robar 2, echar un 6 o robar 1);
- el resultado de la mano de Chinchón, las cartas que coloca cada jugador y quién se reengancha;
- el desglose de la Escoba, los oros y los sietes con su premio.

#### Scenario: Activar una variante
- **WHEN** el jugador marca la casilla de cartas especiales en las opciones del Ocho loco y empieza la partida
- **THEN** la partida se juega con las cartas especiales

#### Scenario: Obligación a la vista
- **WHEN** en el Ocho loco con cartas especiales el rival juega un As y le toca al jugador
- **THEN** la mesa le dice que tiene que echar un As o robar 2

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía del Chinchón
- **THEN** ve explicadas la colocación de las sueltas y el reenganche, y que se activan en las opciones

#### Scenario: Cartas colocadas en el resultado
- **WHEN** en el Chinchón con la opción de colocar las sueltas otro jugador coloca una carta al cerrar
- **THEN** el resultado de la mano muestra esa carta como colocada y no se la cuenta
