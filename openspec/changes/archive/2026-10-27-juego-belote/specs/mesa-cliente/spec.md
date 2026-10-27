## ADDED Requirements

### Requirement: Belote en la suite
El menú MUST incluir el Belote junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; el Belote se juega siempre con 4 en parejas. Como el resto de juegos con IA, el Belote MUST poder jugarse en red.

#### Scenario: Empezar una partida de Belote
- **WHEN** el jugador elige el Belote en el menú y empieza
- **THEN** se abre su mesa con sus 5 cartas, tres rivales (uno de ellos su compañero) y la carta vuelta

### Requirement: Mesa del Belote
La mesa del Belote MUST usar la mesa de bazas común, y mostrar además:
- la carta vuelta mientras se elige el triunfo;
- el triunfo y quién lo eligió;
- los puntos de las bazas de cada pareja en la mano y los puntos de la partida;
- el aviso de «Belote» y «Rebelote» cuando alguien los anuncia.

Mientras se elige el triunfo, en su turno el jugador MUST tener el botón de tomar (en la primera vuelta) o de nombrar cada palo posible (en la segunda), y el de pasar. Al jugar, solo MUST poder elegir las cartas que permiten las reglas.

#### Scenario: Tomar desde la mesa
- **WHEN** en la primera vuelta el jugador pulsa «Tomo»
- **THEN** el triunfo pasa a ser el palo de la carta vuelta y el jugador tiene 8 cartas

#### Scenario: Solo las cartas permitidas
- **WHEN** se sale de un palo que el jugador tiene
- **THEN** solo puede jugar cartas de ese palo

### Requirement: Resumen de la mano y fin del Belote
Al terminar cada mano, la mesa MUST mostrar quién eligió el triunfo, los puntos de cartas, el diez de últimas y el belote de cada pareja, los puntos que se apunta cada una (con el aviso de *dentro* o de *capot*) y los totales, y esperar a que el jugador pulse «Siguiente mano». Al terminar la partida, la pantalla de fin MUST mostrar el último resumen y los puntos de cada pareja.

#### Scenario: Resumen tras una mano
- **WHEN** termina una mano
- **THEN** el resumen muestra los puntos que hizo cada pareja y los que se apunta
