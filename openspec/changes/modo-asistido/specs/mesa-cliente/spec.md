## MODIFIED Requirements

### Requirement: Información visible en la mesa
El cliente MUST mostrar solo la información de la vista del jugador. En la Brisca muestra su mano, el dorso de las cartas rivales, la muestra, las cartas que quedan en el mazo, la baza en curso y de quién es el turno. En Klondike muestra los movimientos, el tiempo, y los botones de deshacer y de autocompletar cuando está disponible.

En los juegos que se juegan por vueltas (bazas, o jugadas que tienen que superar a la anterior), la mesa MUST mostrar a la vez todas las cartas jugadas en la vuelta en curso, cada una con su autor reconocible, sin que unas tapen el índice ni el palo de otras. Así el jugador puede ver qué carta va ganando y analizar su jugada. En el Culo y en el Big Two, la mesa MUST mostrar todas las jugadas de la vuelta, desde la que la abrió hasta la última, en orden y con el nombre de quien hizo cada una, no solo la que hay que superar. Cuando la vuelta se cierra (todos pasan o alguien limpia la mesa), sus cartas se retiran.

#### Scenario: Mano rival oculta
- **WHEN** se juega una partida de Brisca
- **THEN** las cartas del rival se ven boca abajo hasta que se juegan

#### Scenario: Vuelta del Culo
- **WHEN** en el Culo un rival abre con una pareja de 5, otro la supera con una pareja de 7 y le toca al jugador
- **THEN** en la mesa se ven la pareja de 5 y la pareja de 7, en orden y con su autor, y está claro que hay que superar la de 7

#### Scenario: Baza de seis jugadores
- **WHEN** en el Julepe con 6 jugadores ya han jugado 5 y le toca al jugador
- **THEN** se ven las 5 cartas jugadas con su índice y su palo legibles

### Requirement: Turnos de la IA
Las jugadas de la IA MUST mostrarse con una pausa y una animación para que el jugador pueda seguirlas. La duración de las pausas MUST depender de la velocidad elegida (requisito «Velocidad de las jugadas»). Mientras juega la IA, el jugador MUST NOT poder hacer acciones de juego, salvo en los juegos con acciones simultáneas en tiempo real, en los que el jugador y la IA actúan a la vez.

La última carta o jugada que ha hecho cada rival (IA o humano en red) en la vuelta en curso MUST quedar marcada en la mesa, con el nombre de quien la jugó, hasta que juega el siguiente. Así se distingue cuál acaba de llegar.

#### Scenario: Jugada de la IA
- **WHEN** es el turno de la IA
- **THEN** su carta se ve salir de su mano hacia la mesa tras una pausa, queda marcada con el nombre de quien la jugó, y el jugador no puede jugar hasta que termine

#### Scenario: Juego simultáneo
- **WHEN** en el Burro la IA está a punto de actuar
- **THEN** el jugador puede actuar igualmente, y vale la acción que llegue antes

## ADDED Requirements

### Requirement: Velocidad de las jugadas
El menú MUST tener una opción general «Velocidad de las jugadas» con tres valores, que vale para todos los juegos con rivales y se guarda en el dispositivo:
- **Rápida:** las pausas de antes de este cambio.
- **Normal** (por defecto): las pausas de la IA antes de jugar y las de fin de baza o de jugada duran aproximadamente el doble que en Rápida.
- **Pausada:** las pausas duran aproximadamente el triple que en Rápida y, en los juegos de bazas, la baza terminada se queda en la mesa hasta que el jugador toca la mesa o pulsa «Seguir».

La velocidad MUST aplicarse a las partidas contra la IA y a las partidas en red, en las que cada cliente muestra con su propio ritmo lo que llega del servidor. MUST NOT cambiar el tiempo de reacción de la IA en los juegos con acciones simultáneas en tiempo real (Burro). Cambiar la velocidad durante una partida MUST tener efecto desde la siguiente jugada. Los solitarios MUST NOT verse afectados.

#### Scenario: Por defecto, más pausado
- **WHEN** un jugador que nunca ha cambiado la velocidad juega una Brisca contra la IA
- **THEN** la IA espera antes de tirar aproximadamente el doble que antes de este cambio

#### Scenario: Pausada en un juego de bazas
- **WHEN** con la velocidad Pausada se completa una baza de Tute
- **THEN** las cuatro cartas se quedan en la mesa hasta que el jugador toca la mesa o pulsa «Seguir», y entonces se recogen

#### Scenario: En red
- **WHEN** con la velocidad Pausada el jugador está en una partida en red de Brisca y el otro humano juega una carta
- **THEN** la carta se muestra con la pausa de la velocidad Pausada en su pantalla, sin cambiar el ritmo de la otra pantalla

### Requirement: Ver la última baza
En los juegos de bazas, una vez retirada la baza, la mesa MUST permitir volver a ver la última baza terminada, con sus cartas, su autor y quién la ganó, hasta que se juega la primera carta de la baza siguiente. Si la spec de un juego prohíbe repasar las bazas, MUST NOT ofrecerse en ese juego. Ver la última baza MUST NOT cambiar el estado del juego.

#### Scenario: Repasar la baza
- **WHEN** en la Brisca se acaba de recoger una baza y el jugador pulsa «Última baza»
- **THEN** ve las cartas de esa baza, quién jugó cada una y quién la ganó, y al cerrarlo la partida sigue igual
