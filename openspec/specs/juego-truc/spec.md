# juego-truc Specification

## Purpose
TBD - created by archiving change juego-truc. Update Purpose after archive.

## Requirements

### Requirement: Baraja, jugadores y reparto del Truc
El Truc MUST jugarse con la baraja española de 40 cartas, con 2 jugadores o con 4 en parejas (los asientos 0 y 2 contra los 1 y 3). En cada mano se MUST repartir 3 cartas a cada jugador. El reparto pasa al siguiente jugador en cada mano y es **mano** el siguiente al repartidor, que sale en la primera baza. La primera mano la reparte el último asiento, así que el asiento 0 es mano.

#### Scenario: Reparto
- **WHEN** empieza una partida de 4 jugadores
- **THEN** cada jugador tiene 3 cartas distintas, reparte el asiento 3 y le toca al asiento 0

### Requirement: Jerarquía de las cartas del Truc
Las cartas MUST ordenarse, de mayor a menor:

| Puesto | Cartas |
|---|---|
| 1 | As de espadas |
| 2 | As de bastos |
| 3 | 7 de espadas |
| 4 | 7 de oros |
| 5 | Treses |
| 6 | Doses |
| 7 | Ases de copas y de oros |
| 8 | Reyes |
| 9 | Caballos |
| 10 | Sotas |
| 11 | 7 de copas y de bastos |
| 12 | Seises |
| 13 | Cincos |
| 14 | Cuatros |

No hay triunfo ni obligación de seguir el palo: se puede jugar cualquier carta. Cartas del mismo puesto empatan.

#### Scenario: El As de espadas gana a todo
- **WHEN** en una baza se juegan el As de espadas y un 3
- **THEN** gana el As de espadas

#### Scenario: Cartas iguales
- **WHEN** en una baza de 2 jugadores se juegan el 3 de copas y el 3 de oros
- **THEN** la baza es parda

### Requirement: Bazas y ganador de la mano del Truc
Cada baza la gana la carta más alta. Si las más altas de los dos bandos empatan, la baza es **parda**. Quien gana una baza sale en la siguiente; tras una parda, sale el mismo jugador que salió en ella.

La mano MUST ganarla el bando que gana dos bazas, con estas reglas para las pardas:
- Si la primera baza es parda, gana la mano quien gane la segunda. Si la segunda también es parda, decide la tercera.
- Si un bando ganó la primera y la segunda es parda, gana ese bando.
- Si la tercera es parda, gana quien ganó la primera.
- Si las tres son pardas, gana el bando de la mano.

La mano termina en cuanto se conoce su ganador, aunque queden cartas por jugar.

#### Scenario: Dos bazas seguidas
- **WHEN** un bando gana la primera y la segunda baza
- **THEN** gana la mano sin jugar la tercera

#### Scenario: Parda en la primera
- **WHEN** la primera baza es parda y el rival gana la segunda
- **THEN** el rival gana la mano

#### Scenario: Todo pardo
- **WHEN** las tres bazas son pardas
- **THEN** gana la mano el bando del jugador que es mano

### Requirement: Envit
El envit es una apuesta sobre los puntos de envit de cada jugador:
- Con dos o tres cartas del mismo palo, valen 20 más los valores de las dos más altas de ese palo.
- Si no, valen el valor de su carta más alta.
- El valor de cada carta es su número, con la Sota, el Caballo y el Rey a 0.

Un jugador MUST poder envidar en su turno durante la primera baza, mientras no haya jugado su carta, si en la mano todavía no se ha envidado. Responde el primer rival en orden de juego tras quien envidó, que puede decir:
- **vull** (acepta);
- **no vull**;
- **torne** (sube el envit a 4);
- **falta**: vale lo que le falta para cerrar la came al bando que va ganando la came; con empate, lo que les falta a los dos.

A un torne se puede responder vull, no vull o falta; a la falta, vull o no vull. Quien no quiere da al que apostó el valor de la apuesta anterior: 1 si no quiere el envit, 2 si no quiere el torne, y 4 si no quiere una falta que siguió a un torne.

Al aceptar, se comparan los puntos de envit del mejor jugador de cada bando. Gana el más alto; con empate, el más cercano a la mano en orden de juego. Esos valores se muestran a todos y el ganador cobra el valor aceptado al terminar la mano. Después sigue jugando quien tenía el turno.

#### Scenario: Puntos de envit
- **WHEN** un jugador tiene el 7 y el 5 de oros y el Rey de copas
- **THEN** sus puntos de envit son 32

#### Scenario: Sin dos del mismo palo
- **WHEN** un jugador tiene el 6 de oros, el 4 de copas y la Sota de bastos
- **THEN** sus puntos de envit son 6

#### Scenario: No vull
- **WHEN** un jugador envida y el rival no quiere
- **THEN** el que envidó cobra 1 piedra al terminar la mano

#### Scenario: Envit solo en la primera baza
- **WHEN** ya se ha jugado la primera baza
- **THEN** nadie puede envidar

#### Scenario: Empate en el envit
- **WHEN** se acepta un envit y los dos bandos tienen 31
- **THEN** lo gana el bando del jugador más cercano a la mano

### Requirement: Truc
Un jugador MUST poder trucar en su turno, antes de jugar su carta. El truc hace que la mano valga 2 piedras. Responde el primer rival en orden de juego tras quien apostó, que puede decir:
- **vull** (acepta);
- **no vull**: el bando que apostó gana la mano y cobra el valor anterior (1);
- **subir**: retruc (3), quatre val (4) o joc fora. Con el joc fora, quien gana la mano gana la came entera.

Tras aceptar una apuesta, solo el bando que la aceptó puede subirla, en su turno. Quien no quiere una subida da al que la hizo el valor anterior: 2 al retruc, 3 al quatre val y 4 al joc fora. Sin ningún truc aceptado, la mano vale 1 piedra.

**El envit va primero:** si se truca durante la primera baza y todavía se puede envidar, el que responde puede envidar en lugar de responder al truc. Primero se resuelve el envit y después responde al truc.

#### Scenario: Truc aceptado
- **WHEN** un jugador truca, el rival dice vull y luego gana la mano el bando que trucó
- **THEN** ese bando cobra 2 piedras de truc

#### Scenario: Retruc no querido
- **WHEN** un jugador truca, el rival responde retruc y el primero no quiere
- **THEN** el bando que retrucó gana la mano y cobra 2 piedras

#### Scenario: Solo sube quien aceptó
- **WHEN** un bando acepta el truc del otro
- **THEN** en su turno puede retrucar, y el bando que trucó no puede subir hasta que acepte una subida

#### Scenario: Envit ante un truc
- **WHEN** en la primera baza un jugador truca y el rival, que aún no ha jugado su carta, envida
- **THEN** primero se responde al envit y después el rival responde al truc

### Requirement: Retirarse
En su turno, y también cuando le toca responder a una apuesta, un jugador MUST poder irse de la mano («me'n vaig»). El bando rival gana la mano y cobra lo que valga en ese momento:
- el valor anterior de la apuesta pendiente si lo hay;
- si no, el truc aceptado;
- si no, 1.

El envit ya aceptado o rechazado se cobra igualmente.

#### Scenario: Irse sin apuestas
- **WHEN** un jugador se va de la mano sin que nadie haya trucado
- **THEN** el bando rival cobra 1 piedra

### Requirement: Puntuación y cames
Al terminar la mano, se MUST sumar primero el envit al bando que lo ganó y, si con eso no cierra la came, el truc al ganador de la mano.

La came la gana el primer bando que llega a 12 piedras, o el ganador de un joc fora. Al cerrarse una came, las piedras de los dos bandos vuelven a 0.

La partida la gana el primer bando que gana las cames configuradas: 2 por defecto (gana dos de tres) o 1. La puntuación final de cada jugador son las cames de su bando.

El resultado de cada mano MUST registrar:
- el envit (nivel, aceptado o no, puntos de cada bando y ganador);
- el truc (nivel aceptado y ganador de la mano);
- las piedras de cada bando en la mano y tras ella;
- si se cerró una came.

#### Scenario: Cerrar la came con el envit
- **WHEN** un bando con 11 piedras gana un envit de 2 y pierde la mano trucada
- **THEN** ese bando gana la came y el truc de esa mano no se suma

#### Scenario: Joc fora
- **WHEN** se acepta un joc fora
- **THEN** el bando que gana la mano gana la came

#### Scenario: Partida a dos cames
- **WHEN** un bando gana su segunda came
- **THEN** la partida termina y gana ese bando

### Requirement: Vista del jugador del Truc
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- el repartidor, quién es mano y a quién le toca;
- la baza en curso y las bazas jugadas con quién jugó cada carta y su ganador o si fue parda;
- el estado del envit y del truc: lo apostado, lo pendiente, quién puede subir y, si se aceptó el envit, los puntos de cada bando y el ganador;
- las piedras de la came, las cames ganadas y los resultados de las manos anteriores.

MUST NOT mostrar las cartas en mano de los demás.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador
- **THEN** no contiene ninguna carta de la mano de los demás
