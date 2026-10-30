# baraja Specification

## Purpose
Define las cartas y barajas que usan todos los juegos de la suite (española de 40 y 48 cartas, francesa de 52), y cómo se barajan y reparten de forma reproducible.

## Requirements

### Requirement: Baraja española
El sistema MUST poder crear una baraja española con los palos oros, copas, espadas y bastos, en dos tamaños:
- 40 cartas: valores 1 a 7 y 10 (sota), 11 (caballo) y 12 (rey) de cada palo.
- 48 cartas: valores 1 a 12 de cada palo.

#### Scenario: Baraja de 40 cartas
- **WHEN** se crea una baraja española de 40 cartas
- **THEN** contiene exactamente 40 cartas distintas, 10 por palo, sin ochos ni nueves

#### Scenario: Baraja de 48 cartas
- **WHEN** se crea una baraja española de 48 cartas
- **THEN** contiene exactamente 48 cartas distintas, 12 por palo, con los valores del 1 al 12

### Requirement: Baraja francesa
El sistema MUST poder crear una baraja francesa de 52 cartas con los palos picas, corazones, diamantes y tréboles, y los valores A, 2 a 10, J, Q y K. Corazones y diamantes son rojos; picas y tréboles son negros.

#### Scenario: Composición de la baraja francesa
- **WHEN** se crea una baraja francesa
- **THEN** contiene exactamente 52 cartas distintas, 13 por palo
- **AND** cada carta informa su color: rojo para corazones y diamantes, negro para picas y tréboles

### Requirement: Identidad de las cartas
Cada carta MUST tener un identificador único y estable dentro de su baraja, que se pueda serializar y que permita reconstruir su palo y su valor.

#### Scenario: Ida y vuelta del identificador
- **WHEN** se serializa el identificador de cualquier carta y se vuelve a leer
- **THEN** se obtiene una carta con el mismo palo y el mismo valor

### Requirement: Barajado determinista con semilla
El barajado MUST depender solo de una semilla: la misma semilla produce siempre el mismo orden en cualquier plataforma. El resultado MUST NOT mostrar sesgos apreciables: con muchas semillas distintas, cada carta aparece con la misma frecuencia en cada posición.

#### Scenario: Misma semilla, mismo orden
- **WHEN** se baraja dos veces la misma baraja con la misma semilla
- **THEN** los dos órdenes son idénticos

#### Scenario: Semillas distintas
- **WHEN** se baraja la misma baraja con dos semillas distintas
- **THEN** los órdenes resultantes difieren (salvo coincidencia improbable)

#### Scenario: Barajado conserva las cartas
- **WHEN** se baraja una baraja
- **THEN** el resultado contiene exactamente las mismas cartas, cada una una sola vez

### Requirement: Reparto
El sistema MUST permitir repartir un número dado de cartas desde la parte superior del mazo a uno o varios destinos, sin duplicar ni perder cartas. Pedir más cartas de las que quedan en el mazo MUST producir un error, sin repartir parcialmente.

#### Scenario: Reparto normal
- **WHEN** se reparten 3 cartas a cada uno de 2 jugadores desde un mazo de 40
- **THEN** cada jugador tiene 3 cartas, el mazo tiene 34 y no hay cartas repetidas entre ellos

#### Scenario: Reparto imposible
- **WHEN** se piden 5 cartas a un mazo que tiene 4
- **THEN** la operación falla y el mazo queda sin cambios

### Requirement: Comodines
El sistema MUST ofrecer 2 comodines con identificadores propios y estables, distintos de los de cualquier carta con palo, que se pueden añadir a una baraja española. Un comodín no tiene palo ni valor, y las funciones que piden el palo o el valor de una carta MUST distinguirlo de las cartas normales. Las barajas sin comodines no cambian.

#### Scenario: Baraja con comodines
- **WHEN** se crea una baraja española de 40 cartas con comodines
- **THEN** tiene 42 cartas distintas: las 40 de siempre y 2 comodines

#### Scenario: Identidad del comodín
- **WHEN** se pregunta si una carta es un comodín
- **THEN** la respuesta es afirmativa solo para los 2 identificadores de comodín

### Requirement: Baraja de Tarot
El sistema MUST poder crear la baraja de Tarot de 78 cartas:
- los cuatro palos franceses con 14 cartas cada uno: del 1 al 10, Sota (J), Caballo, Dama (Q) y Rey (K). El Caballo es una carta propia de esta baraja, con su identificador de palo y valor 14;
- 21 triunfos numerados del 1 al 21, con identificadores propios;
- la Excusa, con un identificador propio.

Los triunfos y la Excusa no tienen palo francés: las funciones que piden el palo o el valor de una carta MUST distinguirlos de las cartas con palo, como a los comodines. Las demás barajas no cambian.

#### Scenario: Composición de la baraja de Tarot
- **WHEN** se crea la baraja de Tarot
- **THEN** contiene exactamente 78 cartas distintas: 56 de palo (14 por palo), 21 triunfos y la Excusa

#### Scenario: Caballo
- **WHEN** se lee el identificador del Caballo de picas
- **THEN** se obtiene la carta de picas con valor 14, que la baraja francesa de 52 no contiene
