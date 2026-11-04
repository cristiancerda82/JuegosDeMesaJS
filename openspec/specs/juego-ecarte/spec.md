# juego-ecarte Specification

## Purpose
TBD - created by archiving change juego-ecarte. Update Purpose after archive.

## Requirements

### Requirement: Baraja y reparto del Écarté
El Écarté MUST jugarse entre 2 jugadores con la baraja francesa de 32 cartas (del 7 al As). En cada palo, el orden de mayor a menor MUST ser K, Q, J, As, 10, 9, 8, 7.

En cada mano:
- cada jugador MUST recibir 5 cartas;
- la siguiente carta MUST quedar boca arriba (la vuelta): su palo es el triunfo;
- si la vuelta es un rey, el que reparte MUST anotar 1 punto;
- el resto de las cartas forma el montón.

El que no reparte es el mano. El que reparte en la primera mano es el asiento 1, y cambia en cada mano.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 5 cartas, hay una vuelta a la vista y quedan 21 cartas en el montón

#### Scenario: Rey vuelto
- **WHEN** la vuelta es el rey de corazones
- **THEN** el que reparte anota 1 punto y el triunfo es corazones

### Requirement: Cambio de cartas del Écarté
Antes de jugar, el mano MUST elegir entre proponer un cambio o jugar.
- **Si juega:** empiezan las bazas.
- **Si propone:** el que reparte MUST elegir entre aceptar o rehusar.
  - **Si rehúsa:** empiezan las bazas.
  - **Si acepta:**
    - el mano MUST descartarse de 1 a 5 cartas y robar otras tantas del montón;
    - después, el que reparte MUST descartarse de 0 a 5 cartas y robar otras tantas;
    - nadie puede descartarse de más cartas de las que quedan en el montón;
    - acabado el cambio, el mano vuelve a elegir entre proponer y jugar.

Si el montón se acaba, empiezan las bazas.

La vuelta no se roba nunca.

#### Scenario: Cambio aceptado
- **WHEN** el mano propone, el que reparte acepta, el mano se descarta de 3 cartas y el que reparte de 2
- **THEN** los dos siguen con 5 cartas, quedan 16 en el montón y el mano vuelve a elegir

#### Scenario: Cambio rehusado
- **WHEN** el mano propone y el que reparte rehúsa
- **THEN** empiezan las bazas y sale el mano

#### Scenario: Montón agotado
- **WHEN** tras un cambio no queda montón
- **THEN** empiezan las bazas sin preguntar

### Requirement: Jugar de autoridad en el Écarté
Juega de autoridad:
- el mano, si elige jugar la primera vez, sin haber propuesto;
- el que reparte, si rehúsa la primera propuesta.

Si quien jugó de autoridad no hace al menos 3 bazas, el otro MUST anotar 2 puntos por la mano en lugar de 1.

#### Scenario: El mano juega de autoridad y pierde
- **WHEN** el mano juega sin proponer y hace 2 bazas
- **THEN** el que reparte anota 2 puntos

#### Scenario: Rehúsa más tarde
- **WHEN** el que reparte acepta la primera propuesta, rehúsa la segunda y hace 2 bazas
- **THEN** el mano anota 1 punto

### Requirement: Rey de triunfo del Écarté
Quien tiene el rey de triunfo en la mano al jugar su primera carta de las bazas MUST anunciarlo y anotar 1 punto. El anuncio es público.

#### Scenario: Anunciar el rey
- **WHEN** el mano tiene el rey de triunfo y sale a la primera baza
- **THEN** anota 1 punto y los dos ven que lo tiene

### Requirement: Bazas del Écarté
Sale el mano a la primera baza y, después, el que gana cada baza.

El que responde MUST:
- seguir el palo de salida si tiene y, si puede, ganar la baza con una carta más alta de ese palo;
- si no tiene el palo, fallar con un triunfo si tiene;
- si no, echar cualquier carta.

Gana la baza la carta más alta del palo de salida, o el triunfo si se falló.

#### Scenario: Obligación de ganar
- **WHEN** sale una J de picas y el otro tiene la Q y el 8 de picas
- **THEN** solo puede echar la Q

#### Scenario: Obligación de fallar
- **WHEN** sale un 9 de picas, el otro no tiene picas y tiene un triunfo
- **THEN** tiene que echar un triunfo

### Requirement: Puntos de la mano del Écarté
Al acabar las 5 bazas, quien hace 3 o 4 MUST anotar 1 punto, o 2 si el otro jugó de autoridad. Quien hace las 5 (vole) MUST anotar 2.

#### Scenario: Vole
- **WHEN** un jugador hace las 5 bazas
- **THEN** anota 2 puntos

### Requirement: Partida del Écarté
En cuanto un jugador llega a 5 puntos (por la mano, por un rey vuelto o por uno anunciado), la partida MUST terminar y gana ese jugador. Si no, se reparte otra mano y reparte el otro.

#### Scenario: Fin por el rey
- **WHEN** un jugador con 4 puntos anuncia el rey de triunfo
- **THEN** la partida termina y gana con 5

### Requirement: Vista del Écarté
Cada jugador MUST ver:
- su mano y las cartas de las que se ha descartado;
- cuántas cartas tiene el otro y de cuántas se ha descartado;
- la vuelta y cuántas cartas quedan en el montón;
- las propuestas y respuestas de la mano, y quién juega de autoridad;
- quién anunció el rey;
- la baza en curso, la última baza y cuántas bazas lleva cada uno;
- los resultados de las manos anteriores y los puntos de la partida.

Los descartes del otro y el montón MUST quedar ocultos.

#### Scenario: Descartes ajenos ocultos
- **WHEN** el que reparte se ha descartado de 2 cartas
- **THEN** el mano ve que son 2, pero no cuáles
