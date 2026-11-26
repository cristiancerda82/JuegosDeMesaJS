# juego-manilla Specification

## Purpose
TBD - created by archiving change juego-manilla. Update Purpose after archive.

## Requirements

### Requirement: Baraja, reparto y pinte de la Manilla
La Manilla MUST jugarse entre 4 jugadores en dos parejas (cada uno con el de enfrente) con la baraja española de 48 cartas. En cada mano:
- quien reparte MUST dar 12 cartas a cada jugador, de cuatro en cuatro, empezando por el siguiente a él;
- la última carta, que es suya, es el pinte: se vuelve, y su palo MUST ser el triunfo de la mano;
- el pinte MUST quedar en la mano de quien reparte, a la vista de todos, hasta que lo juega.

En la primera mano reparte el asiento 3, y el que reparte pasa al siguiente en cada mano.

#### Scenario: El pinte marca el triunfo
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 12 cartas, la última del que reparte está a la vista y su palo es el triunfo

### Requirement: Valor y orden de las cartas de la Manilla
En cada palo, el orden de mayor a menor MUST ser 9 (la manilla), As, Rey, Caballo, Sota, 8, 7, 6, 5, 4, 3 y 2. Las cartas MUST valer: la manilla 5 puntos, el As 4, el Rey 3, el Caballo 2, la Sota 1 y las demás 0. Cada baza MUST valer además 1 punto, así que cada mano reparte 72 puntos.

#### Scenario: La manilla gana al As
- **WHEN** sale el As de copas y el siguiente echa el 9 de copas, sin triunfos en la baza
- **THEN** gana el 9 de copas

### Requirement: Bazas de la Manilla
- **Salida:** sale el jugador siguiente al que reparte; después, quien gana la baza anterior.
- **Si la baza la va ganando un rival**, el jugador MUST:
  - seguir el palo de salida y superar la carta que gana si puede;
  - sin ese palo, fallar con triunfo, superando el triunfo más alto si puede;
  - si no puede superar el triunfo que gana, o no tiene ni el palo ni triunfo, puede echar cualquier carta.
- **Si la va ganando su compañero**, el jugador MUST seguir el palo de salida si puede, con cualquier carta de ese palo, y si no lo tiene puede echar cualquier carta.
- **Ganadora:** gana el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida.

#### Scenario: Montar contra un rival
- **WHEN** un rival gana la baza con el Caballo de copas y el jugador tiene el Rey y el 3 de copas
- **THEN** solo puede echar el Rey de copas

#### Scenario: Con la baza del compañero
- **WHEN** el compañero gana la baza con el Rey de copas y el jugador tiene el 9 y el 3 de copas
- **THEN** puede echar cualquiera de los dos

#### Scenario: Sobrefallo imposible
- **WHEN** un rival ha fallado con la manilla de triunfo y el jugador, sin el palo de salida, solo tiene triunfos menores
- **THEN** puede echar cualquier carta

### Requirement: Puntuación de la Manilla
Al acabar las 12 bazas, cada pareja MUST anotarse lo que pasa de 36 entre cartas y bazas; con 36 a 36 nadie se anota nada por las cartas. La pareja del que reparte MUST anotarse además el valor del pinte. Si con el pinte esa pareja llegaría a los puntos de la partida, MUST anotarlo solo si ha hecho al menos 36 en la mano.

#### Scenario: El ejemplo del libro
- **WHEN** la pareja que reparte vuelve el 9 de oros y hace 40 puntos
- **THEN** se anota 9: 4 por pasar de 36 y 5 por el pinte

#### Scenario: El pinte que daría la partida
- **WHEN** a la pareja que reparte, con 37 puntos en la partida, el pinte de 5 le daría los 40, y en la mano ha hecho 30
- **THEN** no se anota el pinte

### Requirement: Fin de la partida de la Manilla
La partida MUST jugarse a 40 puntos (por defecto) o a 20, y MUST terminar al acabar la mano en la que una pareja llega a esos puntos. Gana esa pareja.

#### Scenario: Llegar a 40
- **WHEN** una pareja con 38 puntos se anota 4 en una mano
- **THEN** la partida termina y gana esa pareja

### Requirement: Vista del jugador en la Manilla
La vista de cada jugador MUST mostrar:
- su mano y cuántas cartas tienen los demás;
- quién reparte, el pinte y el triunfo, y si el pinte sigue en la mano de quien reparte;
- la baza en curso, las bazas jugadas en la mano y la última baza;
- los puntos de cada pareja en la mano;
- el marcador y el resumen de las manos anteriores.

La vista MUST NOT mostrar las manos ajenas, salvo el pinte mientras siga en la mano de quien reparte.

#### Scenario: Manos ocultas
- **WHEN** un jugador mira la mesa
- **THEN** ve su mano, el pinte y cuántas cartas tienen los demás, pero no cuáles
