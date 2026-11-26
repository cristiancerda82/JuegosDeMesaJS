## ADDED Requirements

### Requirement: Burro de bazas en la suite
El menú MUST incluir el Burro de bazas junto al resto de juegos. Antes de empezar, sus opciones MUST permitir elegir el nivel de la IA, el modo asistido, el número de jugadores (de 3 a 6) y el límite de la partida (3 o 5 penalizaciones). Como el resto de juegos con IA, MUST poder jugarse en red.

#### Scenario: Empezar una partida de Burro de bazas
- **WHEN** el jugador elige el Burro de bazas con 4 jugadores y empieza
- **THEN** se abre su mesa con sus 4 cartas, los tres rivales y el mazo con 32 cartas

### Requirement: Mesa del Burro de bazas
La mesa del Burro de bazas MUST mostrar:
- la mano del jugador, ordenada por palos y del Rey al As, y las de los rivales boca abajo;
- cuántas cartas quedan en el mazo;
- la baza en curso y a quién le toca;
- junto a cada jugador:
  - quién reparte;
  - quién se ha quedado sin cartas;
  - quién ha robado en la baza (y cuántas) o ha pasado;
  - sus penalizaciones;
- las penalizaciones del jugador y el límite.

Si al jugador le toca y no tiene el palo de salida, la mesa MUST decírselo y ofrecerle «Robar» o, sin mazo, «Pasar».

Al terminar cada mano, la mesa MUST mostrar un resumen con:
- quién es el burro y cuántas cartas le quedaban, o que no lo hubo;
- el orden en que se quedaron sin cartas;
- las penalizaciones de cada uno.

La pantalla de fin MUST mostrar el resumen de la última mano y las penalizaciones de cada jugador.

#### Scenario: Robar sin el palo
- **WHEN** le toca al jugador, no tiene el palo de salida y queda mazo
- **THEN** la mesa le dice que no tiene el palo y, al tocar «Robar», roba hasta sacar una carta de ese palo y la echa

#### Scenario: Resumen de la mano
- **WHEN** termina una mano
- **THEN** sale el resumen con el burro y las penalizaciones, y con «Siguiente mano» empieza la siguiente

## MODIFIED Requirements

### Requirement: Historia, consejos y variantes regionales en la guía
La guía de cada juego de la suite MUST terminar con un apartado «Un poco de historia», que MUST aparecer plegado al abrir la guía y MUST poder desplegarse y volver a plegarse.

El apartado MUST tener un párrafo corto sobre el origen del juego y de su nombre, en las palabras de la suite y sin copiar el texto de ningún libro. Un dato que no sea seguro MUST presentarse como tal (por ejemplo, «se cree que…»). El apartado MUST verse completo a 360 px de ancho sin desplazamiento horizontal.

La sección «Consejos» MUST incluir, además de los que ya tiene, los consejos de estrategia de los libros clásicos para estos juegos:
- **Tute:** no arrastrar contra el As de triunfo; buscar primero el cante que falta; arrastrar cuando el compañero ha enseñado el As de triunfo.
- **Brisca:** llevar la cuenta de los puntos que han salido.
- **Burro:** fijarse en lo que piden y en lo que pasan los demás.
- **Mus:** cuándo cortar el mus y qué indican los descartes de los rivales.
- **Butifarra:** cuándo delegar y cuándo cantar butifarra.

La guía MUST incluir una línea que empiece por «En otros sitios» para cada variante regional que cuentan los libros y que la suite no juega:
- la Escoba a 31 puntos;
- la Siete y media con la carta tapada o destapada;
- el Julepe en el que quien reparte «la baila»;
- el Tute subastado de 3 jugadores con 12 cartas;
- el Polignac con el orden antiguo (el As por debajo de la J);
- el Treinta y uno con viuda;
- el Oh Hell que sube de 1 carta al máximo;
- el Barbu cuyo dominó empieza por el número que elige quien reparte.

La guía del Burro MUST decir que en muchos sitios se llama Burro a otro juego, de bazas, y que también está en la suite como «Burro de bazas».

La guía del Chinchón MUST incluir un ejemplo visual que coloca una carta suelta en una combinación a la vista. La guía de la Escoba MUST incluir un ejemplo con los 10 oros y los 4 sietes y su premio. Los dos ejemplos MUST cumplir las reglas tal como las aplica el motor con la variante activada.

#### Scenario: La historia empieza plegada
- **WHEN** el jugador abre la guía del Tute
- **THEN** ve al final el apartado «Un poco de historia» plegado y, al tocarlo, lee de dónde viene el juego y su nombre

#### Scenario: Todos los juegos tienen su historia
- **WHEN** se abre la guía de cualquier juego de la suite
- **THEN** termina con el apartado «Un poco de historia» y su párrafo no está vacío

#### Scenario: Un consejo de los libros
- **WHEN** el jugador abre la guía del Tute
- **THEN** los consejos le dicen que no arrastre contra el As de triunfo

#### Scenario: Una variante regional que no se juega
- **WHEN** el jugador abre la guía de la Escoba
- **THEN** lee que en otros sitios la partida se juega a 31 puntos

#### Scenario: El ejemplo de colocar una carta suelta
- **WHEN** el jugador abre la guía del Chinchón
- **THEN** ve un antes y un después en el que una carta suelta pasa a una combinación a la vista, resaltada

#### Scenario: El otro Burro
- **WHEN** el jugador abre la guía del Burro
- **THEN** lee que el Burro de bazas, el otro juego con ese nombre, también está en el menú
