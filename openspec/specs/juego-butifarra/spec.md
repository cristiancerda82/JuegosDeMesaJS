# juego-butifarra Specification

## Purpose
TBD - created by archiving change juego-butifarra. Update Purpose after archive.

## Requirements

### Requirement: Baraja, parejas y reparto de la Butifarra
La Butifarra MUST jugarse con la baraja española de 48 cartas y 4 jugadores en dos parejas: los asientos 0 y 2 contra los asientos 1 y 3. En cada mano se MUST repartir toda la baraja, 12 cartas a cada jugador. El reparto pasa al siguiente jugador en cada mano. La primera mano la reparte el asiento 3, así que el asiento 0 es el primero en salir.

#### Scenario: Reparto
- **WHEN** empieza una partida
- **THEN** cada jugador tiene 12 cartas distintas, no queda mazo y reparte el asiento 3

#### Scenario: Rotación del repartidor
- **WHEN** termina una mano repartida por el asiento 3 y la partida sigue
- **THEN** la mano siguiente la reparte el asiento 0

### Requirement: Elección del triunfo
Antes de jugar, el repartidor MUST elegir una de estas opciones:
- uno de los cuatro palos como triunfo;
- «butifarra»: la mano se juega sin triunfo y vale el doble;
- delegar en su compañero.

Si delega, el compañero MUST elegir un palo o butifarra; no puede delegar. La elección MUST ser visible para todos, con quién eligió y si fue delegada.

#### Scenario: Delegar
- **WHEN** el repartidor delega
- **THEN** le toca elegir a su compañero, que puede elegir cualquiera de los cuatro palos o butifarra, pero no delegar

#### Scenario: Butifarra
- **WHEN** el repartidor elige butifarra
- **THEN** la mano se juega sin triunfo y su multiplicador empieza en 2

### Requirement: Contros
Una vez elegido el triunfo, el valor de la mano se MUST poder doblar en tres pasos:
1. **Contro (×2):** lo dice el bando rival del que eligió.
2. **Recontro (×4):** lo dice el bando que eligió, solo si hubo contro.
3. **Sant Vicenç (×8):** lo dice el bando rival, solo si hubo recontro.

En cada paso, los dos jugadores del bando al que le toca deciden por turno, empezando por el más cercano en el orden de juego tras el repartidor. Basta con que uno de los dos lo diga. Si los dos pasan, se acaban los contros y empieza el juego.

El multiplicador de la mano es el de los contros (1, 2, 4 u 8), y el doble si se juega butifarra.

#### Scenario: Contro y recontro
- **WHEN** el asiento 3 reparte y elige oros, el asiento 0 dice contro, el asiento 1 pasa y el asiento 3 dice recontro
- **THEN** los rivales (asientos 0 y 2) pueden decir Sant Vicenç, y si los dos pasan, la mano se juega a ×4

#### Scenario: Butifarra con contro
- **WHEN** se elige butifarra y los rivales dicen contro, pero nadie dice recontro
- **THEN** la mano se juega con multiplicador 4

#### Scenario: Sin contro
- **WHEN** los dos rivales pasan
- **THEN** no hay recontro ni Sant Vicenç y empieza el juego con multiplicador 1, o 2 si es butifarra

### Requirement: Bazas y obligaciones de la Butifarra
Acabados los contros, se MUST jugar las 12 bazas. Sale el siguiente al repartidor y cada baza la abre quien ganó la anterior.

Gana la baza el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida. El orden de cada palo, de mayor a menor, es: 9 (manilla), As, Rey, Caballo, Sota, 8, 7, 6, 5, 4, 3 y 2. Con butifarra no hay triunfo.

Cada jugador MUST cumplir estas obligaciones:
- Seguir el palo de salida si lo tiene y superar con él la carta que va ganando si puede.
- Si no tiene del palo, jugar triunfo y superar el triunfo más alto de la baza si puede.
- Si la baza la va ganando su compañero, MUST seguir el palo si lo tiene, pero no está obligado a superar ni a fallar.
- Sin palo ni triunfo, o con butifarra y sin el palo, puede jugar cualquier carta.

#### Scenario: Superar con el palo
- **WHEN** la salida es el Rey de copas de un rival y el jugador tiene la Sota y el 9 de copas
- **THEN** solo el 9 de copas es una jugada legal

#### Scenario: Fallar
- **WHEN** la salida es de espadas, la va ganando un rival, el jugador no tiene espadas y tiene triunfos
- **THEN** solo puede jugar triunfo, y si alguno supera el triunfo más alto de la baza, solo los que lo superan

#### Scenario: Baza del compañero
- **WHEN** la baza la va ganando el compañero y el jugador no tiene del palo de salida
- **THEN** puede jugar cualquier carta de su mano

#### Scenario: Sin triunfo
- **WHEN** se juega butifarra y un jugador sin el palo de salida juega un 9 de otro palo
- **THEN** ese 9 no gana la baza

### Requirement: Puntuación de la mano de la Butifarra
Al jugarse las 12 bazas, cada bando MUST sumar los puntos de las cartas de sus bazas (manilla 5, As 4, Rey 3, Caballo 2, Sota 1, el resto 0) más 1 punto por cada baza. Entre los dos bandos suman siempre 72.

El bando que pasa de 36 se MUST anotar lo que pasa de 36 multiplicado por el multiplicador de la mano. El otro no se anota nada. Con 36 a 36 no se anota nadie.

El resultado de la mano MUST registrar:
- la elección y quién la hizo;
- el multiplicador;
- los puntos de cada bando;
- lo que se anota cada bando;
- los totales.

#### Scenario: Mano sencilla
- **WHEN** se juega a oros sin contros y un bando hace 46 puntos
- **THEN** ese bando se anota 10 y el otro 0

#### Scenario: Butifarra con contro
- **WHEN** se juega butifarra con contro y el bando que eligió hace 30 puntos
- **THEN** el bando rival, con 42, se anota 6 × 4 = 24

#### Scenario: Empate a 36
- **WHEN** los dos bandos hacen 36 puntos
- **THEN** ninguno se anota nada

### Requirement: Fin de la partida de la Butifarra
La partida MUST terminar al acabar la mano en la que un bando llega al objetivo: 101 puntos por defecto, o 51 o 151 si se configura. Gana ese bando y la puntuación final de cada jugador son los puntos de su bando. Como en cada mano solo se anota un bando, no puede haber empate.

#### Scenario: Llegar a 101
- **WHEN** un bando con 95 puntos se anota 10 en una mano
- **THEN** la partida termina y gana ese bando con 105

### Requirement: Vista del jugador de la Butifarra
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- el repartidor, la fase (elegir, contros o jugar) y a quién le toca;
- la elección del triunfo, quién la hizo y si fue delegada;
- los contros dichos y el multiplicador;
- la baza en curso y la anterior;
- las bazas y los puntos de cartas de cada bando en la mano;
- las bazas ya jugadas en la mano, con quién jugó cada carta (todos las vieron);
- los resultados de las manos anteriores y los totales.

MUST NOT mostrar las cartas en mano de los demás.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás
