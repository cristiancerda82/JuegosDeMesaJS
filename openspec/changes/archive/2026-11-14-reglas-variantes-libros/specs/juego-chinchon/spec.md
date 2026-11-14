## ADDED Requirements

### Requirement: Colocar las sueltas
La configuración MUST tener la opción de colocar las sueltas, desactivada por defecto. Una configuración sin esta opción MUST jugarse como si estuviera desactivada.

Con la opción activa, al cerrar, cada uno de los demás jugadores MUST colocar sus cartas sin ligar que encajen en las combinaciones que ya están a la vista. Colocan por orden de turno, empezando por el siguiente a quien cierra. Las combinaciones a la vista son las de quien cierra y las de los jugadores que enseñaron antes.

Una carta encaja si la combinación sigue siendo válida con ella, con como mucho un comodín en cada combinación:
- un grupo de hasta 4 cartas del mismo valor;
- una escalera del mismo palo.

Las cartas colocadas no suman puntos, y el resultado de la mano MUST mostrar qué cartas colocó cada jugador. Si quien cierra lo hace con todo ligado (−10) o con chinchón, nadie coloca.

#### Scenario: Colocar en la escalera de quien cierra
- **WHEN** con la opción activa un jugador cierra con el 4, 5 y 6 de oros entre sus combinaciones y otro jugador tiene sin ligar el 7 de oros y el rey de copas
- **THEN** ese otro jugador coloca el 7 de oros y suma solo los 10 puntos del rey de copas

#### Scenario: Colocar en la combinación de otro que enseñó antes
- **WHEN** con la opción activa el segundo en enseñar tiene un trío de sotas y el tercero tiene una sota sin ligar
- **THEN** el tercero coloca la sota en ese trío y no le suma puntos

#### Scenario: Cierre con todo ligado
- **WHEN** con la opción activa un jugador cierra con todo ligado
- **THEN** nadie coloca cartas y cada uno suma sus cartas sin ligar

#### Scenario: Opción desactivada al cerrar
- **WHEN** con la opción por defecto un jugador cierra y otro tiene una carta sin ligar que encajaría en sus combinaciones
- **THEN** esa carta le suma puntos

### Requirement: Reenganche
La configuración MUST tener la opción de reenganche, desactivada por defecto. Una configuración sin esta opción MUST jugarse como si estuviera desactivada.

Con la opción activa, un jugador que pase del límite al terminar una mano, y que aún no se haya reenganchado en esta partida, MUST volver a entrar en vez de quedar eliminado. Vuelve con los puntos del jugador que más tenga entre los que no han pasado del límite.

- Cada jugador se reengancha como mucho una vez: la segunda vez que pasa del límite, queda eliminado.
- Si en esa mano todos pasan del límite, nadie se reengancha y la partida termina como siempre.

El resultado de la mano MUST indicar quién se ha reenganchado.

#### Scenario: Reengancharse
- **WHEN** con la opción activa y el límite en 100 un jugador llega a 108 puntos y los demás tienen 40 y 72
- **THEN** sigue en la partida con 72 puntos y el resultado de la mano dice que se ha reenganchado

#### Scenario: Segunda vez
- **WHEN** con la opción activa un jugador que ya se reenganchó vuelve a pasar del límite
- **THEN** queda eliminado

#### Scenario: Sin reenganche
- **WHEN** con la opción por defecto un jugador pasa del límite
- **THEN** queda eliminado como siempre
