## ADDED Requirements

### Requirement: Treinta y uno en la suite
El menú MUST incluir el Treinta y uno junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el número de jugadores, de 2 a 6 (por defecto, 4), y el nivel de la IA. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Treinta y uno
- **WHEN** el jugador elige el Treinta y uno y empieza con las opciones por defecto
- **THEN** se abre su mesa con su mano de 3 cartas, tres rivales, el mazo y el descarte

### Requirement: Mesa del Treinta y uno
La mesa del Treinta y uno MUST mostrar:
- la mano del jugador y el valor de su mano;
- los rivales con sus cartas boca abajo (y boca arriba las que cogieron del descarte), sus vidas y si se han plantado o están fuera;
- el mazo con su número de cartas y el descarte con su carta de arriba;
- quién se ha plantado y cuántos últimos turnos quedan.

Cuando le toca, el jugador MUST poder:
- robar tocando el mazo o el descarte;
- plantarse con el botón «Plantarse», si puede;
- descartar tocando una carta de su mano.

La mesa MUST caber en 360 × 640 sin scroll horizontal con 6 jugadores.

Al acabar cada ronda, la mesa MUST mostrar las manos de todos con su valor y quién pierde una vida, y esperar a que pulse «Siguiente ronda».

#### Scenario: Robar y descartar
- **WHEN** el jugador toca el mazo y luego una carta de su mano
- **THEN** la carta tocada pasa a ser la de arriba del descarte y le quedan 3 cartas

#### Scenario: Resumen de la ronda
- **WHEN** acaba una ronda
- **THEN** el resumen muestra las manos de todos con su valor y quién pierde una vida

#### Scenario: Fin de la partida
- **WHEN** solo queda un jugador con vidas
- **THEN** sale la pantalla de fin con el ganador y las vidas de cada uno
