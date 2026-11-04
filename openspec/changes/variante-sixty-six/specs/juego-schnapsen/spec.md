## ADDED Requirements

### Requirement: Variante Sixty-six del Schnapsen
El Schnapsen MUST admitir la variante Sixty-six. Con ella, las reglas del Schnapsen MUST cambiar así:
- **Baraja:** la francesa de 24 cartas: As, 10, K, Q, J y 9 de cada palo. El 9 MUST ser la carta más baja de su palo y valer 0 puntos.
- **Reparto:** el repartidor MUST dar 6 cartas a cada jugador. Tras la carta vuelta quedan 11 cartas boca abajo en el mazo.
- **Cambio:** la carta que se puede cambiar por la carta vuelta MUST ser el 9 del triunfo, en lugar de la J.
- **Diez de últimas:** si el mazo se agotó sin cerrarse, quien gana la última baza MUST sumar 10 puntos a su mano. Si con ellos llega a 66, gana la mano por llegar a 66.

Todo lo demás (cantes, cerrar el mazo, la obligación de seguir y fallar, el fin de la mano, los puntos de partida y la partida a 7) MUST ser igual que en el Schnapsen. Sin la variante, el juego MUST seguir siendo el Schnapsen de 20 cartas.

#### Scenario: Reparto del Sixty-six
- **WHEN** empieza una mano del Sixty-six
- **THEN** cada jugador tiene 6 cartas, hay una carta vuelta a la vista y quedan 11 en el mazo

#### Scenario: Cambiar el 9
- **WHEN** en el Sixty-six la carta vuelta es el As de corazones y el jugador que sale tiene el 9 de corazones
- **THEN** puede cambiarlo: se queda el As de corazones y el 9 queda boca arriba bajo el mazo

#### Scenario: La J no se cambia en el Sixty-six
- **WHEN** en el Sixty-six el jugador que sale tiene la J del triunfo y no el 9
- **THEN** no puede cambiar la carta vuelta

#### Scenario: Diez de últimas
- **WHEN** en el Sixty-six, con el mazo agotado sin cerrar, un jugador con 50 puntos gana la última baza con 6 puntos de cartas
- **THEN** suma 66 y gana la mano por llegar a 66
