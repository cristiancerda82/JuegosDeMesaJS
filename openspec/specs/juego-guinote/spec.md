# juego-guinote Specification

## Purpose
TBD - created by archiving change juego-guinote. Update Purpose after archive.

## Requirements

### Requirement: Orden y valor de las cartas
Las cartas del Guiñote MUST ordenarse, de mayor a menor, así: as (11 puntos), tres (10), rey (4), sota (3), caballo (2), 7, 6, 5, 4 y 2 (0 puntos). La última baza de la mano MUST sumar 10 puntos más (10 de últimas), así que sin cantes una mano reparte 130 puntos.

#### Scenario: La sota gana al caballo
- **WHEN** sin triunfos en la baza se juegan el caballo de oros y después la sota de oros
- **THEN** gana la sota de oros

#### Scenario: Total sin cantes
- **WHEN** termina una mano sin cantes
- **THEN** los puntos de los dos bandos suman 130

### Requirement: Preparación de la mano
Cada jugador MUST recibir 6 cartas, con 2 jugadores o con 4 en 2 parejas de compañeros enfrentados. La carta siguiente MUST ponerse boca arriba al fondo del mazo: es la muestra, su palo es el triunfo y es la última carta que se roba. Sale el jugador siguiente al repartidor, y el reparto pasa al siguiente en cada mano.

#### Scenario: Reparto de 2 jugadores
- **WHEN** empieza una mano de 2 jugadores
- **THEN** cada jugador tiene 6 cartas, hay una muestra que define el triunfo y el mazo tiene 27 cartas además de la muestra

#### Scenario: Reparto de 4 jugadores
- **WHEN** empieza una mano de 4 jugadores
- **THEN** cada jugador tiene 6 cartas, hay una muestra que define el triunfo y el mazo tiene 15 cartas además de la muestra

### Requirement: Quién gana la baza
Si en la baza hay algún triunfo, MUST ganar el triunfo de mayor rango. Si no hay triunfos, MUST ganar la carta de mayor rango del palo de salida. El ganador se lleva la baza y sale en la siguiente.

#### Scenario: Gana el triunfo
- **WHEN** con triunfo en copas se juegan el as de oros y el 4 de copas
- **THEN** gana el 4 de copas

### Requirement: Robo
Tras cada baza y mientras quede mazo, cada jugador MUST robar una carta en orden de turno, empezando por el ganador de la baza. La muestra es la última carta que se roba.

#### Scenario: Robo tras la baza
- **WHEN** termina una baza y quedan cartas en el mazo
- **THEN** todos vuelven a tener 6 cartas y el ganador de la baza robó primero

### Requirement: Arrastre
Mientras quede mazo (incluida la muestra), cualquier carta de la mano MUST ser una jugada legal. Cuando se agota el mazo empieza el arrastre. En el arrastre, cada jugador MUST seguir el palo de salida si lo tiene y ganar la baza con él si puede. Si no tiene ese palo, MUST jugar triunfo si tiene y superar el triunfo más alto de la baza si puede. Si no tiene ni el palo de salida ni triunfo, puede jugar cualquier carta.

#### Scenario: Libre con mazo
- **WHEN** aún queda mazo
- **THEN** todas las cartas de la mano son jugadas legales

#### Scenario: Asistir y montar en el arrastre
- **WHEN** en el arrastre la salida es el caballo de espadas y el jugador tiene el 2 y la sota de espadas
- **THEN** solo la sota de espadas es una jugada legal

#### Scenario: Fallar en el arrastre
- **WHEN** en el arrastre el jugador no tiene el palo de salida y tiene triunfos
- **THEN** solo sus triunfos son jugadas legales, y si alguno supera al triunfo más alto de la baza, solo esos

### Requirement: Montar sobre el compañero
La configuración MUST indicar si, con 4 jugadores y en el arrastre, hay que superar la baza cuando ya la va ganando el compañero. Por defecto no es obligatorio: si la baza es del compañero, el jugador MUST seguir el palo de salida si lo tiene, pero puede jugar cualquier carta de ese palo, y si no lo tiene puede jugar cualquier carta.

#### Scenario: Baza del compañero en el arrastre
- **WHEN** con la opción por defecto el compañero va ganando la baza y el jugador tiene el palo de salida
- **THEN** cualquier carta de ese palo es una jugada legal, aunque no gane la baza

### Requirement: Cantes
El jugador que acaba de ganar una baza MUST poder, en su turno, antes de salir y mientras quede mazo, cantar una pareja de rey y sota del mismo palo que tenga en la mano. Vale 40 puntos si es del palo de triunfo y 20 si no. Solo MUST poder hacer un cante por cada baza ganada, y cada palo solo se puede cantar una vez por mano. Los puntos del cante se suman a su bando, y el cante MUST ser visible para todos los jugadores.

#### Scenario: Cantar las 40
- **WHEN** el jugador que ganó la última baza tiene el rey y la sota de triunfo, no se cantaron y queda mazo
- **THEN** cantar las 40 está entre sus acciones legales y, al hacerlo, su bando suma 40 puntos y sigue siendo su turno para salir

#### Scenario: Sin baza ganada no se canta
- **WHEN** un jugador tiene el rey y la sota de un palo pero no ganó la última baza
- **THEN** cantar no está entre sus acciones legales

#### Scenario: En el arrastre no se canta
- **WHEN** el jugador gana una baza después de agotarse el mazo y tiene el rey y la sota de un palo sin cantar
- **THEN** cantar no está entre sus acciones legales

#### Scenario: Un cante por baza
- **WHEN** un jugador ya cantó tras ganar una baza y tiene otra pareja
- **THEN** no puede volver a cantar hasta ganar otra baza

### Requirement: Cambio del 7 de triunfo
El jugador que tiene el 7 de triunfo MUST poder cambiarlo por la muestra en su turno, antes de jugar, mientras quede en el mazo al menos una carta además de la muestra. Si la muestra es un 7 o una carta menor, el cambio se hace con el 2 de triunfo. La configuración MUST permitir desactivar el cambio, permitirlo siempre o exigir que su bando haya ganado al menos una baza antes (por defecto).

#### Scenario: Cambio tras ganar una baza
- **WHEN** con la opción por defecto el jugador en turno tiene el 7 de triunfo, su bando ya ganó una baza y queda mazo
- **THEN** cambiar la muestra está entre sus acciones legales y, al hacerlo, el 7 queda como muestra y la antigua muestra pasa a su mano

#### Scenario: Sin bazas no se cambia
- **WHEN** con la opción por defecto el jugador tiene el 7 de triunfo y su bando no ganó ninguna baza
- **THEN** cambiar la muestra no está entre sus acciones legales

### Requirement: Fin de la mano
La mano MUST terminar cuando se juegan todas las cartas. Los puntos de la mano de cada bando son los de sus bazas, sus cantes y los 10 de últimas, y MUST sumarse a los puntos acumulados de la partida.

#### Scenario: Puntos con cantes
- **WHEN** termina la mano, un bando suma 70 en bazas más un cante de 20 y el otro 60
- **THEN** la mano queda 90 a 60 y esos puntos se suman a los totales de cada bando

### Requirement: Partida a 101 con vueltas
La partida MUST jugarse a 101 puntos por defecto, y la configuración MUST permitir otra meta. Al terminar una mano, si algún bando alcanza la meta con sus puntos acumulados, la partida termina y gana el bando con más puntos. Si ningún bando la alcanza, o si los dos la alcanzan con los mismos puntos, se juega otra mano (de vueltas) y los puntos se siguen acumulando.

#### Scenario: Gana en la primera mano
- **WHEN** termina la primera mano 105 a 25
- **THEN** la partida termina y gana el bando de 105

#### Scenario: De vueltas
- **WHEN** termina la primera mano 70 a 60
- **THEN** se reparte otra mano y la partida sigue con los totales 70 y 60

#### Scenario: Los dos pasan de la meta
- **WHEN** al terminar una mano de vueltas los totales quedan 140 a 120
- **THEN** la partida termina y gana el bando de 140

### Requirement: Vista del jugador
La vista de cada jugador MUST mostrar su propia mano, el número de cartas de los demás (incluido su compañero), la muestra y el palo de triunfo, las cartas que quedan en el mazo, si se está en el arrastre, la baza en curso, la última baza, las bazas ganadas por cada jugador, los cantes de la mano (quién, qué palo y cuántos puntos), los resultados de las manos anteriores y los puntos acumulados de cada bando. La vista MUST NOT mostrar las cartas en mano de los demás jugadores ni el orden del mazo.

#### Scenario: Mano del compañero oculta
- **WHEN** se pide la vista de un jugador en una partida de 4
- **THEN** no contiene ninguna carta de la mano de su compañero ni del mazo
