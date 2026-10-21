## ADDED Requirements

### Requirement: Reparto del Mentiroso
El Mentiroso MUST jugarse con una baraja francesa de 52 cartas y de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta. Se MUST repartir todas las cartas una a una empezando por el asiento 0, así que los primeros asientos pueden tener una carta más. El montón empieza vacío.

#### Scenario: Reparto con 5 jugadores
- **WHEN** empieza una partida de 5 jugadores
- **THEN** los asientos 0 y 1 tienen 11 cartas, los demás 10, y el montón está vacío

### Requirement: Valor declarado y bajada
El valor que se declara MUST ir en orden: As, 2, 3… hasta K, y vuelta al As, avanzando uno en cada turno de bajar. Empieza el asiento 0, con los Ases. En su turno, el jugador MUST bajar boca abajo al montón de 1 a 4 cartas de su mano y declara que son todas del valor que toca; las cartas pueden ser de cualquier valor. Para bajar, el jugador MUST marcar una a una las cartas (y puede desmarcarlas) y después bajar las marcadas; las marcas solo las ve él. La bajada, con quién la hizo, cuántas cartas son y el valor declarado, MUST ser pública; las cartas, no.

#### Scenario: Bajar dos cartas
- **WHEN** le toca al asiento 0, con los Ases, y baja dos cartas
- **THEN** el montón tiene 2 cartas, todos ven «2 Ases del asiento 0» y le toca al asiento 1, que declarará doses

#### Scenario: Entre 1 y 4
- **WHEN** un jugador intenta bajar 5 cartas, o ninguna
- **THEN** no es una acción legal

### Requirement: Desconfiar
Tras cada bajada, el siguiente jugador MUST decidir antes de bajar si dice «¡Mentiroso!». Bajar sus cartas es creer la bajada anterior. Al desconfiar, se MUST descubrir las cartas de la última bajada a todos:
- si alguna no es del valor declarado, el que bajó se lleva todo el montón a su mano;
- si todas son de ese valor, se lo lleva quien desconfió.

El montón queda vacío. Después le toca bajar al que desconfió, con el valor siguiente al de la bajada desmentida o confirmada.

#### Scenario: Pillar una mentira
- **WHEN** el asiento 1 declaró 3 doses, una de las cartas es un 9, y el asiento 2 dice «¡Mentiroso!»
- **THEN** todos ven las tres cartas, el asiento 1 se lleva el montón entero y le toca bajar al asiento 2, con los treses

#### Scenario: Desconfiar de la verdad
- **WHEN** el asiento 1 declaró 2 doses, los dos son doses, y el asiento 2 dice «¡Mentiroso!»
- **THEN** el asiento 2 se lleva el montón entero y le toca bajar a él

#### Scenario: Sin bajada no se desconfía
- **WHEN** el montón está vacío al empezar o justo después de un «¡Mentiroso!»
- **THEN** desconfiar no es una acción legal

### Requirement: Victoria en el Mentiroso
Cuando un jugador baja sus últimas cartas, el siguiente MUST elegir entre creerle o desconfiar; no puede bajar. Si le cree, o si desconfía y la bajada era verdad, el que se quedó sin cartas gana y la partida termina (el que desconfió se lleva el montón igualmente). Si desconfía y era mentira, el que bajó se lleva el montón y la partida sigue.

El resultado MUST registrar el ganador y las cartas que le quedaron a cada uno de los demás. Los demás pierden.

#### Scenario: Quedarse sin cartas diciendo la verdad
- **WHEN** el asiento 3 baja sus 2 últimas cartas, son del valor declarado, y el asiento 0 le cree
- **THEN** la partida termina y gana el asiento 3

#### Scenario: Pillado con la última bajada
- **WHEN** el asiento 3 baja su última carta mintiendo y el asiento 0 dice «¡Mentiroso!»
- **THEN** el asiento 3 se lleva el montón y la partida sigue

### Requirement: Vista del jugador en el Mentiroso
Cada jugador MUST ver:
- su mano;
- cuántas cartas tienen los demás;
- cuántas cartas hay en el montón;
- el valor que toca declarar;
- la última bajada (quién, cuántas y qué valor), y el historial de bajadas desde el último «¡Mentiroso!»;
- las cartas descubiertas en cada «¡Mentiroso!», con quién bajó, quién desconfió y quién se llevó el montón;
- las cartas que él mismo ha bajado al montón y siguen en él, porque las recuerda.

Las demás cartas del montón MUST quedar ocultas.

#### Scenario: El montón no se ve
- **WHEN** un jugador pide su vista con cartas en el montón que bajaron otros
- **THEN** ve cuántas hay en total y las que bajó él, pero no las de los demás
