## ADDED Requirements

### Requirement: Guiñote en la suite
El menú MUST incluir el Guiñote junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores (2, o 4 en parejas), el cambio del 7 de triunfo, si hay que montar sobre el compañero y los puntos de la partida.

#### Scenario: Empezar una partida de Guiñote
- **WHEN** el jugador elige el Guiñote en el menú, ajusta las opciones y empieza
- **THEN** se abre la mesa del Guiñote con la configuración elegida

### Requirement: Mesa del Guiñote
La mesa del Guiñote MUST reutilizar la mesa de bazas: mano propia, asientos rivales, mazo con la muestra y baza en curso. Cuando cantar o cambiar el 7 sea una acción legal, la mesa MUST ofrecerlo con un control que diga qué se hace (por ejemplo, "Cantar las 40 en oros"). Cada cante, propio o de la IA, MUST anunciarse mostrando quién canta, qué palo, cuántos puntos y el rey y la sota de ese palo. La mesa MUST mantener visibles la lista de cantes de la mano, los puntos acumulados de cada bando con la meta de la partida, y un aviso de que se está en el arrastre cuando se agota el mazo.

#### Scenario: Cante de la IA
- **WHEN** la IA canta las 20 en espadas
- **THEN** la mesa muestra un aviso con el cante y el rey y la sota de espadas, y el cante queda en la lista de cantes de la mano

#### Scenario: Empieza el arrastre
- **WHEN** se roba la muestra y se agota el mazo
- **THEN** la mesa indica que se está en el arrastre y solo deja jugar las cartas que obligan las reglas

### Requirement: Resumen de la mano de Guiñote
Al terminar cada mano del Guiñote, la mesa MUST mostrar los puntos de cada bando en bazas, cantes y 10 de últimas, el total de la mano y los acumulados de la partida. Si la partida sigue, MUST indicar que se juega de vueltas y esperar a que el jugador pulse "Siguiente mano" antes de repartir.

#### Scenario: Ir de vueltas
- **WHEN** termina la primera mano y ningún bando llega a 101
- **THEN** el jugador ve el resumen de la mano con los acumulados y el aviso de que se juega de vueltas, y la partida espera a que pulse "Siguiente mano"
