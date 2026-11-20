## ADDED Requirements

### Requirement: Tute subastado de 3 jugadores
El Tute subastado MUST tener la opción de jugadores, 4 por defecto o 3. Una partida sin la opción MUST jugarse con 4.

Con 3:
- se MUST quitar los cuatro doses y repartir las 36 cartas, 12 a cada jugador, sin muestra;
- la primera puja MUST ser de 70 como mínimo, y cada puja sube la vigente de 10 en 10 sin pasar de 230;
- la subasta acaba cuando, tras una puja, los otros dos han pasado, y si pasan los tres se reparte otra mano;
- no se MUST poder cantar el tute; las 20 y las 40 se cantan igual;
- el pujador juega contra los otros dos, y al cobrar gana o paga a cada uno una ficha por cada 10 puntos pujados.

El orden y los puntos de las cartas, el triunfo, las obligaciones, los cantes y el fin de la partida MUST ser los mismos que con 4.

#### Scenario: Reparto con 3
- **WHEN** empieza una partida de Tute subastado de 3
- **THEN** cada jugador tiene 12 cartas, ninguna es un dos y le toca hablar al asiento 0

#### Scenario: Puja mínima con 3
- **WHEN** en una partida de 3 nadie ha pujado y le toca al asiento 0
- **THEN** puede pasar o pujar 70, 80… hasta 230, y no puede pujar 60

#### Scenario: Sin tute con 3
- **WHEN** en una partida de 3 quien acaba de ganar una baza tiene los cuatro Reyes
- **THEN** puede cantar las 20 o las 40 de sus parejas, pero no el tute

#### Scenario: Cobro con 3
- **WHEN** en una partida de 3 el pujador pujó 80 y hace 85 puntos
- **THEN** gana 16 fichas y cada uno de los otros dos pierde 8

#### Scenario: Partida guardada sin la opción
- **WHEN** se retoma una partida cuya config no tiene jugadores
- **THEN** se juega con 4, como siempre
