## Purpose

Define las reglas del Chinchón con baraja española para 2 a 4 jugadores, cada uno por su cuenta: el reparto, el robo y el descarte, las combinaciones con comodines, el cierre, el chinchón, la puntuación por cartas sin ligar, la eliminación y las variantes que se activan por configuración.

## ADDED Requirements

### Requirement: Configuración
La partida MUST configurarse con: la baraja (española de 40 cartas por defecto, o de 48), si lleva 2 comodines (por defecto, sí), el límite de eliminación (100 por defecto, o 50) y el valor máximo de la carta suelta para poder cerrar (3 por defecto; también 0, que obliga a cerrar con todo ligado, o 5). Se juega de 2 a 4 jugadores.

#### Scenario: Configuración inválida
- **WHEN** se crea una partida con 5 jugadores
- **THEN** la creación falla con un error y no hay estado de partida

### Requirement: Valor de las cartas
Para contar puntos, cada carta sin ligar MUST valer: el as 1, del 2 al 9 su número, y la sota, el caballo y el rey 10. Un comodín sin ligar vale 25.

#### Scenario: Puntos de cartas sueltas
- **WHEN** a un jugador le quedan sin ligar el as de oros, el caballo de copas y un comodín
- **THEN** suma 36 puntos

### Requirement: Preparación
Cada jugador MUST recibir 7 cartas. Se pone una carta boca arriba, que empieza el descarte, y el resto forma el mazo boca abajo. Empieza el jugador siguiente al repartidor, y el reparto pasa al siguiente jugador no eliminado en cada mano.

#### Scenario: Reparto de 3 jugadores con 40 cartas y comodines
- **WHEN** empieza una mano de 3 jugadores con la baraja de 40 y comodines
- **THEN** cada uno tiene 7 cartas, el descarte tiene 1 y el mazo 20

### Requirement: Turno
En su turno, cada jugador MUST primero robar una carta, la de arriba del mazo o la de arriba del descarte, y después descartar una carta de su mano (o cerrar). Solo la carta de arriba del descarte es visible y se puede robar. Quien roba del descarte MUST NOT descartar esa misma carta en el mismo turno. Si el mazo se agota, las cartas del descarte salvo la de arriba se barajan y forman un mazo nuevo.

#### Scenario: Robar y descartar
- **WHEN** un jugador en su turno roba del descarte
- **THEN** tiene 8 cartas, solo puede descartar o cerrar, y al descartar vuelve a tener 7 y el turno pasa al siguiente

#### Scenario: No devolver la carta robada del descarte
- **WHEN** un jugador roba del descarte el 5 de copas
- **THEN** descartar el 5 de copas no es una jugada legal en ese turno

#### Scenario: Mazo agotado
- **WHEN** un jugador va a robar con el mazo vacío
- **THEN** el descarte, salvo su carta de arriba, se baraja y pasa a ser el mazo

### Requirement: Combinaciones
Una combinación MUST ser una escalera (3 o más cartas seguidas del mismo palo) o un grupo (3 o 4 cartas del mismo valor). En la baraja de 40, el 7 y la sota son seguidos. En la de 48, el orden es del 1 al 12. El as no va detrás del rey. Un comodín sustituye a cualquier carta, pero cada combinación puede llevar como mucho uno.

#### Scenario: Escalera con el 7 y la sota
- **WHEN** con la baraja de 40 se juntan el 6, el 7 y la sota de copas
- **THEN** forman una escalera

#### Scenario: Comodín en un trío
- **WHEN** se juntan el 4 de oros, el 4 de bastos y un comodín
- **THEN** forman un grupo de cuatros

#### Scenario: Dos comodines no ligan juntos
- **WHEN** se juntan el 4 de oros y dos comodines
- **THEN** no forman una combinación

### Requirement: Mejor combinación de una mano
Para cerrar y para contar puntos, las cartas de un jugador MUST agruparse en la combinación que deja menos puntos sin ligar. El jugador no tiene que declarar sus combinaciones.

#### Scenario: Agrupación óptima
- **WHEN** una mano tiene la sota, el caballo y el rey de oros, el 4 de copas, el 4 de espadas, el 4 de bastos y el 2 de oros
- **THEN** su mejor combinación es la escalera de oros y el trío de cuatros, con el 2 de oros sin ligar (2 puntos)

### Requirement: Cerrar
En lugar de solo descartar, un jugador MUST poder cerrar la mano descartando una carta, si con las 7 que le quedan todas están ligadas salvo como mucho una carta sin ligar, de valor no mayor que el máximo configurado y que no sea un comodín. Al cerrar termina la mano.

#### Scenario: Cerrar con una carta suelta pequeña
- **WHEN** con el máximo por defecto un jugador puede descartar y quedarse con dos combinaciones y el 2 de copas suelto
- **THEN** cerrar con esa carta descartada es una jugada legal

#### Scenario: No se cierra con una suelta grande
- **WHEN** con el máximo por defecto la carta que quedaría suelta es un 5
- **THEN** cerrar no es una jugada legal

### Requirement: Puntuación de la mano
Al cerrar, el jugador que cierra MUST sumar los puntos de su carta suelta, o −10 si cierra con todo ligado. Cada uno de los demás suma los puntos de sus cartas sin ligar según su mejor combinación (0 si las tiene todas ligadas). Las 7 cartas de cada jugador y su mejor combinación MUST quedar a la vista en el resultado de la mano.

#### Scenario: Cerrar con todo ligado
- **WHEN** un jugador cierra y sus 7 cartas están ligadas
- **THEN** suma −10 en esa mano

#### Scenario: Puntos de los demás
- **WHEN** un jugador cierra y otro tiene sin ligar el rey de espadas y el 3 de copas
- **THEN** ese otro jugador suma 13 en esa mano

### Requirement: Chinchón
Si un jugador cierra y sus 7 cartas forman una escalera del mismo palo sin comodines (un chinchón), MUST ganar la partida en el acto.

#### Scenario: Chinchón
- **WHEN** un jugador cierra con el 1, 2, 3, 4, 5, 6 y 7 de bastos
- **THEN** la partida termina y ese jugador gana

### Requirement: Eliminación y fin de la partida
Un jugador cuyos puntos acumulados pasen del límite MUST quedar eliminado: ya no recibe cartas ni juega. La partida termina cuando solo queda un jugador sin eliminar, que es el ganador, o cuando alguien hace chinchón.

#### Scenario: Eliminación
- **WHEN** al terminar una mano un jugador llega a 104 puntos con el límite en 100
- **THEN** queda eliminado y la siguiente mano se reparte solo entre los demás

#### Scenario: Último en pie
- **WHEN** en una partida de 2 jugadores uno queda eliminado
- **THEN** la partida termina y gana el otro

### Requirement: Vista del jugador
La vista de cada jugador MUST mostrar su mano, el número de cartas de los demás, la carta de arriba del descarte, cuántas cartas tienen el mazo y el descarte, de quién es el turno y en qué fase está (robar o descartar), los puntos acumulados, los eliminados y el resultado de las manos terminadas con las manos destapadas. La vista MUST NOT mostrar las cartas en mano de los demás durante la mano, ni el orden del mazo, ni las cartas del descarte que no están arriba.

#### Scenario: Manos ocultas hasta el cierre
- **WHEN** se pide la vista de un jugador a mitad de una mano
- **THEN** no contiene ninguna carta de la mano de los demás, y al cerrarse la mano el resultado muestra las manos de todos
