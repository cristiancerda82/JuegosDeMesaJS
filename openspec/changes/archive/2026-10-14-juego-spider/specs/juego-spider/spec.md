## ADDED Requirements

### Requirement: Reparto
La partida MUST jugarse con dos barajas francesas, 104 cartas en total.
- **Palos:** con 1 palo (por defecto), las 104 cartas son picas (8 de cada valor). Con 2 palos, mitad picas y mitad corazones. Con 4 palos, las dos barajas completas.
- **Columnas:** se MUST repartir 54 cartas en 10 columnas, 6 en cada una de las 4 primeras y 5 en las demás, con solo la última de cada columna boca arriba.
- **Mazo:** las 50 cartas restantes, boca abajo.

Cada carta MUST tener un identificador único aunque haya varias iguales.

#### Scenario: Reparto inicial
- **WHEN** empieza una partida
- **THEN** hay 10 columnas con 6, 6, 6, 6, 5, 5, 5, 5, 5 y 5 cartas, una boca arriba en cada una, y 50 cartas en el mazo

#### Scenario: Dos palos
- **WHEN** empieza una partida con 2 palos
- **THEN** hay 52 picas y 52 corazones, 4 de cada valor y palo

### Requirement: Movimientos
- **Una carta:** la última carta de una columna MUST poder ponerse sobre la última de otra columna si vale exactamente uno menos, sea cual sea su palo, o en una columna vacía.
- **Varias cartas:** las últimas cartas de una columna MUST poder moverse juntas, con las mismas reglas, solo si forman una escalera descendente del mismo palo.
- **Volteo:** si al mover queda boca abajo la última carta de una columna, se MUST dar la vuelta.

Cada movimiento suma uno al contador.

#### Scenario: Poner sobre otro palo
- **WHEN** el 7 de corazones está al final de una columna y el 8 de picas al final de otra
- **THEN** se puede mover el 7 de corazones sobre el 8 de picas

#### Scenario: Escalera de distinto palo
- **WHEN** al final de una columna están el 8 de picas y encima el 7 de corazones
- **THEN** solo se puede mover el 7 de corazones, no las dos cartas juntas

#### Scenario: Se da la vuelta la carta tapada
- **WHEN** se mueve la única carta boca arriba de una columna que tiene cartas boca abajo
- **THEN** la nueva última carta de esa columna queda boca arriba

### Requirement: Repartir del mazo
Mientras quede mazo, el jugador MUST poder repartir: se pone una carta boca arriba al final de cada una de las 10 columnas. Por defecto, MUST NOT poder repartir si alguna columna está vacía; con la opción de permitirlo, se reparte igual.

#### Scenario: Reparto con columna vacía
- **WHEN** hay una columna vacía, queda mazo y la opción está desactivada
- **THEN** repartir no es una acción legal

### Requirement: Escaleras completas
Cuando al final de una columna haya una escalera del Rey al As del mismo palo, boca arriba, se MUST retirar sola de la mesa y contar como completada. La carta que quede al final de esa columna, si estaba boca abajo, se da la vuelta. La partida se MUST ganar al completar las 8 escaleras.

#### Scenario: Retirar una escalera
- **WHEN** se pone el As de picas al final de una escalera de picas del Rey al 2
- **THEN** las 13 cartas se retiran y las escaleras completadas suben en uno

### Requirement: Deshacer y abandonar
El jugador MUST poder deshacer cualquier movimiento o reparto, sin límite. Al deshacer se vuelve exactamente al estado anterior: las cartas que se dieron la vuelta vuelven boca abajo y las escaleras retiradas vuelven a su columna. El jugador MUST poder abandonar la partida en cualquier momento.

#### Scenario: Deshacer un reparto
- **WHEN** el jugador reparte del mazo y luego deshace
- **THEN** las 10 cartas vuelven al mazo y las columnas quedan como estaban

### Requirement: Vista del Spider
La vista MUST mostrar:
- las cartas boca arriba de cada columna y cuántas hay boca abajo;
- cuántos repartos quedan en el mazo;
- las escaleras completadas;
- los movimientos;
- si se ha ganado o abandonado.

MUST NOT mostrar las cartas boca abajo ni las del mazo.

#### Scenario: Cartas ocultas
- **WHEN** se pide la vista
- **THEN** no contiene ninguna carta boca abajo ni del mazo
