## ADDED Requirements

### Requirement: Cuatrola en la suite
El menú MUST incluir la Cuatrola junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir:
- el número de manos: 4, 8 (por defecto) o 12;
- el nivel de la IA.

Siempre se juega con 4 jugadores. Como el resto de juegos con IA, la Cuatrola MUST poder jugarse en red.

#### Scenario: Empezar una partida de Cuatrola
- **WHEN** el jugador elige la Cuatrola en el menú y empieza
- **THEN** se abre su mesa con 10 cartas en la mano, tres rivales de la IA y la subasta en marcha

### Requirement: Mesa de la Cuatrola
La mesa de la Cuatrola MUST usar la mesa de bazas de 4 y mostrar además:
- lo que ha dicho cada jugador en la subasta;
- cuando hay jugador, su modalidad, el triunfo y la carta llamada;
- el compañero, en cuanto se descubre (y al propio jugador, si tiene la carta llamada);
- las bazas que llevan el jugador con su compañero y los defensores;
- las fichas de cada jugador;
- el número de la mano.

Según la fase:
- **Subasta:** en su turno, el jugador ve «Paso» y las modalidades que puede pujar, «Con rey» y «Solo».
- **Triunfo:** si es el jugador, elige el palo con cuatro botones y, si juega con rey, la carta que llama.
- **Bazas:** juega sus cartas con las no jugables apagadas.

#### Scenario: Pujar con rey y llamar
- **WHEN** el jugador puja «Con rey», gana la subasta, elige oros y llama el Rey de copas
- **THEN** la mesa muestra el triunfo de oros y el Rey de copas llamado

#### Scenario: Saber que eres el compañero
- **WHEN** un rival juega con rey y llama un rey que tiene el jugador
- **THEN** la mesa le indica que es el compañero

### Requirement: Resumen de la mano de Cuatrola
Al terminar cada mano, la mesa MUST mostrar:
- el jugador, la modalidad, el triunfo, la carta llamada y el compañero;
- las bazas de cada bando, si ganó el jugador y si hubo bola;
- lo que ganó o perdió cada jugador y sus fichas tras la mano.

La mesa MUST esperar a que el jugador pulse «Siguiente mano». La pantalla de fin MUST mostrar la clasificación por fichas.

#### Scenario: Fin de una mano de Cuatrola
- **WHEN** se juega la última baza de una mano
- **THEN** el jugador ve si el jugador ganó y las fichas de cada uno, y la partida espera a que pulse «Siguiente mano»
