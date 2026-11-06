# juego-treinta-y-uno Specification

## Purpose
TBD - created by archiving change juego-treinta-y-uno. Update Purpose after archive.

## Requirements

### Requirement: Baraja y valor de la mano del Treinta y uno
El Treinta y uno MUST jugarse de 2 a 6 jugadores (4 por defecto) con la baraja francesa de 52 cartas.

El valor de una mano de 3 cartas MUST ser la mayor suma de las cartas de un mismo palo, contando el As como 11, las figuras (J, Q y K) como 10 y las demás por su número. Si las tres cartas son del mismo número, la mano MUST valer 30,5.

#### Scenario: Suma de un palo
- **WHEN** la mano es el As y el K de corazones y el 9 de picas
- **THEN** vale 21

#### Scenario: Treinta y uno
- **WHEN** la mano es el As, el K y el 10 de tréboles
- **THEN** vale 31

#### Scenario: Tres iguales
- **WHEN** la mano son tres sietes
- **THEN** vale 30,5

### Requirement: Reparto del Treinta y uno
En cada ronda MUST repartirse 3 cartas a cada jugador con vidas, descubrirse una carta para empezar el descarte y dejar el resto como mazo. En la primera ronda empieza el asiento 0; en cada ronda siguiente empieza el siguiente jugador con vidas.

#### Scenario: Reparto con 4
- **WHEN** empieza la primera ronda con 4 jugadores
- **THEN** cada uno tiene 3 cartas, hay una en el descarte y 39 en el mazo

### Requirement: Turno del Treinta y uno
En su turno, el jugador MUST elegir entre:
- **robar** la primera carta del mazo o la de arriba del descarte, y después descartar una carta de su mano; no puede descartar la carta que acaba de coger del descarte;
- **plantarse**, en lugar de robar, si nadie se ha plantado aún en la ronda.

Si el mazo se acaba, el descarte salvo su carta de arriba MUST barajarse para formar un mazo nuevo.

#### Scenario: Robar del descarte
- **WHEN** el jugador coge la carta de arriba del descarte
- **THEN** tiene 4 cartas y tiene que descartar una que no sea esa

#### Scenario: El mazo se acaba
- **WHEN** hay que robar del mazo y está vacío
- **THEN** el descarte, salvo su carta de arriba, se baraja y forma el mazo

### Requirement: Plantarse en el Treinta y uno
Cuando un jugador se planta, cada uno de los demás jugadores con vidas MUST jugar un último turno (sin poder plantarse), y después se enseñan todas las manos.

Si tras 8 vueltas nadie se ha plantado, la ronda MUST terminar como si se hubiera plantado el jugador que empezó la ronda.

#### Scenario: Último turno
- **WHEN** con 4 jugadores el asiento 1 se planta
- **THEN** juegan su último turno los asientos 2, 3 y 0, y se enseñan las manos

### Requirement: Vidas del Treinta y uno
Cada jugador MUST empezar con 3 vidas. Al enseñar las manos, el jugador con la mano de menor valor MUST perder una vida; si empatan varios con el menor valor, todos ellos la pierden. Quien se queda sin vidas queda fuera de la partida.

#### Scenario: Pierde la peor mano
- **WHEN** al enseñar las manos valen 28, 21 y 30,5
- **THEN** pierde una vida el de 21

#### Scenario: Empate abajo
- **WHEN** al enseñar las manos dos jugadores tienen la menor, con 20
- **THEN** los dos pierden una vida

### Requirement: Fin de la partida del Treinta y uno
La partida MUST terminar cuando solo queda un jugador con vidas, que gana. Si los últimos jugadores pierden su última vida en la misma ronda, empatan entre ellos.

#### Scenario: Queda uno
- **WHEN** el penúltimo jugador con vidas pierde la última
- **THEN** gana el que queda

### Requirement: Vista del jugador en el Treinta y uno
La vista de cada jugador MUST mostrar:
- su mano y el valor de su mano;
- cuántas cartas tiene cada uno;
- el descarte, cuántas quedan en el mazo y las cartas que cada uno cogió del descarte y aún tiene;
- quién se ha plantado y a quién le queda el último turno;
- las vidas de cada uno y el resumen de las rondas anteriores, con las manos enseñadas.

La vista MUST NOT mostrar las manos ajenas (salvo las cartas que cogieron del descarte) ni el orden del mazo hasta que se enseñan las manos.

#### Scenario: Carta cogida del descarte
- **WHEN** un rival coge el 10 de picas del descarte y no lo descarta
- **THEN** el jugador ve que el rival tiene el 10 de picas, pero no sus otras cartas
