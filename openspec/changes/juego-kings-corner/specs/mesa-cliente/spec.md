## ADDED Requirements

### Requirement: Kings in the Corner en la suite
El menú MUST incluir Kings in the Corner junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA y el número de jugadores (de 2 a 4, por defecto 2). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Kings in the Corner
- **WHEN** el jugador elige Kings in the Corner y empieza
- **THEN** se abre su mesa con la cruz de 4 cartas, las esquinas vacías, el mazo y su mano, ya con la carta robada

### Requirement: Mesa de Kings in the Corner
La mesa de Kings in the Corner MUST mostrar:
- en el centro, el mazo con las cartas que quedan, las 4 pilas laterales en cruz y las 4 esquinas, cada pila con su primera carta y la de arriba a la vista;
- los rivales, con cuántas cartas tienen;
- la mano del jugador.

Para jugar, el jugador MUST tocar una carta de su mano (o una pila lateral, para moverla), que queda marcada, y después la pila de destino. Solo MUST poder elegir destinos permitidos, que se resaltan. Un botón MUST permitir pasar. La mesa MUST avisar de las jugadas de los rivales.

#### Scenario: Jugar una carta
- **WHEN** el jugador toca un 7 rojo de su mano y después una pila con un 8 negro arriba
- **THEN** el 7 queda arriba de esa pila y su mano tiene una carta menos

#### Scenario: Pasar
- **WHEN** el jugador toca el botón de pasar
- **THEN** le toca al siguiente jugador

#### Scenario: Fin de la partida
- **WHEN** un jugador se queda sin cartas
- **THEN** sale la pantalla de fin con el ganador y las cartas que le quedan a cada uno
