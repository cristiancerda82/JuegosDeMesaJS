## Purpose

Define las reglas del Tute español con baraja de 40 cartas: la modalidad de 2 jugadores con robo y la de 4 jugadores en parejas, sus cantes, sus obligaciones de juego, su puntuación y las variantes que se activan por configuración.

## ADDED Requirements

### Requirement: Orden y valor de las cartas
Las cartas MUST ordenarse y puntuar igual que en la Brisca: de mayor a menor, as (11), tres (10), rey (4), caballo (3), sota (2), 7, 6, 5, 4 y 2 (0). La última baza de la mano MUST sumar 10 puntos más (10 de últimas), así que sin cantes una mano reparte 130 puntos.

#### Scenario: Total sin cantes
- **WHEN** termina una mano sin cantes
- **THEN** los puntos de los dos bandos suman 130

### Requirement: Preparación con 2 jugadores
Con 2 jugadores, cada uno MUST recibir 8 cartas. La carta siguiente se pone boca arriba al fondo del mazo y su palo es el triunfo (la muestra). Es la última carta que se roba. Sale el jugador que no reparte, y el reparto alterna entre manos.

#### Scenario: Reparto de 2 jugadores
- **WHEN** empieza una mano de 2 jugadores
- **THEN** cada jugador tiene 8 cartas, hay una muestra que define el triunfo y el mazo tiene 23 cartas además de la muestra

### Requirement: Preparación con 4 jugadores
Con 4 jugadores en 2 parejas, con los compañeros enfrentados, se MUST repartir todo el mazo: 10 cartas a cada uno. La última carta, que le toca al repartidor, define el triunfo y MUST ser visible para todos mientras siga en su mano. Sale el jugador siguiente al repartidor en el orden de turno.

#### Scenario: Reparto de 4 jugadores
- **WHEN** empieza una mano de 4 jugadores
- **THEN** cada uno tiene 10 cartas, no queda mazo y todos ven la carta de triunfo del repartidor

#### Scenario: La carta de triunfo deja de verse al jugarla
- **WHEN** el repartidor juega la carta que marcó el triunfo
- **THEN** la carta queda en la baza como cualquier otra y la vista sigue indicando el palo de triunfo

### Requirement: Quién gana la baza
Si en la baza hay algún triunfo, MUST ganar el triunfo de mayor rango. Si no hay triunfos, MUST ganar la carta de mayor rango del palo de salida. El ganador se lleva la baza y sale en la siguiente.

#### Scenario: Gana el triunfo
- **WHEN** con triunfo en copas se juegan el as de oros y el 4 de copas
- **THEN** gana el 4 de copas

### Requirement: Robo con 2 jugadores
Con 2 jugadores, tras cada baza y mientras quede mazo, el ganador MUST robar primero y el otro después. El último robo de la mano le da la muestra al jugador que pierde esa baza.

#### Scenario: Robo tras la baza
- **WHEN** termina una baza de 2 jugadores y quedan cartas en el mazo
- **THEN** los dos jugadores vuelven a tener 8 cartas y el ganador robó primero

### Requirement: Obligaciones de juego
Cuando las obligaciones están en vigor, cada jugador MUST seguir el palo de salida si lo tiene, y ganar la baza con él si puede. Si no tiene ese palo, MUST jugar triunfo si tiene, y superar el triunfo más alto de la baza si puede. Si no tiene el palo de salida ni triunfo, puede jugar cualquier carta. Con 4 jugadores las obligaciones rigen desde la primera baza. Con 2 jugadores rigen solo cuando se agota el mazo (incluida la muestra); antes, cualquier carta es legal.

#### Scenario: Seguir el palo y montar
- **WHEN** con las obligaciones en vigor la salida es el rey de espadas y el jugador tiene el 2 y el 3 de espadas
- **THEN** solo el 3 de espadas es una jugada legal

#### Scenario: Fallar con triunfo
- **WHEN** con las obligaciones en vigor el jugador no tiene el palo de salida y tiene triunfos
- **THEN** solo sus triunfos son jugadas legales, y si alguno supera al triunfo más alto de la baza, solo esos

#### Scenario: Libre con mazo en 2 jugadores
- **WHEN** en una partida de 2 jugadores aún queda mazo
- **THEN** todas las cartas de la mano son jugadas legales

### Requirement: Montar sobre el compañero
La configuración MUST indicar si, con 4 jugadores, hay que superar la baza cuando ya la va ganando el compañero. Por defecto no es obligatorio: si la baza es del compañero, el jugador MUST seguir el palo de salida si lo tiene, pero puede jugar cualquier carta de ese palo, y si no lo tiene puede jugar cualquier carta.

#### Scenario: Baza del compañero
- **WHEN** con la opción por defecto el compañero va ganando la baza y el jugador tiene el palo de salida
- **THEN** cualquier carta de ese palo es una jugada legal, aunque no gane la baza

#### Scenario: Montar obligatorio
- **WHEN** con la opción de montar sobre el compañero activa el jugador puede superar la carta de su compañero con el palo de salida
- **THEN** solo las cartas que la superan son jugadas legales

### Requirement: Cantes
El jugador que acaba de ganar una baza MUST poder, en su turno y antes de salir, cantar una pareja de rey y caballo del mismo palo que tenga en la mano: vale 40 puntos si es del palo de triunfo y 20 si no. Solo MUST poder hacer un cante por cada baza ganada, y cada palo solo se puede cantar una vez por mano. Los puntos del cante se suman a su bando. El cante MUST ser visible para todos los jugadores.

#### Scenario: Cantar las 40
- **WHEN** el jugador que ganó la última baza tiene el rey y el caballo de triunfo y no se cantaron
- **THEN** cantar las 40 está entre sus acciones legales y, al hacerlo, su bando suma 40 puntos y sigue siendo su turno para salir

#### Scenario: Sin baza ganada no se canta
- **WHEN** un jugador tiene rey y caballo de un palo pero no ganó la última baza
- **THEN** cantar no está entre sus acciones legales

#### Scenario: Un cante por baza
- **WHEN** un jugador ya cantó tras ganar una baza y tiene otra pareja
- **THEN** no puede volver a cantar hasta ganar otra baza

### Requirement: Cantar el tute
El jugador que acaba de ganar una baza y tiene en la mano los 4 reyes o los 4 caballos MUST poder cantar el tute, en las mismas condiciones que un cante. Cantar el tute MUST hacer que su bando gane la mano en el acto, sin importar los puntos.

#### Scenario: Tute de reyes
- **WHEN** el jugador que ganó la última baza tiene los 4 reyes y canta el tute
- **THEN** la mano termina y la gana su bando

### Requirement: Cambio del 7 de triunfo
Con 2 jugadores, el que tiene el 7 de triunfo MUST poder cambiarlo por la muestra en su turno, antes de jugar, mientras quede en el mazo al menos una carta además de la muestra. Si la muestra es un 7 o una carta menor, el cambio se hace con el 2 de triunfo. La configuración MUST permitir desactivar el cambio, permitirlo siempre o exigir haber ganado al menos una baza antes (por defecto). Con 4 jugadores no hay cambio.

#### Scenario: Cambio tras ganar una baza
- **WHEN** con la opción por defecto el jugador en turno tiene el 7 de triunfo, ya ganó una baza y queda mazo
- **THEN** cambiar la muestra está entre sus acciones legales y, al hacerlo, el 7 queda como muestra y la antigua muestra pasa a su mano

### Requirement: Fin de la mano y resultado
La mano MUST terminar cuando se juegan todas las cartas o cuando se canta el tute. Gana la mano el bando con más puntos, sumando bazas, cantes y 10 de últimas. Con los mismos puntos, la mano es empate.

#### Scenario: Ganar por puntos con cantes
- **WHEN** termina la mano, un bando suma 70 en bazas más un cante de 20 y el otro 60
- **THEN** el primer bando gana la mano con 90 contra 60

#### Scenario: Empate
- **WHEN** termina la mano y los dos bandos tienen los mismos puntos
- **THEN** la mano es empate

### Requirement: Partida a varias manos
La configuración MUST permitir jugar una sola mano o una partida al mejor de N manos (por defecto, una sola mano). En una partida a varias manos, el reparto alterna y la partida termina cuando un bando alcanza las manos necesarias o se juegan las N.

#### Scenario: Al mejor de 3
- **WHEN** en una partida al mejor de 3 un bando gana su segunda mano
- **THEN** la partida termina y ese bando gana

### Requirement: Vista del jugador
La vista de cada jugador MUST mostrar su propia mano, el número de cartas de los demás (incluido su compañero), el palo y la carta de triunfo mientras sea visible, las cartas que quedan en el mazo, la baza en curso, las bazas ganadas por cada jugador y los cantes hechos (quién, qué palo y cuántos puntos). La vista MUST NOT mostrar las cartas en mano de los demás jugadores, salvo la carta de triunfo del repartidor con 4 jugadores.

#### Scenario: Mano del compañero oculta
- **WHEN** se pide la vista de un jugador en una partida de 4
- **THEN** no contiene ninguna carta de la mano de su compañero, salvo la carta de triunfo si el compañero es el repartidor y aún no la jugó
