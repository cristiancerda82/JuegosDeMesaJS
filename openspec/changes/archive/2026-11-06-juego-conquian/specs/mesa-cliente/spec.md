## ADDED Requirements

### Requirement: Conquián en la suite
El menú MUST incluir el Conquián junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA. La partida es siempre al mejor de 5 manos. Como el resto de juegos con IA, MUST poder jugarse en red con 2 jugadores.

#### Scenario: Empezar una partida de Conquián
- **WHEN** el jugador elige el Conquián y empieza
- **THEN** se abre su mesa con su mano de 10 cartas, el mazo y la carta descubierta

### Requirement: Mesa del Conquián
La mesa del Conquián MUST mostrar:
- la mano del jugador boca arriba, que se puede ordenar por palos o por números, y la del rival boca abajo;
- las combinaciones bajadas de cada uno, y cuántas cartas lleva bajadas;
- la carta descubierta, marcando si viene del mazo o del descarte y a quién se ofrece;
- el mazo con su número de cartas y la última carta muerta;
- las manos ganadas por cada uno.

Cuando se le ofrece la carta, el jugador MUST poder:
- **bajar:** elegir cartas de su mano y pulsar «Bajar», que forma una combinación nueva con la carta descubierta; si la elección no forma combinación, el botón está desactivado;
- **añadir:** con las cartas elegidas (o ninguna), tocar una de sus combinaciones para añadirle la carta descubierta;
- **pasar:** pulsar «Pasar».

Para descartar, MUST elegir una carta y pulsar «Descartar», o tocarla dos veces.

La mesa MUST caber en 360 × 640 sin scroll horizontal.

Al acabar cada mano, la mesa MUST mostrar quién la ganó (o que fue tablas) y las manos ganadas por cada uno, y esperar a que pulse «Siguiente mano».

#### Scenario: Bajar con la carta descubierta
- **WHEN** se le ofrece el 5 de bastos, elige el 5 de oros y el 5 de copas y pulsa «Bajar»
- **THEN** el grupo de cincos aparece en su lado de la mesa y le toca descartar

#### Scenario: Fin de la partida
- **WHEN** un jugador gana su tercera mano
- **THEN** sale la pantalla de fin con el ganador y las manos ganadas por cada uno
