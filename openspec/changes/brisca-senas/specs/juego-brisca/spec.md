## ADDED Requirements

### Requirement: Señas entre compañeros
La configuración MUST ofrecer las señas, desactivadas por defecto. Solo cuentan con 4 jugadores: con 2, el motor MUST ignorar la opción. Una partida creada sin la opción, o guardada antes de que existiera, MUST jugarse como hasta ahora.

Con las señas, la vista de cada jugador MUST incluir las señas de su compañero:
- las cartas del palo de triunfo con puntos (As, Tres, Rey, Caballo y Sota) que tiene en la mano en ese momento, de la más fuerte a la más débil;
- si no tiene ninguna carta del palo de triunfo.

Las señas MUST estar al día en cada vista: después de robar, después de cambiar la muestra y al empezar cada mano. La vista de los rivales y la de un espectador MUST NOT incluir señas. Las reglas de las bazas, el robo, el cambio de la muestra, el arrastre y la puntuación MUST NOT cambiar.

#### Scenario: Las señas del compañero
- **WHEN** con señas y 4 jugadores, el compañero del jugador tiene el As y el 4 de triunfo y una carta de otro palo
- **THEN** la vista del jugador incluye como señas el As de triunfo, y no dice que no tenga triunfo

#### Scenario: Sin triunfo
- **WHEN** con señas, el compañero no tiene ninguna carta del palo de triunfo
- **THEN** la vista del jugador dice que su compañero no tiene triunfo y no incluye ninguna carta

#### Scenario: Los rivales no ven las señas
- **WHEN** con señas, se mira la vista de un rival o la de un espectador
- **THEN** no incluye las señas de nadie

#### Scenario: Las señas después de robar
- **WHEN** con señas, el compañero roba el Tres de triunfo al terminar una baza
- **THEN** la siguiente vista del jugador incluye el Tres de triunfo entre las señas

#### Scenario: Con dos jugadores no hay señas
- **WHEN** se crea una partida de 2 jugadores con la opción de señas
- **THEN** la partida se juega sin señas
