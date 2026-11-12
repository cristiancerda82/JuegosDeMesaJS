## ADDED Requirements

### Requirement: Baraja, valores y reparto del Hand and Foot
El Hand and Foot MUST jugarse entre 4 jugadores en parejas (los asientos 0 y 2 contra 1 y 3) con 5 barajas francesas de 52 cartas y sus 2 comodines cada una (270 cartas).

Las cartas MUST valer: el comodín 50 puntos; el 2 y el As 20; del 8 al K 10; del 4 al 7 y el 3 negro 5; el 3 rojo 0 (puntúa aparte). Los doses y los comodines MUST ser comodines; las demás cartas, salvo los treses, son naturales.

En cada ronda MUST repartirse 11 cartas de mano y 11 de pie a cada jugador; el pie queda boca abajo hasta que su jugador lo coge. Una carta boca arriba empieza el descarte; si es un comodín o un 3 rojo, se tapa con otra. Reparte el asiento 3 en la primera ronda y después el siguiente; empieza el siguiente al que reparte.

#### Scenario: Reparto
- **WHEN** empieza una ronda
- **THEN** cada jugador tiene 11 cartas en la mano y 11 en el pie, y el descarte tiene una carta que no es un comodín ni un 3 rojo

#### Scenario: Valor de las cartas
- **WHEN** se suman un comodín, un 2, un As, un K, un 7 y un 3 negro
- **THEN** valen 110 puntos

### Requirement: Treses rojos del Hand and Foot
Un 3 rojo MUST ponerse en la mesa de su pareja en cuanto el jugador lo tiene (al repartir, al robar, al coger el descarte o al coger el pie), y MUST robarse otra carta del mazo por cada uno, mientras quede. Cada 3 rojo vale 100 puntos para su pareja.

#### Scenario: 3 rojo al robar
- **WHEN** un jugador roba un 3 rojo
- **THEN** el 3 rojo pasa a la mesa de su pareja y el jugador roba otra carta

### Requirement: Turno y robo del Hand and Foot
En su turno, el jugador MUST robar 2 cartas del mazo o coger el descarte; después MAY bajar y añadir cartas, y MUST terminar descartando una carta (salvo si cierra bajándolo todo).

Coger el descarte MUST estar permitido solo si la pareja del jugador ya ha hecho su primera bajada en la ronda, la carta de arriba no es un comodín ni un 3 negro, y el jugador tiene dos naturales de su valor. La carta de arriba y esos dos naturales MUST formar una combinación nueva de la pareja (o completar una suya sin terminar de ese valor, si la tiene), y las 6 cartas siguientes del descarte (o las que haya) MUST pasar a su mano.

Si al jugador le toca robar y en el mazo quedan menos de 2 cartas, MAY coger el descarte si puede; si no, la ronda MUST terminar.

#### Scenario: Robar dos
- **WHEN** un jugador roba del mazo
- **THEN** recibe 2 cartas

#### Scenario: Coger el descarte
- **WHEN** la pareja del jugador ya ha bajado, arriba del descarte hay un 9 y el jugador tiene dos nueves
- **THEN** puede coger el descarte: los tres nueves forman una combinación y las 6 cartas siguientes del descarte van a su mano

#### Scenario: Descarte bloqueado
- **WHEN** arriba del descarte hay un 3 negro o un comodín
- **THEN** nadie puede coger el descarte

#### Scenario: Sin primera bajada no se coge el descarte
- **WHEN** la pareja del jugador no ha bajado en la ronda
- **THEN** no puede coger el descarte aunque tenga dos naturales del valor de arriba

### Requirement: Combinaciones y libros del Hand and Foot
Una combinación MUST tener de 3 a 7 cartas y ser:
- del mismo valor natural (del 4 al As), con al menos 2 naturales y como mucho 3 comodines;
- o solo de comodines (doses y comodines).

Los treses MUST NOT formar combinaciones. Una pareja MUST NOT tener dos combinaciones sin terminar del mismo valor (ni dos de comodines sin terminar). Con 7 cartas la combinación es un libro y MUST NOT admitir más cartas; después la pareja puede empezar otra de ese valor.

Un libro MUST ser limpio si no tiene comodines, sucio si los tiene, y de comodines si solo tiene comodines.

#### Scenario: Libro sucio
- **WHEN** una pareja tiene una combinación de cinco sietes y un 2 y le añade un comodín
- **THEN** la combinación es un libro sucio de 7 cartas y no admite más

#### Scenario: Demasiados comodines
- **WHEN** un jugador intenta bajar dos reyes y tres comodines y un 2
- **THEN** no es una combinación válida

#### Scenario: Otra combinación del mismo valor
- **WHEN** una pareja tiene un libro de nueves y otra combinación de nueves sin terminar
- **THEN** no puede empezar una tercera de nueves hasta terminar la segunda

### Requirement: Primera bajada del Hand and Foot
En cada ronda, la primera bajada de cada pareja MUST hacerse en un solo turno y sumar, con los puntos de las cartas bajadas, al menos 50 en la primera ronda, 90 en la segunda, 120 en la tercera y 150 en la cuarta. Mientras no llega al mínimo, el jugador MUST poder deshacer lo bajado en ese turno, y MUST NOT poder descartar.

#### Scenario: No llega al mínimo
- **WHEN** en la primera ronda un jugador cuya pareja no ha bajado baja tres cincos (15 puntos)
- **THEN** no puede descartar hasta bajar más o deshacerlo

#### Scenario: Mínimo de la cuarta ronda
- **WHEN** empieza la cuarta ronda
- **THEN** la primera bajada de cada pareja tiene que sumar al menos 150

### Requirement: El pie y cerrar en el Hand and Foot
Cuando un jugador se queda sin cartas en la mano, MUST coger su pie:
- si se quedó sin cartas bajando, sigue su turno con el pie;
- si se quedó sin cartas al descartar, el turno pasa y juega el pie en su siguiente turno.

Un jugador que juega su pie MUST poder quedarse sin cartas (bajándolas todas o descartando la última) solo si su pareja tiene al menos 2 libros limpios y 2 sucios; un libro de comodines cuenta como limpio. Si no, MUST NOT quedarse sin cartas: al bajar o coger el descarte le tienen que quedar al menos 2, para descartar una y quedarse con otra. Quedarse sin cartas así es cerrar, y la ronda termina.

#### Scenario: Coger el pie bajando
- **WHEN** un jugador con su mano baja todas sus cartas
- **THEN** coge su pie y sigue su turno

#### Scenario: Coger el pie al descartar
- **WHEN** un jugador con su mano descarta su última carta
- **THEN** coge su pie y el turno pasa al siguiente

#### Scenario: Sin los libros no se cierra
- **WHEN** un jugador juega su pie, su pareja tiene 1 libro limpio y 2 sucios, y tiene tres sietes y un 9
- **THEN** no puede bajar los tres sietes, porque se quedaría con una sola carta

#### Scenario: Cerrar
- **WHEN** la pareja tiene 2 libros limpios y 2 sucios y el jugador, con su pie, descarta su última carta
- **THEN** cierra y la ronda termina

### Requirement: Puntuación, rondas y partida del Hand and Foot
Al terminar una ronda, cada pareja MUST sumar:
- los puntos de las cartas de sus combinaciones;
- 500 por libro limpio, 300 por libro sucio y 1500 por libro de comodines;
- 100 por cada 3 rojo;
- 100 si cerró uno de sus jugadores;

y MUST restar los puntos de las cartas que quedan en las manos de sus jugadores y en los pies que no han cogido.

La partida MUST durar 4 rondas. Gana la pareja con más puntos; si tienen los mismos, empatan.

#### Scenario: Puntos de una ronda
- **WHEN** una pareja termina con un libro limpio de sietes, un 3 rojo y un 9 en la mano de un jugador, y cerró el otro jugador
- **THEN** suma 35 + 500 + 100 + 100 − 10 = 725 puntos

#### Scenario: Pie sin coger
- **WHEN** la ronda termina y un jugador no ha cogido su pie
- **THEN** los puntos de las cartas de su pie se restan a su pareja

#### Scenario: Fin de la partida
- **WHEN** termina la cuarta ronda
- **THEN** la partida acaba y gana la pareja con más puntos

### Requirement: Vista del jugador en el Hand and Foot
La vista de cada jugador MUST mostrar su mano (o su pie, si ya lo cogió), si cada jugador juega aún su mano o ya su pie, cuántas cartas tiene cada uno en la mano y en el pie, cuántas quedan en el mazo, el descarte entero, las cartas que cada uno cogió del descarte y aún tiene, las combinaciones y los treses rojos de cada pareja, si cada pareja ha hecho su primera bajada, el mínimo de la ronda, los puntos y el resumen de las rondas acabadas.

La vista MUST NOT mostrar las cartas de las manos ajenas, de ningún pie sin coger, ni del mazo.

#### Scenario: Sin cartas ajenas
- **WHEN** un jugador pide su vista
- **THEN** ve sus cartas, y de los demás solo cuántas tienen en la mano y en el pie
