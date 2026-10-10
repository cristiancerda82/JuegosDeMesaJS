## Purpose

Define el contrato común que cumple cualquier juego de la suite: cómo se crea una partida, qué acciones son legales, cómo avanza el estado y qué ve cada jugador. Es la base compartida entre el modo local, la IA y el futuro modo en red.

## ADDED Requirements

### Requirement: Creación de partida
Un juego MUST poder crear una partida nueva a partir de una configuración (variantes y número de jugadores) y una semilla. Una configuración no válida MUST rechazarse con un error que indique el motivo.

#### Scenario: Partida nueva
- **WHEN** se crea una partida con una configuración válida y una semilla
- **THEN** se obtiene un estado inicial con las cartas ya repartidas y el turno asignado

#### Scenario: Configuración inválida
- **WHEN** se crea una partida de Brisca con 3 jugadores
- **THEN** la creación falla indicando que el número de jugadores no es válido

### Requirement: Acciones legales
El motor MUST informar, para un estado y un jugador, la lista completa de acciones legales de ese jugador. Un jugador que no tiene el turno MUST recibir una lista vacía, salvo que el juego permita acciones fuera de turno.

#### Scenario: Jugador en turno
- **WHEN** se consultan las acciones legales del jugador que tiene el turno
- **THEN** la lista no está vacía mientras la partida no haya terminado

#### Scenario: Jugador fuera de turno
- **WHEN** se consultan las acciones legales de un jugador que no tiene el turno en la Brisca
- **THEN** la lista está vacía

### Requirement: Transición de estado
Aplicar una acción legal MUST devolver un estado nuevo sin modificar el anterior. Aplicar una acción ilegal MUST rechazarse con un error y dejar el estado sin cambios.

#### Scenario: Acción legal
- **WHEN** se aplica una acción legal a un estado
- **THEN** se obtiene un estado nuevo y el estado original sigue igual

#### Scenario: Acción ilegal
- **WHEN** se aplica una acción que no está entre las legales
- **THEN** la operación falla con un error y el estado no cambia

### Requirement: Determinismo y repetición
Dados la misma configuración, la misma semilla y la misma secuencia de acciones, el motor MUST producir exactamente el mismo estado final. El motor MUST NOT usar azar fuera de la semilla, ni la hora, ni fuentes externas.

#### Scenario: Repetir una partida
- **WHEN** se recrea una partida con su configuración, su semilla y su historial de acciones
- **THEN** el estado resultante es idéntico al de la partida original

### Requirement: Estado serializable
El estado de una partida MUST poder serializarse a JSON y reconstruirse sin perder información, para guardar y reanudar partidas o enviarlas por la red.

#### Scenario: Guardar y reanudar
- **WHEN** se serializa un estado a mitad de partida y se reconstruye
- **THEN** las acciones legales y la vista de cada jugador son las mismas que antes de serializar

### Requirement: Vista por jugador
El motor MUST poder producir la vista de un jugador: todo lo que ese jugador puede saber. La vista MUST excluir las cartas ocultas para él, como las manos de los demás y el orden del mazo. Para las cartas ocultas solo MUST indicar cuántas hay. La vista de espectador MUST excluir todas las manos.

#### Scenario: Mano ajena oculta
- **WHEN** se obtiene la vista del jugador 1 en una partida de Brisca
- **THEN** la vista incluye sus propias cartas y el número de cartas del rival, pero no cuáles son

#### Scenario: Mazo oculto
- **WHEN** se obtiene la vista de cualquier jugador
- **THEN** la vista indica cuántas cartas quedan en el mazo, pero no su orden ni su identidad, salvo las que estén boca arriba

### Requirement: Fin de partida y resultado
El motor MUST indicar si la partida terminó y, en ese caso, el resultado: ganador o ganadores, empate o derrota, y la puntuación cuando el juego la tenga. Con la partida terminada, ningún jugador MUST tener acciones legales.

#### Scenario: Partida terminada
- **WHEN** se alcanza la condición de fin de un juego
- **THEN** el estado indica que terminó, expone el resultado y no hay acciones legales para nadie
