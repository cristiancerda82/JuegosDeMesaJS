## ADDED Requirements

### Requirement: Tute subastado en la suite
El menú MUST incluir el Tute subastado junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- el número de manos: 4, 8 (por defecto) o 12;
- el nivel de la IA.

Siempre se juega con 4 jugadores. Como el resto de juegos con IA, el Tute subastado MUST poder jugarse en red.

#### Scenario: Empezar una partida de Tute subastado
- **WHEN** el jugador elige el Tute subastado en el menú y empieza
- **THEN** se abre su mesa con 10 cartas en la mano, tres rivales de la IA y la subasta en marcha

### Requirement: Mesa del Tute subastado
La mesa del Tute subastado MUST usar la mesa de bazas de 4 y mostrar además:
- la puja vigente y quién la hizo, y quién ha pasado;
- cuando hay pujador, el triunfo y los puntos que lleva el pujador frente a lo que pujó;
- los cantes de la mano;
- las fichas de cada jugador;
- el número de la mano.

Según la fase:
- **Subasta:** en su turno, el jugador ve «Paso» y las pujas que puede hacer, de la mínima a la máxima, sin scroll horizontal en 360 × 640.
- **Triunfo:** si es el pujador, elige el palo con cuatro botones.
- **Bazas:** juega sus cartas como en el Tute, con las no jugables apagadas, y ve los botones de cantar cuando puede.

#### Scenario: Pujar desde la mesa
- **WHEN** le toca hablar al jugador, nadie ha pujado y pulsa «60»
- **THEN** la mesa muestra que la puja vigente es 60 y es suya

#### Scenario: Elegir el triunfo desde la mesa
- **WHEN** el jugador gana la subasta y pulsa «Copas»
- **THEN** el triunfo es copas y le toca salir

### Requirement: Resumen de la mano del Tute subastado
Al terminar cada mano, la mesa MUST mostrar:
- el pujador, su puja y el triunfo;
- los puntos del pujador y los de los defensores, y si hubo tute;
- si el pujador cumplió;
- lo que ganó o perdió cada jugador y sus fichas tras la mano.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por fichas.

#### Scenario: Fin de una mano de Tute subastado
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve si el pujador cumplió y las fichas de cada uno, y la partida espera a que pulse «Siguiente mano»
