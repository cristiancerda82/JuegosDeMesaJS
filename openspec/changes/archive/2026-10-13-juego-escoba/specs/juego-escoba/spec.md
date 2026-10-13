## Purpose

Define las reglas de la Escoba del 15 con baraja española de 40 cartas, para 2 jugadores o 4 en parejas: el reparto, las capturas que suman 15, las escobas, la puntuación de cada mano, la partida a N puntos y las variantes que se activan por configuración.

## ADDED Requirements

### Requirement: Valor de las cartas
Para sumar, cada carta MUST valer: el as 1, del 2 al 7 su número, la sota 8, el caballo 9 y el rey 10.

#### Scenario: Figuras
- **WHEN** se suman una sota, un caballo y un rey
- **THEN** valen 8, 9 y 10

### Requirement: Preparación
Cada jugador MUST recibir 3 cartas y se ponen 4 cartas boca arriba en la mesa. El resto forma el mazo. Con 4 jugadores se juega en 2 parejas, con los compañeros enfrentados. Sale el jugador siguiente al repartidor en el orden de turno, y el reparto alterna entre manos.

#### Scenario: Reparto de 2 jugadores
- **WHEN** empieza una mano de 2 jugadores
- **THEN** cada uno tiene 3 cartas, hay 4 en la mesa y el mazo tiene 30

#### Scenario: Reparto de 4 jugadores
- **WHEN** empieza una mano de 4 jugadores
- **THEN** cada uno tiene 3 cartas, hay 4 en la mesa y el mazo tiene 24

### Requirement: Mesa inicial que suma 15
Si la configuración lo activa (por defecto, sí) y las 4 cartas iniciales de la mesa suman 15, el repartidor MUST llevárselas y se le cuenta una escoba. Si suman 30, se le cuentan dos escobas.

#### Scenario: Escoba del repartidor
- **WHEN** las 4 cartas iniciales de la mesa suman 15
- **THEN** pasan a las cartas recogidas del repartidor, su bando suma una escoba y la mesa queda vacía

### Requirement: Jugar una carta
En su turno, cada jugador MUST jugar una carta de su mano. Si la carta, sumada a una o más cartas de la mesa, da 15, el jugador puede recoger esa carta y esas cartas de la mesa. Cada combinación distinta de cartas de la mesa que sume 15 es una jugada distinta. Si no recoge, la carta queda boca arriba en la mesa. Por defecto, recoger no es obligatorio. La configuración MUST permitir hacerlo obligatorio: entonces, si la carta jugada puede recoger, hay que elegir una de sus capturas.

#### Scenario: Captura simple
- **WHEN** en la mesa están el 6 y el 2 de copas y el jugador juega el caballo de oros
- **THEN** recoger el caballo junto al 6 de copas y dejar el 2 es una jugada legal

#### Scenario: Varias capturas posibles
- **WHEN** en la mesa están el 4 de oros, el 4 de copas y el 3 de espadas y el jugador juega una sota
- **THEN** recoger la sota con el 4 de oros y el 3 de espadas, y recogerla con el 4 de copas y el 3 de espadas, son dos jugadas legales distintas

#### Scenario: No recoger
- **WHEN** con la opción por defecto la carta jugada puede recoger
- **THEN** dejarla en la mesa también es una jugada legal

#### Scenario: Captura obligatoria
- **WHEN** con la captura obligatoria activa la carta jugada puede recoger
- **THEN** dejarla en la mesa no es una jugada legal

### Requirement: Escoba
Si una captura deja la mesa vacía, el bando del jugador MUST sumar una escoba.

#### Scenario: Hacer escoba
- **WHEN** en la mesa solo quedan el 3 de oros y el rey de bastos y el jugador los recoge con un 2
- **THEN** la mesa queda vacía y su bando suma una escoba

### Requirement: Nuevo reparto
Cuando todos los jugadores se quedan sin cartas y queda mazo, se MUST repartir 3 cartas a cada uno, empezando por el que sale, sin poner cartas nuevas en la mesa.

#### Scenario: Repartir de nuevo
- **WHEN** todos se quedan sin cartas y el mazo tiene cartas
- **THEN** cada jugador vuelve a tener 3 cartas y la mesa no cambia

### Requirement: Fin de la mano
La mano MUST terminar cuando se agotan el mazo y las manos. Las cartas que queden en la mesa MUST ir al bando del último jugador que recogió, sin que eso cuente como escoba. Si nadie recogió en toda la mano, quedan sin dueño.

#### Scenario: Últimas cartas
- **WHEN** termina la mano con cartas en la mesa
- **THEN** pasan al bando del último que recogió y no suman escoba

### Requirement: Puntuación de la mano
Al terminar la mano, cada bando MUST sumar 1 punto por cada escoba. Además suma 1 punto quien tenga más cartas, 1 quien tenga más oros, 1 quien tenga el 7 de oros y 1 quien tenga más sietes. En caso de empate en cartas, oros o sietes, ese punto no es para nadie. El resultado MUST guardar el desglose de cada concepto por bando.

#### Scenario: Desglose
- **WHEN** termina una mano en la que un bando hizo 2 escobas, tiene 22 cartas, 6 oros, el 7 de oros y 3 sietes
- **THEN** ese bando suma 6 puntos en la mano: 2 por escobas y 1 por cada uno de los otros conceptos

#### Scenario: Empate en oros
- **WHEN** termina una mano en la que los dos bandos tienen 5 oros
- **THEN** el punto de los oros no es para nadie

### Requirement: Partida a N puntos
La configuración MUST fijar los puntos de la partida: 15, 21 (por defecto) o 31. La partida MUST terminar al cerrar una mano en la que algún bando llegue a esos puntos. Si los dos llegan, gana el que tenga más, y si empatan se juega otra mano.

#### Scenario: Llegar a la meta
- **WHEN** al cerrar una mano un bando suma 21 o más y el otro menos
- **THEN** la partida termina y gana ese bando

#### Scenario: Empate en la meta
- **WHEN** al cerrar una mano los dos bandos tienen los mismos puntos y ambos llegan a la meta
- **THEN** se reparte otra mano

### Requirement: Vista del jugador
La vista de cada jugador MUST mostrar su mano, el número de cartas de los demás, todas las cartas de la mesa, las cartas que quedan en el mazo, cuántas cartas y cuántas escobas lleva cada bando en la mano, quién recogió por última vez, los puntos de la partida y el desglose de las manos terminadas. La vista MUST NOT mostrar las cartas en mano de los demás ni qué cartas concretas ha recogido cada bando en la mano en curso.

#### Scenario: Recogidas ocultas
- **WHEN** se pide la vista de un jugador a mitad de una mano
- **THEN** ve cuántas cartas y escobas lleva cada bando, pero no qué cartas recogió el rival
