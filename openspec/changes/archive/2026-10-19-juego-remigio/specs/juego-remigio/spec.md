## ADDED Requirements

### Requirement: Baraja, jugadores y reparto del Remigio
El Remigio MUST jugarse con dos barajas españolas de 40 cartas y 4 comodines (84 cartas), de 2 a 5 jugadores (2 por defecto), cada uno por su cuenta. Hay dos copias de cada carta, que valen igual.

En cada mano se MUST repartir 7 cartas a cada jugador que sigue en la partida. La primera carta del mazo se pone boca arriba y empieza el montón de descartes. El reparto pasa al siguiente jugador que sigue en la partida, y empieza a jugar el siguiente al repartidor. La primera mano la reparte el último asiento, así que empieza el asiento 0.

#### Scenario: Reparto con 3 jugadores
- **WHEN** empieza una partida de 3 jugadores
- **THEN** cada uno tiene 7 cartas, el montón tiene 1 carta, el mazo 62 y le toca al asiento 0

### Requirement: Turno del Remigio
En su turno, cada jugador MUST, en este orden:
1. **Robar:** la carta de arriba del mazo o la del montón.
2. **Bajar, añadir y cambiar** (opcional):
   - bajar combinaciones nuevas de su mano;
   - tras haber bajado alguna en la mano, añadir cartas a las combinaciones de cualquier jugador y cambiar un comodín de cualquier combinación por la carta natural que representa, que se lleva a la mano.
3. **Descartar** una carta al montón, salvo que se haya quedado sin cartas al bajar.

Si al ir a robar el mazo está vacío, las cartas del montón menos la de arriba se barajan y forman el mazo nuevo. El mazo se rehace como mucho dos veces por mano. Si haría falta una tercera, la mano se MUST anular: nadie suma puntos y se reparte la siguiente. Así una mano en la que nadie puede cerrar (por ejemplo, con solo grupos completos en la mesa) no deja la partida colgada.

#### Scenario: Robar del montón
- **WHEN** el jugador roba la carta de arriba del montón
- **THEN** la carta pasa a su mano y el montón muestra la de debajo

#### Scenario: Añadir antes de bajar
- **WHEN** un jugador que no ha bajado ninguna combinación en la mano quiere añadir una carta a la escalera de un rival
- **THEN** no puede

#### Scenario: Mano anulada
- **WHEN** un jugador va a robar del mazo vacío y el mazo ya se ha rehecho dos veces en la mano
- **THEN** la mano termina sin cierre, nadie suma puntos y se reparte la siguiente

#### Scenario: Mazo agotado
- **WHEN** un jugador va a robar con el mazo vacío y 10 cartas en el montón
- **THEN** 9 cartas pasan barajadas al mazo, la de arriba se queda en el montón y el jugador roba

### Requirement: Combinaciones del Remigio
Las combinaciones bajadas MUST estar a la vista de todos y ser de uno de estos tipos:
- **Escalera:** 3 o más cartas seguidas del mismo palo en el orden As, 2, 3, 4, 5, 6, 7, Sota, Caballo, Rey. El 7 y la Sota son seguidos y el As solo va abajo.
- **Grupo:** 3 o 4 cartas del mismo número, de palos distintos.

Un comodín sustituye a cualquier carta: en una escalera ocupa un puesto concreto y en un grupo un palo que falte. Cada combinación MUST llevar al menos 2 cartas naturales.

Cambiar un comodín es poner en su puesto la carta natural que representa (en un grupo, cualquier palo que falte). El comodín pasa a la mano del jugador que lo cambia.

#### Scenario: Cambiar un comodín
- **WHEN** en la mesa hay una escalera 3 de bastos, comodín, 5 de bastos y un jugador que ya ha bajado tiene el 4 de bastos
- **THEN** puede poner el 4 de bastos en su puesto y se lleva el comodín a la mano

#### Scenario: Escalera que cruza del 7 a la Sota
- **WHEN** un jugador baja el 6, el 7 y la Sota de copas
- **THEN** es una escalera válida

#### Scenario: Grupo con palo repetido
- **WHEN** un jugador intenta bajar el 5 de oros, el otro 5 de oros y el 5 de copas
- **THEN** no es un grupo válido

#### Scenario: Comodín en una escalera
- **WHEN** un jugador baja el 3 de bastos, un comodín y el 5 de bastos
- **THEN** es una escalera con el comodín en el puesto del 4

### Requirement: Cerrar y remigio
Un jugador MUST cerrar la mano cuando se queda sin cartas, bajando o descartando la última. Si cierra bajando toda su mano en un mismo turno sin haber bajado nada antes en esa mano, cierra con **remigio**.

#### Scenario: Remigio
- **WHEN** un jugador que no había bajado nada baja en su turno siete cartas y descarta la octava
- **THEN** cierra con remigio

#### Scenario: Cierre normal
- **WHEN** un jugador que ya había bajado en un turno anterior baja sus últimas cartas y descarta la que le queda
- **THEN** cierra sin remigio

### Requirement: Puntuación y eliminación del Remigio
Al cerrar, cada jugador que no cerró MUST sumar los puntos de las cartas que tiene en la mano:
- cada número vale lo que indica (el As, 1);
- la Sota, el Caballo y el Rey valen 10;
- el comodín vale 25.

Si se cerró con remigio, los demás suman el doble. Quien cierra suma 0.

Quien pasa de 100 puntos MUST quedar eliminado: no recibe cartas en las manos siguientes y se quitan sus combinaciones de la mesa al repartir. La partida termina cuando queda un solo jugador, que gana.

El resultado de cada mano MUST registrar quién cerró, si fue remigio, los puntos de cada jugador en la mano, los totales y los eliminados.

#### Scenario: Puntos de la mano
- **WHEN** alguien cierra y a otro jugador le quedan el 5 de oros, el Rey de copas y un comodín
- **THEN** ese jugador suma 40 puntos, u 80 si se cerró con remigio

#### Scenario: Eliminación
- **WHEN** un jugador con 90 puntos suma 15 en una mano
- **THEN** queda eliminado con 105

### Requirement: Vista del jugador del Remigio
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- el número de cartas del mazo y todas las del montón;
- las combinaciones de cada jugador, con los comodines en su puesto;
- quién ha bajado en la mano;
- la fase del turno (robar o bajar y descartar) y a quién le toca;
- los puntos de cada uno, los eliminados y los resultados de las manos anteriores.

MUST NOT mostrar las cartas en mano de los demás ni el orden del mazo.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás ni del mazo
