## ADDED Requirements

### Requirement: Chinchón en la suite
El menú MUST incluir el Chinchón junto al resto de juegos. Sus opciones MUST permitir elegir el número de jugadores (2, 3 o 4), la baraja (40 o 48 cartas), si hay comodines, el límite de eliminación y el valor máximo de la carta suelta para cerrar, antes de empezar.

#### Scenario: Empezar una partida de Chinchón
- **WHEN** el jugador elige el Chinchón en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Chinchón con la configuración elegida

### Requirement: Robar, descartar y cerrar en la mesa
En la mesa del Chinchón el jugador MUST poder robar tocando o arrastrando desde el mazo o desde la carta de arriba del descarte, y descartar arrastrando una carta al descarte o eligiéndola y pulsando "Descartar". Cuando cerrar sea legal con la carta elegida, MUST poder hacerlo con un botón "Cerrar". La mesa MUST indicar en qué fase está el jugador (robar o descartar) y de quién es el turno, y mostrar qué carta roba y descarta cada rival.

#### Scenario: Turno completo desde la mesa
- **WHEN** el jugador toca el mazo y después arrastra una carta de su mano al descarte
- **THEN** roba una carta, la descartada queda arriba del descarte y el turno pasa al siguiente

#### Scenario: Cerrar desde la mesa
- **WHEN** el jugador elige una carta con la que puede cerrar
- **THEN** el botón "Cerrar" está disponible y, al pulsarlo, termina la mano

### Requirement: Ordenar la mano y ver sus combinaciones
La mano propia del Chinchón MUST mostrar marcadas sus combinaciones según la mejor agrupación y las cartas sin ligar, con los puntos que sumarían. El jugador MUST poder ordenar la mano por combinaciones, por palo o por valor.

#### Scenario: Ver combinaciones
- **WHEN** el jugador tiene en la mano un trío y una escalera
- **THEN** la mesa los muestra agrupados y marcados, y separa las cartas sin ligar con sus puntos

### Requirement: Resultado de la mano de Chinchón
Al terminar cada mano del Chinchón, la mesa MUST mostrar quién cerró, las manos destapadas de todos los jugadores con sus combinaciones y sus cartas sin ligar, los puntos de la mano y los acumulados de cada jugador, y quién queda eliminado, antes de que se reparta la siguiente mano.

#### Scenario: Fin de una mano de Chinchón
- **WHEN** un rival cierra la mano
- **THEN** el jugador ve las manos de todos agrupadas, los puntos de cada uno y los totales, y la partida espera a que pulse "Siguiente mano"
