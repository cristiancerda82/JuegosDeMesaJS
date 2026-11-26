## ADDED Requirements

### Requirement: Mesa de bazas sin solapes con muchos jugadores
En los juegos de bazas, con cualquier número de jugadores que admita el juego (hasta 7 en el Oh Hell), la mesa MUST dar a cada rival un sitio propio por encima del jugador. Los rivales van a la derecha, en la fila de arriba (de derecha a izquierda) y a la izquierda, siguiendo el orden de juego. Con 7, MUST haber cuatro rivales en la fila de arriba.

A cualquier ancho desde 360 px, MUST NOT solaparse:
- el nombre ni las cartas de ningún rival con los de otro;
- ningún rival con la mesa del centro, el mazo ni la mano y el nombre del jugador;
- las cartas de la baza entre sí.

Cada carta de la baza MUST ir hacia el lado de quien la echó.

#### Scenario: Oh Hell con 7
- **WHEN** el jugador empieza un Oh Hell con 7 jugadores en un móvil y se hacen las apuestas
- **THEN** ve a los 6 rivales por encima de su mano, sin que se pisen entre ellos ni con la mesa o el mazo

#### Scenario: La baza con 7
- **WHEN** en un Oh Hell con 7 hay varias cartas en la mesa
- **THEN** cada carta está hacia su jugador, ninguna pisa a otra y cada una lleva quién la echó

### Requirement: Autor de cada carta de la baza
Con 3 o más jugadores, cada carta de la baza en curso MUST llevar el nombre de quien la echó, y la última que ha llegado MUST seguir resaltada. Con 5 o más jugadores, un nombre que termina en número (los rivales numerados) MUST abreviarse a su inicial y su número («R3»), para que quepa entero en la carta; el nombre completo MUST seguir disponible en la etiqueta.

#### Scenario: Saber quién echó cada carta
- **WHEN** en un juego de bazas de 4 jugadores hay tres cartas en la mesa
- **THEN** cada una lleva el nombre del rival que la echó

### Requirement: Ver la baza en curso
En los juegos de bazas, mientras haya cartas en la baza en curso, la mesa MUST ofrecer «Ver baza». Al pulsarlo, MUST abrirse un panel con:
- las cartas de la baza en el orden en que se echaron, en grande;
- debajo de cada carta, el nombre completo de quien la echó;
- un botón para cerrarlo.

Ver la baza MUST NOT cambiar el estado del juego, y el panel MUST cerrarse solo al recogerse la baza.

#### Scenario: Ver la baza
- **WHEN** en un Oh Hell con 7 le toca al jugador con cuatro cartas en la mesa y pulsa «Ver baza»
- **THEN** ve las cuatro cartas en orden con el nombre de quien echó cada una, y al cerrar el panel sigue su turno
