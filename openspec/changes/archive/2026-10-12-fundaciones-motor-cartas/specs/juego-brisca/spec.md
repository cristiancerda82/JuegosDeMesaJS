## Purpose

Define las reglas de la Brisca española con baraja de 40 cartas: la variante base de 2 jugadores con 3 cartas en mano, su puntuación y las variantes regionales que se activan por configuración.

## ADDED Requirements

### Requirement: Orden y valor de las cartas
Las cartas MUST ordenarse, de mayor a menor, así: as, tres, rey, caballo, sota, 7, 6, 5, 4, 2. Los puntos MUST ser: as 11, tres 10, rey 4, caballo 3, sota 2 y el resto 0, para un total de 120 puntos en la baraja.

#### Scenario: Total de puntos
- **WHEN** se suman los puntos de las 40 cartas
- **THEN** el total es 120

#### Scenario: El tres le gana al rey
- **WHEN** en una baza del mismo palo se juegan el rey y el tres
- **THEN** gana el tres

### Requirement: Preparación
En la variante base, cada uno de los 2 jugadores MUST recibir 3 cartas. La carta siguiente del mazo se pone boca arriba y define el palo de triunfo (la muestra). La muestra queda al fondo del mazo y es la última carta que se roba. El jugador que no reparte sale primero. El reparto alterna entre partidas.

#### Scenario: Reparto inicial
- **WHEN** empieza una mano de 2 jugadores
- **THEN** cada jugador tiene 3 cartas, hay una muestra boca arriba que define el triunfo y el mazo tiene 33 cartas además de la muestra

### Requirement: Jugar una baza
Por turnos, cada jugador MUST jugar una carta de su mano. En la variante base no hay obligación de seguir el palo, de ganar la baza ni de jugar triunfo.

#### Scenario: Cualquier carta es legal
- **WHEN** un jugador tiene el turno en la variante base
- **THEN** todas las cartas de su mano son jugadas legales

### Requirement: Quién gana la baza
Si en la baza hay algún triunfo, MUST ganar el triunfo de mayor rango. Si no hay triunfos, MUST ganar la carta de mayor rango del palo de la primera carta jugada. Una carta de otro palo que no es triunfo nunca gana.

#### Scenario: Gana el triunfo
- **WHEN** con triunfo en oros se juegan el as de copas y el 2 de oros
- **THEN** gana el 2 de oros

#### Scenario: Gana el palo de salida
- **WHEN** con triunfo en oros la salida es el 4 de espadas y la respuesta el as de bastos
- **THEN** gana el 4 de espadas

### Requirement: Robo y siguiente salida
Después de cada baza, mientras quede mazo, el ganador MUST robar primero y los demás después, en orden de turno. El ganador sale en la baza siguiente. Cuando se termina el mazo, se siguen jugando las cartas en mano sin robar.

#### Scenario: Robo tras la baza
- **WHEN** termina una baza y quedan cartas en el mazo
- **THEN** cada jugador vuelve a tener 3 cartas, el ganador robó primero y el ganador tiene la salida

#### Scenario: Última carta del mazo
- **WHEN** en 2 jugadores queda solo la muestra y otra carta en el mazo
- **THEN** el ganador de la baza roba la carta oculta y el otro jugador se lleva la muestra

### Requirement: Cambio de la muestra
Por defecto, el jugador que tiene el 7 de triunfo MUST poder cambiarlo por la muestra en su turno, antes de jugar, mientras quede en el mazo al menos una carta además de la muestra. Si la muestra es un 7 o una carta menor, el cambio MUST hacerse con el 2 de triunfo. La configuración MUST permitir desactivar el cambio o exigir haber ganado al menos una baza antes de cambiar.

#### Scenario: Cambiar con el 7
- **WHEN** el jugador en turno tiene el 7 de triunfo, la muestra es el as de triunfo y queda mazo
- **THEN** cambiar la muestra está entre sus acciones legales y, al hacerlo, el 7 queda como muestra y el as pasa a su mano

#### Scenario: Muestra baja
- **WHEN** la muestra es el 5 de triunfo
- **THEN** solo el 2 de triunfo puede cambiarse por ella

#### Scenario: Sin mazo no hay cambio
- **WHEN** en el mazo solo queda la muestra
- **THEN** cambiar la muestra no está entre las acciones legales

### Requirement: Fin de la mano y resultado
La mano MUST terminar cuando se juegan todas las cartas. Gana la mano quien sume más de 60 puntos en sus bazas. Con 60 y 60 la mano es empate.

#### Scenario: Ganar la mano
- **WHEN** termina la mano y un jugador suma 72 puntos
- **THEN** ese jugador gana la mano con 72 contra 48

#### Scenario: Empate
- **WHEN** termina la mano y ambos suman 60
- **THEN** la mano es empate

### Requirement: Partida a varias manos
La configuración MUST permitir jugar una sola mano o una partida al mejor de N manos (por defecto, una sola mano). En una partida a varias manos, el reparto alterna y la partida termina cuando un jugador alcanza las manos necesarias.

#### Scenario: Al mejor de 3
- **WHEN** en una partida al mejor de 3 un jugador gana su segunda mano
- **THEN** la partida termina y ese jugador gana

### Requirement: Cuatro jugadores en parejas
La configuración MUST permitir jugar con 4 jugadores en 2 parejas, con los compañeros sentados frente a frente. Cada jugador recibe 3 cartas y se juega por turnos en el sentido de la mesa. Los puntos de las bazas se suman por pareja y gana la pareja con más de 60. La vista de cada jugador MUST NOT mostrar la mano de su compañero.

#### Scenario: Reparto de 4 jugadores
- **WHEN** empieza una mano de 4 jugadores
- **THEN** cada uno tiene 3 cartas y el mazo tiene 27 cartas además de la muestra

#### Scenario: Puntos por pareja
- **WHEN** termina una mano de 4 jugadores
- **THEN** el resultado se calcula sumando los puntos de los dos miembros de cada pareja

### Requirement: Arrastre opcional al final
La configuración MUST ofrecer el arrastre, desactivado por defecto. Con el arrastre activo, una vez agotado el mazo, cada jugador MUST seguir el palo de salida y ganar la baza si puede. Si no tiene ese palo, MUST jugar triunfo si tiene, y superarlo si puede.

#### Scenario: Arrastre activo
- **WHEN** con el arrastre activo y el mazo agotado un jugador tiene cartas del palo de salida
- **THEN** solo las cartas de ese palo son jugadas legales, y si alguna gana la baza, solo esas
