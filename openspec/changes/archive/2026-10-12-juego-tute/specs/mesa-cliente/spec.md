## ADDED Requirements

### Requirement: Tute en la suite
El menú MUST incluir el Tute junto a Klondike y la Brisca. Sus opciones MUST permitir elegir el número de jugadores (2 o 4 en parejas), el cambio del 7 de triunfo, si hay que montar sobre el compañero y el número de manos, antes de empezar.

#### Scenario: Empezar una partida de Tute
- **WHEN** el jugador elige el Tute en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Tute con la configuración elegida

### Requirement: Cantar desde la mesa
Cuando cantar o cantar el tute sea una acción legal, la mesa MUST ofrecerla con un control que diga qué se canta (por ejemplo, "Cantar las 40 en oros"). Cada cante, propio o de la IA, MUST anunciarse a todos los jugadores mostrando quién canta, qué palo y cuántos puntos, y la mesa MUST mantener visible la lista de cantes de la mano.

#### Scenario: Cante de la IA
- **WHEN** la IA canta las 20 en espadas
- **THEN** la mesa muestra un aviso con el cante y el rey y el caballo de espadas, y el cante queda en la lista de cantes de la mano

### Requirement: Manos grandes en pantallas pequeñas
La mano propia MUST caber completa, con hasta 10 cartas, desde 360 px de ancho y sin scroll horizontal. Si hace falta, las cartas se solapan, pero el índice de cada una (valor y palo) MUST quedar a la vista y cada carta MUST poder elegirse con el dedo.

#### Scenario: Diez cartas en 360 px
- **WHEN** empieza una partida de Tute de 4 jugadores en una pantalla de 360 × 640 px
- **THEN** las 10 cartas de la mano se ven sin scroll horizontal y se identifica el valor y el palo de cada una

### Requirement: Guía de cada juego
Cada juego de la suite MUST tener una guía "¿Cómo se juega?" pensada para quien nunca lo jugó, que explique el objetivo, el valor de las cartas, cómo se juega una ronda o un movimiento y cómo se hacen las acciones en la mesa. La guía MUST poder abrirse desde las opciones del juego y durante la partida, y MUST poder cerrarse sin afectar a la partida.

#### Scenario: Guía del Tute
- **WHEN** el jugador abre la guía desde las opciones del Tute
- **THEN** ve explicados el objetivo, el valor de las cartas, el triunfo, las bazas, los cantes, el tute y las obligaciones de juego

#### Scenario: Consultar la guía en plena partida
- **WHEN** el jugador abre y cierra la guía durante una partida
- **THEN** la partida sigue en el mismo punto
