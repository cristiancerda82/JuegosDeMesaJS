## ADDED Requirements

### Requirement: Spite and Malice en la suite
El menú MUST incluir el Spite and Malice junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; se juega siempre entre 2. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Spite and Malice
- **WHEN** el jugador elige el Spite and Malice en el menú y empieza
- **THEN** se abre su mesa con su mano de 5 cartas, su montón y el del rival, las escaleras vacías y el mazo

### Requirement: Mesa del Spite and Malice
La mesa del Spite and Malice MUST mostrar:
- arriba, el montón del rival (con su carta de arriba y cuántas le quedan), sus descartes y cuántas cartas tiene en la mano;
- en el centro, el mazo, las 4 escaleras (con su carta de arriba y el valor por el que van) y cuántas cartas hay en las escaleras completas;
- abajo, sus descartes, su montón y su mano.

Para jugar, el jugador MUST tocar primero la carta de origen (de su mano, la de arriba de su montón o la de arriba de un descarte), que queda marcada, y después la escalera de destino o, si la carta es de la mano, uno de sus descartes. Solo MUST poder elegir orígenes y destinos permitidos. La mesa MUST avisar de las jugadas del rival y de quién gana.

#### Scenario: Jugar a una escalera
- **WHEN** el jugador toca un As de su mano y después una escalera libre
- **THEN** la escalera empieza con el As y su mano tiene una carta menos

#### Scenario: Descartar
- **WHEN** el jugador toca una carta de su mano y después uno de sus descartes
- **THEN** la carta queda en ese descarte y le toca al rival

#### Scenario: Fin de la partida
- **WHEN** un jugador vacía su montón
- **THEN** sale la pantalla de fin con el ganador y las cartas que le quedaban a cada uno
