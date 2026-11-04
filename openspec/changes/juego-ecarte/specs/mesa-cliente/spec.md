## ADDED Requirements

### Requirement: Écarté en la suite
El menú MUST incluir el Écarté junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA; la partida es siempre a 5. Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Écarté
- **WHEN** el jugador elige el Écarté y empieza
- **THEN** se abre su mesa con su mano de 5 cartas, la vuelta y el montón

### Requirement: Mesa del Écarté
La mesa del Écarté MUST mostrar:
- la mano del jugador y la del rival boca abajo;
- la vuelta con el triunfo y el montón;
- las bazas de cada uno, la baza en curso y los puntos de la partida;
- quién juega de autoridad y quién anunció el rey.

En el cambio, la mesa MUST mostrar los botones que tocan:
- «Proponer» y «Jugar» al mano;
- «Aceptar» y «Rehusar» al que reparte.

Para descartarse, el jugador MUST tocar las cartas de su mano que quiere cambiar y luego «Cambiar».

Al acabar cada mano, la mesa MUST mostrar un resumen con las bazas de cada uno, el rey, quién jugó de autoridad y los puntos de la mano y de la partida.

#### Scenario: Proponer y cambiar
- **WHEN** el jugador es mano, propone, la IA acepta y él marca 2 cartas y toca «Cambiar»
- **THEN** sigue con 5 cartas, dos de ellas nuevas

#### Scenario: Resumen de la mano
- **WHEN** acaba una mano
- **THEN** el resumen muestra las bazas de cada uno y los puntos que anota cada uno

#### Scenario: Fin de la partida
- **WHEN** un jugador llega a 5
- **THEN** sale la pantalla de fin con el ganador y los puntos de cada uno
