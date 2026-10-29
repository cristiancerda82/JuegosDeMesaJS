# juego-kings-corner Specification

## Purpose
TBD - created by archiving change juego-kings-corner. Update Purpose after archive.

## Requirements

### Requirement: Reparto de Kings in the Corner
Kings in the Corner MUST jugarse con 2 a 4 jugadores (por defecto, 2), cada uno por su cuenta, y la baraja francesa de 52 cartas. Al empezar, cada jugador MUST recibir 7 cartas. Con el resto se forma el *mazo*, del que se ponen 4 cartas boca arriba en cruz: arriba, derecha, abajo e izquierda, cada una empezando una pila lateral. Las 4 *esquinas* MUST quedar vacías. Empieza el jugador 0.

#### Scenario: Reparto con 3 jugadores
- **WHEN** empieza una partida de 3 jugadores
- **THEN** cada uno tiene 7 cartas (antes de robar), hay 4 pilas laterales con una carta, las esquinas están vacías y quedan 27 cartas en el mazo

### Requirement: Pilas de Kings in the Corner
Sobre una pila MUST ponerse solo una carta de un valor uno menos que la de arriba y del color contrario (rojo sobre negro o negro sobre rojo), con el As como la más baja y el K como la más alta. Una esquina vacía MUST admitir solo un K; un hueco lateral vacío MUST admitir cualquier carta. Sobre un As no se puede poner nada.

#### Scenario: Escalera descendente de colores alternos
- **WHEN** una pila tiene arriba el 8 de picas
- **THEN** se puede poner el 7 de corazones o el de diamantes, pero no el 7 de tréboles ni el 6 de corazones

#### Scenario: K en la esquina
- **WHEN** el jugador tiene un K y hay una esquina vacía
- **THEN** puede ponerlo en la esquina, y ninguna otra carta puede empezar una esquina

### Requirement: Turno de Kings in the Corner
Al empezar su turno, el jugador MUST robar una carta del mazo si quedan. Después MAY hacer, en el orden que quiera y tantas veces como pueda:
- **Jugar** una carta de su mano sobre una pila o en un hueco permitido.
- **Mover** una pila lateral entera sobre otra pila (lateral o esquina), si la primera carta de la pila movida se puede poner sobre la de arriba de la otra. Su sitio queda como hueco.

El turno MUST terminar cuando el jugador pasa, y le toca al de su izquierda.

#### Scenario: Robar al empezar
- **WHEN** le toca a un jugador con 5 cartas y quedan cartas en el mazo
- **THEN** tiene 6 cartas antes de jugar

#### Scenario: Mover una pila
- **WHEN** la pila de arriba empieza por el 9 de corazones y la de la derecha tiene arriba el 10 de tréboles
- **THEN** el jugador puede mover la pila de arriba entera sobre la de la derecha, y el sitio de arriba queda como hueco

#### Scenario: Llenar un hueco
- **WHEN** un sitio lateral está vacío
- **THEN** el jugador puede poner en él cualquier carta de su mano

### Requirement: Fin de Kings in the Corner
La partida MUST terminar en cuanto un jugador se queda sin cartas en la mano, y lo gana él. Si el mazo está vacío y todos los jugadores pasan seguidos sin jugar ni mover nada, la partida MUST terminar también: gana quien tenga menos cartas, y si empatan varios, es empate entre ellos. Los puntos del resultado son las cartas que le quedan a cada uno.

#### Scenario: Se queda sin cartas
- **WHEN** el jugador 1 juega su última carta
- **THEN** la partida termina y gana el jugador 1

#### Scenario: Bloqueo
- **WHEN** el mazo está vacío y los cuatro jugadores pasan seguidos sin jugar
- **THEN** la partida termina y gana quien tenga menos cartas

### Requirement: Vista del jugador en Kings in the Corner
Cada jugador MUST ver su mano, cuántas cartas tienen los demás y cuántas quedan en el mazo, las 8 pilas completas, a quién le toca y la última acción. Las manos ajenas y el mazo MUST quedar ocultos.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** ve las pilas, pero ninguna carta de las manos ajenas ni del mazo
