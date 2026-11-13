## MODIFIED Requirements

### Requirement: Guía de cada juego
Cada juego de la suite MUST tener una guía "¿Cómo se juega?" pensada para quien nunca lo jugó, que explique el objetivo, el valor de las cartas, cómo se juega una ronda o un movimiento y cómo se hacen las acciones en la mesa. La guía MUST poder abrirse desde las opciones del juego y durante la partida, y MUST poder cerrarse sin afectar a la partida.

La guía de cada juego MUST incluir ejemplos visuales con las cartas del tema elegido por el jugador, al menos uno por juego, en las secciones donde una regla se entiende mejor viéndola. Los ejemplos MUST ser de estos tipos, según lo que pida cada juego:
- **cartas:** una fila de cartas con una etiqueta por carta (su valor o su puesto) y, si procede, un resultado;
- **jugadas:** filas con nombre, ordenadas, como las manos del póker o las combinaciones que se bajan;
- **baza resuelta:** la carta de cada asiento, el palo de salida y el triunfo, con la carta ganadora resaltada y una frase que explica por qué gana;
- **antes y después:** dos estados pequeños de la mesa, con la carta que se mueve, se captura o se roba resaltada.

Lo que un ejemplo afirma MUST cumplir las reglas del juego tal como las aplica el motor: la jugada se llama como dice su etiqueta, la carta resaltada gana la baza, la captura y la combinación son válidas y el movimiento es legal. Cada ejemplo MUST tener una descripción en texto para los lectores de pantalla y MUST verse completo a 360 px de ancho, sin desplazamiento horizontal de la guía.

#### Scenario: Guía del Tute
- **WHEN** el jugador abre la guía desde las opciones del Tute
- **THEN** ve explicados el objetivo, el valor de las cartas, el triunfo, las bazas, los cantes, el tute y las obligaciones de juego

#### Scenario: Consultar la guía en plena partida
- **WHEN** el jugador abre y cierra la guía durante una partida
- **THEN** la partida sigue en el mismo punto

#### Scenario: Las manos del Texas Hold'em
- **WHEN** el jugador abre la guía del Texas Hold'em
- **THEN** ve las nueve manos de mayor a menor, cada una con su nombre y cinco cartas que la forman, desde la escalera de color hasta la carta alta

#### Scenario: Una baza resuelta
- **WHEN** el jugador abre la guía del Whist
- **THEN** ve una baza con la carta de cada asiento, el palo de salida y el triunfo, y la carta que la gana resaltada con la explicación de por qué

#### Scenario: Un movimiento de solitario
- **WHEN** el jugador abre la guía del FreeCell
- **THEN** ve un antes y un después de un movimiento legal, con la carta que se mueve resaltada

#### Scenario: Ejemplo equivocado
- **WHEN** un ejemplo de la guía afirma algo que las reglas del motor no cumplen, como una baza que en realidad gana otra carta
- **THEN** los tests fallan y señalan el juego y el ejemplo

#### Scenario: Guía en un móvil estrecho
- **WHEN** el jugador abre la guía del Bridge en una pantalla de 360 px
- **THEN** ve los ejemplos enteros, con las cartas más pequeñas o en varias líneas, sin desplazarse de lado
