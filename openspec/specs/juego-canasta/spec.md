# juego-canasta Specification

## Purpose
TBD - created by archiving change juego-canasta. Update Purpose after archive.

## Requirements

### Requirement: Baraja, parejas y reparto de la Canasta
La Canasta MUST jugarse con 4 jugadores en dos parejas (0 y 2 contra 1 y 3) y 108 cartas: dos barajas francesas y 4 comodines (jokers). En cada mano, el repartidor MUST dar 11 cartas a cada jugador. Después, se descubre la primera carta del mazo para empezar el pozo; si es un joker, un 2 o un 3 rojo, se tapa con la siguiente, hasta que salga otra, y el pozo queda congelado. Empieza el jugador a la izquierda del repartidor, y el repartidor rota cada mano.

#### Scenario: Reparto
- **WHEN** empieza una partida
- **THEN** cada jugador tiene 11 cartas (sin contar los treses rojos, que ya se han bajado y repuesto), el pozo tiene al menos una carta y el mazo el resto

#### Scenario: Comodín al descubrir el pozo
- **WHEN** la primera carta del pozo es un 2
- **THEN** se tapa con la siguiente, el pozo tiene dos cartas y está congelado

### Requirement: Comodines, treses y valor de las cartas
Los jokers y los doses MUST ser comodines. Las cartas MUST valer:
- joker 50;
- 2 y As 20;
- del 8 al rey 10;
- del 4 al 7, y el 3 negro, 5.

Un 3 rojo MUST bajarse solo en cuanto llega a la mano, al repartir, al robar o al llevarse el pozo; el jugador roba otra carta del mazo en su lugar (al llevarse el pozo, no). Al final de la mano, cada 3 rojo MUST valer 100 para su pareja (los cuatro, 800), a favor si la pareja ha bajado alguna combinación y en contra si no.

Un 3 negro descartado MUST tapar el pozo: el siguiente jugador no se lo puede llevar. Los treses negros solo MUST poder bajarse al cerrar, en una combinación de 3 o 4 treses negros sin comodines.

#### Scenario: Robar un 3 rojo
- **WHEN** un jugador roba un 3 rojo del mazo
- **THEN** el 3 rojo queda bajado delante de su pareja y el jugador tiene otra carta del mazo en su lugar

#### Scenario: Treses rojos sin bajar
- **WHEN** termina una mano y una pareja que tiene dos treses rojos no ha bajado ninguna combinación
- **THEN** los treses rojos le restan 200

### Requirement: Turno de la Canasta
En su turno, el jugador MUST primero robar una carta del mazo o llevarse el pozo. Después, MAY bajar combinaciones nuevas y añadir cartas a las de su pareja, en el orden que quiera. Por último, MUST descartar una carta en el pozo, salvo que cierre sin descartar. Al elegir las cartas, los palos no cuentan: una jugada se define por el valor y el número de naturales y por cuántos jokers y doses lleva; de las cartas de ese valor, se bajan las primeras de la mano.

#### Scenario: Robar y descartar
- **WHEN** un jugador roba del mazo y descarta un 9
- **THEN** su mano sigue con 11 cartas, el 9 queda arriba del pozo y le toca al siguiente

### Requirement: Combinaciones de la Canasta
Una combinación MUST tener 3 o más cartas del mismo valor (del 4 al As), con al menos dos naturales y como mucho tres comodines. Las combinaciones son de la pareja: cualquiera de los dos MAY añadirles cartas, naturales del mismo valor o comodines, sin pasar de tres comodines. Cada pareja MUST tener como mucho una combinación de cada valor.

Una combinación de 7 cartas o más MUST ser una canasta: limpia si no tiene comodines (500) y sucia si tiene (300). Añadir un comodín a una canasta limpia la vuelve sucia.

#### Scenario: Combinación con comodín
- **WHEN** un jugador de una pareja que ya ha bajado baja dos reyes y un joker
- **THEN** la pareja tiene una combinación de reyes de 3 cartas

#### Scenario: Demasiados comodines
- **WHEN** un jugador intenta bajar dos sietes y cuatro comodines, o un siete y dos comodines
- **THEN** no es una acción legal

#### Scenario: Canasta limpia
- **WHEN** una pareja tiene 6 dieces naturales bajados y un jugador añade otro diez
- **THEN** esa combinación es una canasta limpia

### Requirement: Primera bajada de la Canasta
La primera vez que una pareja baja en cada mano, las combinaciones de ese turno MUST sumar en valor de cartas al menos un mínimo, según los puntos de la pareja al empezar la mano:
- 15 si va en negativo;
- 50 de 0 a 1.495;
- 90 de 1.500 a 2.995;
- 120 desde 3.000.

Mientras no llegue al mínimo, el jugador MUST poder deshacer lo que ha bajado en el turno, salvo la carta del pozo y las que bajó con ella, y no MAY descartar. Si se ha llevado el pozo para su primera bajada, solo MUST contar la carta de arriba del pozo y cartas de su mano: hasta llegar al mínimo no puede bajar las otras cartas que se llevó del pozo. Solo MAY llevarse el pozo si con la carta de arriba y su mano puede llegar al mínimo.

#### Scenario: No llega al mínimo
- **WHEN** una pareja con 0 puntos no ha bajado, y su jugador baja tres cincos (15 puntos)
- **THEN** no puede descartar hasta bajar más, o deshace los tres cincos y vuelven a su mano

#### Scenario: Llega con 90
- **WHEN** una pareja con 1.600 puntos baja por primera vez tres ases y tres reyes (90 puntos)
- **THEN** la bajada es válida y el jugador puede descartar

### Requirement: El pozo de la Canasta
El pozo MUST estar:
- **tapado** si la carta de arriba es un 3 negro o un comodín: nadie se lo puede llevar;
- **congelado para todos** mientras contenga algún comodín (descartado, o al descubrir el pozo);
- **congelado para una pareja** que aún no ha bajado en la mano.

Congelado, el jugador solo MAY llevárselo con dos naturales de su mano del valor de la carta de arriba, y MAY añadirles comodines. Si no está congelado para él, también MAY llevárselo con un natural y uno o más comodines de su mano, o si la carta de arriba se puede añadir a una combinación de su pareja.

Al llevarse el pozo, la carta de arriba MUST bajarse en ese momento con las cartas que la acompañan, en una combinación nueva o añadida a la de su valor, y el resto del pozo pasa a su mano. Un comodín descartado congela el pozo, y queda descongelado al llevárselo alguien.

#### Scenario: Pozo congelado
- **WHEN** el pozo contiene un comodín, arriba hay un 8, y el jugador tiene un 8 y un joker en la mano
- **THEN** no se lo puede llevar

#### Scenario: Llevarse el pozo con la pareja
- **WHEN** arriba del pozo hay un 8, el jugador tiene dos ochos y su pareja ya ha bajado
- **THEN** se lo puede llevar: la pareja tiene una combinación de tres ochos y el resto del pozo pasa a su mano

#### Scenario: Llevarse el pozo con una combinación
- **WHEN** el pozo no está congelado, arriba hay una reina, y la pareja del jugador tiene bajada una combinación de reinas
- **THEN** se lo puede llevar sin poner cartas de su mano: la reina se añade a esa combinación

#### Scenario: Tres negro arriba
- **WHEN** el jugador anterior ha descartado un 3 negro
- **THEN** el jugador no se puede llevar el pozo y tiene que robar del mazo

### Requirement: Cerrar y fin de la mano de la Canasta
Un jugador MUST cerrar la mano al quedarse sin cartas, al bajar o al descartar. Solo MAY hacerlo si su pareja tiene al menos una canasta. Por eso, sin canasta, no MAY bajar ni añadir si con ello se quedaría con menos de dos cartas en la mano. Cerrar MUST valer 100.

Si al tener que robar el mazo está vacío, el jugador MAY llevarse el pozo si puede; si no puede o no quiere, la mano termina sin que nadie cierre. Si la última carta del mazo es un 3 rojo, la mano termina en cuanto se baja.

#### Scenario: Cerrar con canasta
- **WHEN** la pareja de un jugador tiene una canasta, y él baja todas sus cartas menos una y la descarta
- **THEN** la mano termina y su pareja gana 100 por cerrar

#### Scenario: Sin canasta no se cierra
- **WHEN** la pareja de un jugador no tiene ninguna canasta y él tiene 3 cartas, tres sietes
- **THEN** no puede bajar los tres sietes

#### Scenario: Se acaba el mazo
- **WHEN** el mazo está vacío, le toca robar a un jugador y no se puede llevar el pozo
- **THEN** la mano termina sin cierre

### Requirement: Puntuación y fin de la partida de la Canasta
Al terminar cada mano, cada pareja MUST sumar:
- el valor de las cartas de sus combinaciones;
- 500 por cada canasta limpia y 300 por cada sucia;
- sus treses rojos (en positivo o en negativo, según si ha bajado);
- 100 si uno de los dos cerró.

Y MUST restar el valor de las cartas que se quedan en la mano de los dos. El resultado MUST registrar el desglose de cada pareja.

La partida MUST terminar al final de la mano en que una pareja llega a 5.000 puntos o más. Gana la que más tiene; si empatan, se juega otra mano.

#### Scenario: Desglose de una mano
- **WHEN** una pareja termina con 180 en cartas bajadas, una canasta sucia, un 3 rojo, ha cerrado, y les quedan 25 puntos en la mano
- **THEN** suma 180 + 300 + 100 + 100 − 25 = 655

#### Scenario: Llegar a 5.000
- **WHEN** al terminar una mano una pareja tiene 5.120 y la otra 4.300
- **THEN** la partida termina y gana la primera

### Requirement: Vista del jugador en la Canasta
Cada jugador MUST ver:
- su mano;
- cuántas cartas tienen los demás, y cuántas quedan en el mazo;
- todo el pozo, en orden, y si está congelado o tapado;
- las combinaciones y los treses rojos de cada pareja;
- las cartas que cada jugador se llevó del pozo y aún tiene en la mano;
- el mínimo de la primera bajada de cada pareja, los puntos y lo que va bajando el jugador en turno;
- el resultado de las manos anteriores.

Las manos ajenas y el mazo MUST quedar ocultos.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** ve su mano y el pozo entero, pero no las cartas de las manos ajenas que no salieron del pozo, ni las del mazo
