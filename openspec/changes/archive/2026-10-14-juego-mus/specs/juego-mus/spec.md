## ADDED Requirements

### Requirement: Mesa y reparto
La partida MUST jugarse con la baraja española de 40 cartas y 4 jugadores en dos parejas: los asientos 0 y 2 contra 1 y 3. En cada mano se MUST repartir 4 cartas a cada jugador. La mano MUST ser el jugador siguiente al que reparte: habla primero en todas las rondas y gana los empates. El reparto MUST pasar al siguiente jugador en cada mano.

#### Scenario: Primera mano
- **WHEN** empieza una partida
- **THEN** cada jugador tiene 4 cartas, reparte el asiento 3 y el asiento 0 es mano

### Requirement: Ocho reyes
Con la opción de ocho reyes (por defecto), los treses MUST contar como reyes y los doses como ases en todos los lances. Con la opción de cuatro reyes, cada carta cuenta por lo que es.

#### Scenario: El tres es rey
- **WHEN** con ocho reyes un jugador tiene el 3 de oros y el Rey de copas
- **THEN** tiene pareja de reyes

### Requirement: Mus y descartes
Antes de los lances, empezando por la mano, cada jugador MUST decidir si pide mus o lo corta. En cuanto un jugador corta, MUST empezar el lance de Grande. Si los cuatro piden mus, cada jugador, empezando por la mano, MUST descartar entre 1 y 4 cartas y recibir otras tantas del mazo, y se vuelve a preguntar el mus. Si el mazo no tiene cartas suficientes, se MUST barajar los descartes para formar un mazo nuevo. Los descartes MUST NOT ser visibles, pero sí cuántas cartas descartó cada uno.

#### Scenario: Todos piden mus
- **WHEN** los cuatro jugadores piden mus y la mano descarta 3 cartas
- **THEN** la mano vuelve a tener 4 cartas, 3 de ellas nuevas, y descarta el siguiente

#### Scenario: Cortar el mus
- **WHEN** el primer jugador pide mus y el segundo lo corta
- **THEN** empieza el lance de Grande, hablando primero la mano

### Requirement: Jugadas de cada lance
La fuerza de las cartas MUST ser, de mayor a menor: Rey, Caballo, Sota, 7, 6, 5, 4 y As (con ocho reyes, el 3 es Rey y el 2 es As).
- **Grande:** gana la jugada con las cartas más altas, comparando de la más alta a la más baja.
- **Chica:** gana la jugada con las cartas más bajas, comparando de la más baja a la más alta.
- **Pares:** una pareja (dos cartas iguales) pierde con unas medias (tres iguales), que pierden con unos duples (dos parejas o cuatro iguales). Entre jugadas del mismo tipo gana la de cartas más altas.
- **Juego:** se suman las cartas: las figuras (y con ocho reyes el 3) valen 10, el As (y el 2) vale 1 y las demás su número. Hay juego con 31 o más, y el orden es 31, 32, 40, 37, 36, 35, 34 y 33.
- **Punto:** si nadie tiene juego, se juega al Punto y gana la suma más alta.

En cualquier lance, el empate lo MUST ganar el jugador más cercano a la mano en el orden de juego.

#### Scenario: Grande
- **WHEN** un jugador tiene Rey, Rey, 7, 4 y otro Rey, Caballo, Caballo, Sota
- **THEN** a Grande gana el primero

#### Scenario: Chica
- **WHEN** un jugador tiene As, As, 4, Rey y otro As, 4, 5, 6
- **THEN** a Chica gana el primero

#### Scenario: Duples ganan a medias
- **WHEN** un jugador tiene 4, 4, 5, 5 y otro Rey, Rey, Rey, 7
- **THEN** a Pares gana el primero

#### Scenario: La 31 es el mejor juego
- **WHEN** un jugador tiene 31 y otro 40, con ocho reyes
- **THEN** a Juego gana el de 31

#### Scenario: Empate a favor de la mano
- **WHEN** dos jugadores de distinta pareja tienen exactamente la misma jugada a Grande
- **THEN** gana el que está más cerca de la mano

### Requirement: Declaración de Pares y Juego
Antes de apostar a Pares, y antes de apostar a Juego, se MUST hacer público qué jugadores tienen pares y cuáles tienen juego. Solo apuestan en el lance los jugadores que tienen la jugada.
- Si ninguna pareja la tiene, el lance no se juega.
- Si solo una pareja la tiene, el lance no se apuesta y esa pareja cobra sus jugadas en el conteo.
- Si nadie tiene juego, se juega el Punto entre todos.

#### Scenario: Solo una pareja tiene pares
- **WHEN** en el lance de Pares solo los asientos 0 y 2 tienen pares
- **THEN** no hay apuestas de Pares y en el conteo la pareja 0-2 cobra sus pares

#### Scenario: Nadie tiene juego
- **WHEN** ningún jugador llega a 31
- **THEN** se juega el lance de Punto y apuestan los cuatro

### Requirement: Apuestas de un lance
En cada lance que se apuesta, los jugadores que participan MUST hablar por turno desde la mano. Mientras no haya envite, cada uno puede pasar, envidar 2 o 5 piedras, o echar un órdago. Ante un envite, MUST contestar primero el rival que sigue en el orden al que envidó y, si no lo quiere, su compañero, si participa en el lance. Para contestar se puede querer, no querer, subir 2 o 5 piedras más, o echar un órdago. Una subida o un órdago se contesta igual, por la otra pareja.
- **Todos pasan:** el lance queda en paso.
- **Se quiere el envite:** la apuesta queda aceptada y la cobra en el conteo la pareja que gana el lance.
- **Ninguno de la pareja lo quiere:** la pareja que envidó cobra en el conteo lo que había aceptado antes del último envite, o 1 piedra si no había nada.

#### Scenario: Envite no querido
- **WHEN** a Grande la mano envida 2 y ninguno de los rivales lo quiere
- **THEN** el lance se cierra y la pareja de la mano cobra 1 piedra en el conteo

#### Scenario: Subida no querida
- **WHEN** un jugador envida 2, un rival sube 5 más y la pareja del primero no lo quiere
- **THEN** la pareja que subió cobra 2 piedras en el conteo

#### Scenario: Contesta el compañero
- **WHEN** un jugador envida y el rival siguiente no lo quiere
- **THEN** contesta su compañero, que puede quererlo

#### Scenario: Envite querido
- **WHEN** un jugador envida 2, un rival sube 5 más y la pareja del primero lo quiere
- **THEN** el lance tiene 7 piedras aceptadas, que cobra en el conteo la pareja que gane el lance

### Requirement: Órdago
Un órdago querido MUST resolverse en el acto: se comparan las jugadas de ese lance y la pareja que gana se lleva el juego en curso, sin contar el resto de la mano. Un órdago no querido MUST tratarse como un envite no querido.

#### Scenario: Órdago a Grande
- **WHEN** a Grande un jugador echa un órdago y un rival lo quiere
- **THEN** la mano termina, se enseñan las cartas y la pareja con la mejor Grande gana el juego

### Requirement: Conteo
Al terminar los lances, se MUST enseñar las cartas de todos y apuntar las piedras de cada lance en orden: Grande, Chica, Pares y Juego o Punto.
- **Grande y Chica:** la apuesta aceptada, o 1 piedra si quedaron en paso, para la pareja que gana el lance. Si el envite no se quiso, lo que corresponde a la pareja que envidó.
- **Pares:** además de la apuesta, la pareja que gana cobra 1 por cada pareja, 2 por cada medias y 3 por cada duples de sus dos jugadores.
- **Juego:** además de la apuesta, la pareja que gana cobra 3 por cada 31 y 2 por cada otro juego de sus dos jugadores.
- **Punto:** además de la apuesta, la pareja que gana cobra 1.

En cuanto una pareja llega a los puntos del juego, MUST ganar el juego y no se cuenta el resto.

#### Scenario: Conteo de Pares
- **WHEN** gana Pares la pareja 1-3, con medias el asiento 1 y pareja el asiento 3, y el lance quedó en paso
- **THEN** la pareja 1-3 cobra 3 piedras por Pares

#### Scenario: Llegar al final del juego
- **WHEN** a una pareja le faltan 2 piedras para ganar el juego y cobra 3 a Grande
- **THEN** gana el juego aunque la otra pareja ganara más piedras en los lances siguientes

### Requirement: Juegos y partida
Cada juego MUST ganarlo la primera pareja que llega a 40 piedras (opción: 30). Al terminar un juego, las piedras vuelven a 0 y se sigue con la mano siguiente. La partida la MUST ganar la pareja que gana antes 1 juego, 2 de 3 (por defecto) o 3 de 5.

#### Scenario: Ganar la partida
- **WHEN** se juega al mejor de 3 y una pareja gana su segundo juego
- **THEN** la partida termina y ganan los dos jugadores de esa pareja

### Requirement: Vista del jugador
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- quién reparte y quién es mano;
- la fase (mus, descarte o lances), el lance en curso y quién habla;
- quién pidió mus y cuántas cartas descartó cada uno;
- quién tiene pares y juego, una vez declarados;
- las apuestas de cada lance y el envite pendiente;
- las piedras y los juegos de cada pareja;
- el resultado de las manos anteriores, con las cartas de todos.

MUST NOT mostrar las cartas en mano de los demás durante la mano, ni los descartes, ni el mazo.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador durante los lances
- **THEN** no contiene ninguna carta de la mano de los demás jugadores
