# juego-gin-rummy Specification

## Purpose
TBD - created by archiving change juego-gin-rummy. Update Purpose after archive.

## Requirements

### Requirement: Reparto del Gin Rummy
El Gin Rummy MUST jugarse entre 2 jugadores con la baraja francesa de 52 cartas, barajada en cada mano. Cada jugador recibe 10 cartas; la siguiente se pone boca arriba como primera carta del descarte y el resto forma el mazo, boca abajo. En la primera mano reparte el asiento 1; después el reparto se alterna, salvo tras una mano nula, en la que reparte el mismo jugador.

#### Scenario: Empezar el Gin Rummy
- **WHEN** empieza una partida
- **THEN** cada jugador tiene 10 cartas, el descarte tiene una carta boca arriba, el mazo 31 y le toca decidir al asiento 0

### Requirement: Primera carta del descarte
Al empezar cada mano, el jugador que no reparte MUST elegir entre quedarse la carta descubierta o pasar. Si se la queda, descarta y sigue el juego normal. Si pasa, elige igual el que reparte. Si los dos pasan, el que no reparte roba del mazo y sigue el juego normal.

#### Scenario: Los dos pasan
- **WHEN** el asiento 0 pasa y el asiento 1, que reparte, también pasa
- **THEN** le toca al asiento 0 y solo puede robar del mazo

#### Scenario: Quedarse la primera carta
- **WHEN** el asiento 0 se queda la carta descubierta
- **THEN** tiene 11 cartas y le toca descartar una que no sea esa

### Requirement: Turno del Gin Rummy
En su turno, cada jugador MUST robar una carta, del mazo o la de arriba del descarte, y después descartar una carta boca arriba o cerrar. No puede descartar la carta que acaba de coger del descarte en ese mismo turno. La carta robada del mazo solo la ve quien la roba; la cogida del descarte la ven los dos.

#### Scenario: No devolver la carta del descarte
- **WHEN** un jugador coge el 7 de picas del descarte
- **THEN** descartar el 7 de picas no es una acción legal en ese turno

### Requirement: Combinaciones y puntos sueltos del Gin Rummy
Las combinaciones MUST ser:
- **grupos:** 3 o 4 cartas del mismo número;
- **escaleras:** 3 o más cartas seguidas del mismo palo, con el As siempre bajo: A-2-3 es escalera y Q-K-A no.

Cada carta cuenta como mucho en una combinación. Las cartas que no están en ninguna son **sueltas** y suman puntos: el As 1, del 2 al 10 su número, la J, la Q y la K 10. Los puntos sueltos de una mano MUST ser los de la agrupación que deja menos.

#### Scenario: El As no cierra escalera por arriba
- **WHEN** una mano tiene la Q, la K y el As de corazones y nada más que combine con ellas
- **THEN** las tres cartas están sueltas y suman 21

#### Scenario: La mejor agrupación
- **WHEN** una mano tiene el 7 de picas, de corazones y de diamantes y el 8 y el 9 de picas
- **THEN** la escalera 7-8-9 de picas es la mejor agrupación y sus puntos sueltos son 14 (el 7 de corazones y el de diamantes), no los 17 que dejaría el grupo de sietes

### Requirement: Cerrar y Gin
En lugar de un descarte normal, un jugador MUST poder cerrar descartando una carta si con las 10 que le quedan tiene 10 puntos sueltos o menos. Con 0 puntos sueltos el cierre es **Gin**. Al cerrar, las dos manos se destapan con su mejor agrupación.

#### Scenario: No se puede cerrar con 11
- **WHEN** a un jugador, tras descartar cualquier carta, le quedarían al menos 11 puntos sueltos
- **THEN** cerrar no es una acción legal

### Requirement: Colocar cartas en las combinaciones de quien cierra
Si el cierre no es Gin, las cartas sueltas del rival que encajen en las combinaciones de quien cierra MUST colocarse en ellas y dejar de contar: una carta del mismo número en un grupo de 3, o una carta que alarga una escalera por uno de sus extremos (también con varias seguidas). El motor MUST elegir solo las colocaciones y la agrupación del rival que le dejan menos puntos sueltos. Con Gin no se coloca nada.

#### Scenario: Colocar en una escalera
- **WHEN** quien cierra tiene la escalera 5-6-7 de diamantes y el rival tiene sueltos el 8 y el 9 de diamantes
- **THEN** los dos se colocan y no suman puntos al rival

#### Scenario: Con Gin no se coloca
- **WHEN** un jugador cierra con Gin y el rival tiene una carta que alargaría una de sus escaleras
- **THEN** esa carta sigue sumando puntos al rival

### Requirement: Puntuación de la mano del Gin Rummy
Al cerrar se MUST puntuar la mano:
- **Gin:** quien cierra gana los puntos sueltos del rival más 25;
- **cierre normal:** si quien cierra tiene menos puntos sueltos que el rival (después de colocar), gana la diferencia;
- **undercut:** si el rival tiene los mismos o menos, el rival gana la diferencia más 25.

Si quedan solo 2 cartas en el mazo y el jugador que acaba de robar descarta sin cerrar, la mano MUST terminar **nula**, sin puntos. El resultado de la mano (las dos manos destapadas con sus combinaciones y sueltas, lo colocado, quién gana y los puntos) MUST quedar a la vista de los dos.

#### Scenario: Cierre normal
- **WHEN** un jugador cierra con 6 puntos sueltos y al rival le quedan 20 después de colocar
- **THEN** quien cierra gana 14 puntos

#### Scenario: Undercut
- **WHEN** un jugador cierra con 8 puntos sueltos y al rival le quedan 5 después de colocar
- **THEN** el rival gana 28 puntos

#### Scenario: Gin
- **WHEN** un jugador cierra con Gin y el rival tiene 30 puntos sueltos
- **THEN** quien cierra gana 55 puntos

#### Scenario: Mano nula
- **WHEN** quedan 2 cartas en el mazo y el jugador en turno descarta sin cerrar
- **THEN** la mano termina sin puntos y vuelve a repartir el mismo jugador

### Requirement: Partida a 100 del Gin Rummy
Tras cada mano, si un jugador llega a 100 puntos o más, la partida MUST terminar y gana él. El marcador final de cada jugador MUST ser sus puntos más 25 por cada mano que ganó, y el ganador suma además 100. Si el perdedor no ganó ninguna mano, el marcador final del ganador se dobla.

#### Scenario: Marcador final con bonos
- **WHEN** un jugador llega a 104 puntos ganando 3 manos y el rival tiene 30 puntos con 2 manos ganadas
- **THEN** el ganador acaba con 104 + 75 + 100 = 279 y el rival con 30 + 50 = 80

#### Scenario: Partida en blanco
- **WHEN** un jugador llega a 110 puntos y el rival no ha ganado ninguna mano
- **THEN** el marcador final del ganador se dobla

### Requirement: Vista del Gin Rummy
La vista de cada jugador MUST mostrar su mano, cuántas cartas tiene el rival, cuántas quedan en el mazo, el descarte entero en orden (es público), qué cartas cogió el rival del descarte y siguen en su mano, la fase, el turno, los puntos y manos ganadas de cada uno y los resultados de las manos anteriores. La mano del rival y el orden del mazo MUST no mostrarse hasta que se destapan al cerrar.

#### Scenario: Lo que se sabe del rival
- **WHEN** el rival cogió la K de tréboles del descarte y todavía no la ha soltado
- **THEN** la vista del jugador muestra que el rival tiene la K de tréboles, pero no sus otras cartas
