## ADDED Requirements

### Requirement: Euchre en la suite
El menú MUST incluir el Euchre junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Euchre se juega siempre con 4 en parejas. Como el resto de juegos con IA, el Euchre MUST poder jugarse en red.

#### Scenario: Empezar una partida de Euchre
- **WHEN** el jugador elige el Euchre en el menú y empieza
- **THEN** se abre su mesa con sus 5 cartas, tres rivales (uno de ellos su compañero) y la carta vuelta

### Requirement: Mesa del Euchre
La mesa del Euchre MUST usar la mesa de bazas común, y mostrar además:
- la carta vuelta mientras se elige el triunfo;
- el triunfo, quién lo eligió y si juega solo;
- las bazas de cada pareja y los puntos de la partida.

Mientras se elige el triunfo, en su turno el jugador MUST tener los botones de pedir (en la primera vuelta) o de nombrar cada palo posible (en la segunda), cada uno también para jugar solo, y el de pasar. Como repartidor, tras pedirse el triunfo, MUST descartarse tocando una carta de su mano y después la mesa.

#### Scenario: Pedir desde la mesa
- **WHEN** en la primera vuelta el jugador pulsa «Pedir»
- **THEN** el triunfo pasa a ser el palo de la carta vuelta

#### Scenario: Descartarse como repartidor
- **WHEN** el jugador reparte, alguien pide el triunfo y él toca una carta y la mesa
- **THEN** esa carta sale de su mano y vuelve a tener 5

### Requirement: Resumen de la mano y fin del Euchre
Al terminar cada mano, la mesa MUST mostrar quién eligió el triunfo, las bazas de cada pareja, los puntos que se ganan (con el aviso de *euchre* si la pareja que eligió no llegó a 3) y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de cada pareja.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra las bazas de cada pareja y los puntos que ganó cada una
