## ADDED Requirements

### Requirement: Baraja y reparto del Piquet
El Piquet MUST jugarse entre 2 con 32 cartas francesas, del 7 al As de cada palo. El orden, de mayor a menor, MUST ser A, K, Q, J, 10, 9, 8 y 7. En cada mano, cada jugador MUST recibir 12 cartas, y las 8 restantes forman el montón, boca abajo.

El que no reparte es el mayor y el que reparte, el menor. En la primera mano reparte el jugador 1, y el repartidor se alterna en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 12 cartas y el montón tiene 8

### Requirement: Cambio de cartas del Piquet
Primero cambia el mayor: MUST descartar de 1 a 5 cartas y robar otras tantas de lo alto del montón. Después cambia el menor: MAY descartar desde ninguna hasta tantas cartas como queden en el montón, y roba otras tantas. Los descartes y las cartas que quedan en el montón no las ve nadie, salvo cada jugador sus propios descartes.

#### Scenario: El mayor cambia
- **WHEN** el mayor descarta 5 cartas y roba
- **THEN** vuelve a tener 12 cartas y en el montón quedan 3

#### Scenario: El mayor tiene que cambiar
- **WHEN** el mayor no ha descartado ninguna carta
- **THEN** todavía no puede robar

#### Scenario: El menor cambia menos
- **WHEN** el mayor ha cambiado 4 cartas
- **THEN** el menor puede cambiar hasta 4, o ninguna

### Requirement: Declaraciones del Piquet
Tras el cambio, se MUST comparar las manos en tres declaraciones, y en cada una anota solo quien gana; con empate, nadie:
- **El punto:** gana el palo más largo y, a igual largo, el de más valor (el As 11, las figuras 10 y el resto su número). Vale tantos puntos como cartas tiene.
- **La secuencia:** gana la escalera más larga de cartas seguidas del mismo palo, de 3 o más; a igual largo, la de carta más alta. Vale 3 con 3 cartas, 4 con 4, y 10 más que su largo con 5 o más (15, 16, 17 y 18). Quien gana MUST anotar también sus demás secuencias.
- **El conjunto:** gana el conjunto de cuatro cartas iguales del 10 al As (un *catorce*) y, si no, el de tres; a igual tipo, el de cartas más altas. Vale 14 con cuatro y 3 con tres. Quien gana MUST anotar también sus demás conjuntos.

Primero anota el mayor y después el menor. Las combinaciones que ganan se enseñan a los dos jugadores.

#### Scenario: Punto
- **WHEN** el mayor tiene 6 picas y el menor 5 corazones
- **THEN** el mayor anota 6 por el punto

#### Scenario: Punto empatado en largo
- **WHEN** los dos tienen 5 cartas en su palo más largo, y las del mayor suman 47 y las del menor 44
- **THEN** el mayor anota 5

#### Scenario: Secuencias
- **WHEN** el menor tiene una quinta (5 seguidas) y una tercera, y el mayor solo una cuarta
- **THEN** el menor anota 15 por la quinta y 3 por la tercera

#### Scenario: Conjuntos
- **WHEN** el mayor tiene tres Reyes y el menor cuatro dieces
- **THEN** el menor anota 14, y también 3 si tiene además tres Ases

### Requirement: Bazas del Piquet
Sale el mayor. Cada jugador MUST seguir el palo de salida si puede; si no, MAY jugar cualquier carta. No hay triunfo: gana la carta más alta del palo de salida, y el ganador sale en la siguiente baza. Además:
- quien sale en una baza MUST anotar 1;
- quien gana una baza en que salió el otro MUST anotar 1;
- quien gana la última baza MUST anotar 1 más.

Al acabar las 12 bazas, quien ha ganado más MUST anotar 10 (*las cartas*); con 6 y 6, nadie. Quien las ha ganado todas MUST anotar 40 (*capote*) en lugar de 10.

#### Scenario: Seguir el palo
- **WHEN** sale el Rey de corazones y el otro tiene corazones
- **THEN** solo puede jugar corazones

#### Scenario: Puntos de una baza
- **WHEN** el mayor sale con el As de picas y el menor echa el 7 de picas
- **THEN** el mayor anota 1 por salir y nadie más anota en esa baza

#### Scenario: Ganar la salida del otro
- **WHEN** el menor sale con la Q de tréboles y el mayor la gana con el K
- **THEN** el menor anota 1 por salir y el mayor 1 por ganarla

#### Scenario: Capote
- **WHEN** un jugador gana las 12 bazas
- **THEN** anota 40, y no 10

### Requirement: Repique y pique del Piquet
- **Repique:** si un jugador llega a 30 puntos solo con sus declaraciones de la mano, sin que el otro haya anotado ninguna declaración, MUST anotar 60 más.
- **Pique:** si el mayor llega a 30 puntos en la mano, con declaraciones y bazas, antes de que el menor anote nada, y no ha hecho repique, MUST anotar 30 más.

#### Scenario: Repique
- **WHEN** el mayor anota 6 de punto, 15 de quinta y 14 de catorce, y el menor no gana ninguna declaración
- **THEN** el mayor anota 60 más por el repique

#### Scenario: Pique
- **WHEN** el mayor tiene 25 tras las declaraciones, el menor ninguno, y el mayor llega a 30 saliendo en las primeras bazas sin que el menor gane ninguna
- **THEN** el mayor anota 30 más por el pique

### Requirement: Rubber del Piquet
La partida MUST durar 6 manos. Al acabar, gana quien más puntos suma; con empate, la partida queda empatada. El resultado de la partida MUST ser, para el ganador:
- 100 más la diferencia de puntos, si los dos llegan a 100;
- 100 más la suma de los dos, si el que pierde no llega a 100.

#### Scenario: Fin del rubber
- **WHEN** acaba la sexta mano con 140 a 90
- **THEN** gana el de 140, y la partida vale 330 (100 + 140 + 90)

### Requirement: Vista del Piquet
Cada jugador MUST ver:
- su mano y sus propios descartes;
- cuántas cartas tiene el otro y cuántas quedan en el montón;
- cuántas cartas ha cambiado cada uno;
- las declaraciones y las combinaciones que ganan;
- la baza en curso, la última baza y las bazas de cada uno;
- los puntos de la mano y de la partida, y los resultados de las manos anteriores.

Cada jugador MUST NOT ver la mano del otro, sus descartes ni las cartas del montón.

#### Scenario: Mano ajena oculta
- **WHEN** el jugador 0 mira la mesa durante el cambio
- **THEN** ve cuántas cartas tiene el otro y las del montón, pero no cuáles
