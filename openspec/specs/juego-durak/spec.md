# juego-durak Specification

## Purpose
TBD - created by archiving change juego-durak. Update Purpose after archive.

## Requirements

### Requirement: Baraja, reparto y triunfo del Durak
El Durak MUST jugarse con 2 a 6 jugadores (2 por defecto), cada uno por su cuenta, y la baraja francesa de 36 cartas: del 6 al As de cada palo, ordenadas 6, 7, 8, 9, 10, J, Q, K y A. Al empezar, MUST darse 6 cartas a cada jugador. La última carta del mazo MUST quedar boca arriba y marcar el palo de triunfo, y MUST ser la última que se roba. Si con 6 jugadores no queda mazo, el triunfo es el palo de la última carta repartida.

#### Scenario: Reparto de 2 jugadores
- **WHEN** empieza una partida de 2 jugadores
- **THEN** cada uno tiene 6 cartas, quedan 24 en el mazo y la última del mazo marca el triunfo

#### Scenario: Primer ataque
- **WHEN** el jugador 1 tiene el 7 de triunfo y nadie tiene el 6 de triunfo
- **THEN** ataca primero el jugador 1, y defiende el jugador de su izquierda

### Requirement: Ataque y defensa en el Durak
Cada ronda MUST empezar con una carta cualquiera del atacante. Mientras haya en la mesa una carta de ataque sin ganar, el defensor MUST elegir entre:
- **ganarla** con una carta más alta del mismo palo, o con un triunfo si la carta de ataque no es triunfo;
- **llevarse** todas las cartas de la mesa.

#### Scenario: Ganar con el mismo palo
- **WHEN** el atacante pone el 9 de corazones, el triunfo es picas y el defensor tiene el Q de corazones y el 6 de picas
- **THEN** puede ganarla con el Q de corazones o con el 6 de picas, pero no con el 8 de corazones

#### Scenario: Llevarse las cartas
- **WHEN** el defensor no quiere o no puede ganar la carta de ataque
- **THEN** se lleva todas las cartas de la mesa a su mano y la ronda termina

### Requirement: Echar cartas en el Durak
Cuando todas las cartas de ataque de la mesa están ganadas, los demás jugadores con cartas MUST poder echar, por turno y empezando por el atacante, una carta de un número que ya esté en la mesa, o pasar. Cada carta echada es un nuevo ataque que el defensor tiene que ganar o llevarse. No se MUST poder echar si ya hay 6 ataques en la ronda o si el defensor se ha quedado sin cartas. A quien no tiene ninguna carta que echar se le salta. Cuando nadie echa más, la ronda termina.

#### Scenario: Echar del mismo número
- **WHEN** en la mesa hay un 8 de tréboles ganado con el 10 de tréboles y otro jugador tiene el 10 de diamantes y el J de diamantes
- **THEN** puede echar el 10 de diamantes, pero no el J de diamantes

#### Scenario: Límite de ataques
- **WHEN** en la ronda ya hay 6 cartas de ataque
- **THEN** nadie puede echar más

### Requirement: Fin de la ronda y robar en el Durak
Si el defensor ha ganado todos los ataques, las cartas de la mesa MUST ir al descarte y el defensor ataca en la siguiente ronda. Si se las ha llevado, ataca el siguiente jugador después de él. Después, mientras quede mazo, cada jugador MUST robar hasta tener 6 cartas: primero el atacante, después los demás en orden y el defensor al final.

#### Scenario: Defensa con éxito
- **WHEN** el defensor gana el único ataque y nadie echa más
- **THEN** las dos cartas van al descarte, todos roban hasta 6 y el defensor pasa a atacar

### Requirement: Salir y fin de la partida del Durak
Con el mazo vacío, quien se queda sin cartas MUST salir de la partida a salvo; en las rondas siguientes se le salta. Cuando solo queda un jugador con cartas, la partida MUST terminar: ese jugador es el *durak* y pierde, y ganan todos los demás. Si los últimos jugadores se quedan sin cartas a la vez, la partida MUST terminar en empate.

#### Scenario: El durak
- **WHEN** con el mazo vacío el jugador 0 gana el último ataque y se queda sin cartas, y el jugador 1 tiene 3
- **THEN** la partida termina, el jugador 1 es el durak y gana el jugador 0

### Requirement: Vista del jugador en el Durak
Cada jugador MUST ver:
- su mano y cuántas cartas tienen los demás;
- cuántas quedan en el mazo y la carta del triunfo;
- la mesa, con cada ataque y su defensa;
- las cartas del descarte;
- quién ataca y quién defiende;
- las cartas que cada uno se llevó de la mesa y aún tiene;
- quién ha salido y la última acción.

Las manos ajenas, salvo esas cartas conocidas, y el mazo MUST quedar ocultos.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador al empezar
- **THEN** no contiene ninguna carta de la mano de los demás ni del mazo, salvo la carta del triunfo
