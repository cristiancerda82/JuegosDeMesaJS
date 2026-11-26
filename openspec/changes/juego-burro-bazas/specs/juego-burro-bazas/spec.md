## ADDED Requirements

### Requirement: Baraja y reparto del Burro de bazas
El Burro de bazas MUST jugarse entre 3 y 6 jugadores con la baraja española de 48 cartas (con ochos y nueves). En cada palo, el orden de mayor a menor MUST ser Rey, Caballo, Sota, 9, 8, 7, 6, 5, 4, 3, 2 y As: el As es la carta más baja.

Al empezar cada mano, cada jugador MUST recibir 4 cartas, y el resto MUST quedar boca abajo en el mazo. En la primera mano reparte el asiento 0, y el que reparte pasa al siguiente en cada mano.

#### Scenario: Reparto con 4
- **WHEN** empieza una mano con 4 jugadores
- **THEN** cada jugador tiene 4 cartas y quedan 32 en el mazo

#### Scenario: Reparto con 6
- **WHEN** empieza una mano con 6 jugadores
- **THEN** cada jugador tiene 4 cartas y quedan 24 en el mazo

### Requirement: Bazas del Burro de bazas
- **Salida:** en la primera baza de la mano sale el jugador siguiente al que reparte; después, quien gana la baza anterior. Si quien gana se ha quedado sin cartas, sale el siguiente que tiene.
- **Salir:** quien sale puede echar cualquier carta.
- **Responder:** quien tiene cartas del palo de salida MUST echar una de ellas, y puede echar la que quiera, aunque sea más baja que las de la mesa.
- **Sin el palo:** quien no tiene el palo de salida MUST robar del mazo, una a una, hasta sacar una carta de ese palo, y MUST echarla; las demás que roba se quedan en su mano. Si el mazo se acaba sin sacar ninguna, o ya estaba vacío, MUST pasar sin echar carta.
- **Ganadora:** no hay triunfo, y la baza la gana la carta más alta del palo de salida.
- **Quien no tiene cartas** no juega en la baza.

#### Scenario: Sin triunfo y con el As abajo
- **WHEN** sale el 9 de copas y los demás echan el As, el Rey y el 4 de copas
- **THEN** gana el Rey de copas

#### Scenario: Seguir el palo sin montar
- **WHEN** sale el 9 de oros y el jugador tiene el 7 y el Rey de oros
- **THEN** puede echar cualquiera de los dos

#### Scenario: Robar hasta tener el palo
- **WHEN** sale el 5 de oros, el jugador no tiene oros y en el mazo están, por orden, el 2 de bastos, la Sota de copas y el Caballo de oros
- **THEN** roba las tres, echa el Caballo de oros y se queda el 2 de bastos y la Sota de copas

#### Scenario: Pasar sin mazo
- **WHEN** sale una carta de oros, el jugador no tiene oros y el mazo está vacío
- **THEN** pasa sin echar carta

### Requirement: Fin de la mano del Burro de bazas
Quien se queda sin cartas MUST dejar de jugar en esa mano, y los demás siguen. Al terminar una baza en la que solo a un jugador le quedan cartas, la mano MUST acabar: ese jugador es el burro y MUST sumar una penalización. Si al terminar la baza no le quedan cartas a nadie, la mano MUST acabar sin burro.

#### Scenario: El burro
- **WHEN** al terminar una baza a todos menos a un jugador se les han acabado las cartas
- **THEN** ese jugador suma una penalización y se reparte la mano siguiente

#### Scenario: Sin burro
- **WHEN** los dos últimos jugadores con cartas echan su última carta en la misma baza
- **THEN** la mano acaba sin que nadie sume una penalización

### Requirement: Fin de la partida del Burro de bazas
El límite de la partida MUST poder ser 3 o 5 penalizaciones (3 por defecto). La partida MUST terminar cuando un jugador llega al límite. Pierde ese jugador, y ganan los que tienen menos penalizaciones (puede haber varios).

#### Scenario: Llegar al límite
- **WHEN** con el límite en 3, un jugador con 2 penalizaciones es el burro
- **THEN** la partida termina y ganan los que tienen menos penalizaciones

### Requirement: Vista del jugador en el Burro de bazas
La vista de cada jugador MUST mostrar:
- su mano;
- cuántas cartas tienen los demás y cuántas quedan en el mazo;
- quién reparte y quién sale en la baza en curso;
- la baza en curso y la última baza, con quién pasó y cuántas cartas robó cada uno;
- las cartas jugadas en la mano y los palos que se sabe que no tiene cada uno;
- el orden en que los jugadores se han quedado sin cartas;
- las penalizaciones y el resumen de las manos anteriores.

La vista MUST NOT mostrar las manos ajenas ni las cartas del mazo.

#### Scenario: Manos y mazo ocultos
- **WHEN** un jugador mira la mesa
- **THEN** ve su mano, cuántas cartas tiene cada uno y cuántas quedan en el mazo, pero no cuáles
