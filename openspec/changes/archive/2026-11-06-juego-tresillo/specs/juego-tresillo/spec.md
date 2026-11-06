## ADDED Requirements

### Requirement: Baraja y orden de las cartas del Tresillo
El Tresillo MUST jugarse entre 3 jugadores con la baraja española de 40 cartas.

La espadilla (As de espadas) y el basto (As de bastos) MUST ser siempre triunfo. La malilla MUST ser el 2 del triunfo si el triunfo es espadas o bastos, y el 7 si es oros o copas. Estas tres cartas son los matadores.

El orden de mayor a menor MUST ser:
- **Triunfo de espadas o bastos:** espadilla, malilla, basto, rey, caballo, sota, 7, 6, 5, 4, 3 (11 triunfos).
- **Triunfo de oros o copas:** espadilla, malilla, basto, el punto (As del triunfo), rey, caballo, sota, 2, 3, 4, 5, 6 (12 triunfos).
- **Espadas o bastos sin ser triunfo:** rey, caballo, sota, 7, 6, 5, 4, 3, 2 (sin su As, que es triunfo).
- **Oros o copas sin ser triunfo:** rey, caballo, sota, As, 2, 3, 4, 5, 6, 7.

#### Scenario: Triunfo de oros
- **WHEN** el triunfo es oros
- **THEN** los triunfos de mayor a menor son el As de espadas, el 7 de oros, el As de bastos, el As de oros, el rey, el caballo y la sota de oros, y el 2, 3, 4, 5 y 6 de oros

#### Scenario: La espadilla es siempre triunfo
- **WHEN** el triunfo es copas y una baza tiene el rey de copas y el As de espadas
- **THEN** la gana el As de espadas

#### Scenario: Palo rojo sin triunfo
- **WHEN** el triunfo es espadas y sale el 2 de copas, y luego se echan el 7 y el As de copas
- **THEN** la baza la gana el As de copas

### Requirement: Fichas y reparto del Tresillo
Cada jugador MUST empezar con 100 fichas. Al empezar cada mano, cada jugador MUST poner 1 ficha en el bote (o nada, si no tiene).

En cada mano MUST repartirse 9 cartas a cada jugador, y las 13 restantes forman el monte, boca abajo. En la primera mano reparte el asiento 2; después, el siguiente. El mano es el siguiente al que reparte.

#### Scenario: Reparto
- **WHEN** empieza la primera mano
- **THEN** cada jugador tiene 9 cartas y 99 fichas, el bote tiene 3 y el monte 13 cartas

### Requirement: Subasta del Tresillo
Desde el mano, por turno, cada jugador MUST pujar un contrato más alto que el último pujado o pasar. Quien pasa MUST NOT volver a pujar. La subasta termina cuando todos menos uno han pasado tras una puja, o cuando pasan los tres.

Los contratos, de menor a mayor, MUST ser:
- **Entrada:** el hombre elige el palo del triunfo y cambia cartas con el monte;
- **Vuelta:** se descubre la primera carta del monte y su palo es el triunfo; el hombre cambia cartas y esa carta MUST ser la primera que roba;
- **Solo:** el hombre elige el palo del triunfo y no cambia.

Quien gana la subasta es el hombre. En la entrada y en el solo, el hombre MUST elegir el triunfo antes del cambio. Si pasan los tres, la mano no se juega, el bote MUST quedarse para la mano siguiente y reparte el siguiente.

#### Scenario: Subasta ganada
- **WHEN** el mano puja entrada, el segundo puja vuelta, el tercero pasa y el mano pasa
- **THEN** el segundo es el hombre con la vuelta, y se descubre la primera carta del monte

#### Scenario: Pasan los tres
- **WHEN** los tres jugadores pasan
- **THEN** no se juega la mano, el bote se queda y se reparte otra con el siguiente que reparte

### Requirement: Cambio del Tresillo
Tras la subasta, por turno:
1. el hombre (salvo en el solo) MUST poder descartarse de las cartas que quiera y robar del monte otras tantas; en la vuelta MUST descartarse de al menos una y la carta vuelta es la primera que roba;
2. después, desde el siguiente al hombre, cada defensor MUST poder descartarse y robar otras tantas, como mucho tantas como queden en el monte.

Lo que queda del monte no se juega.

#### Scenario: Cambio del hombre
- **WHEN** el hombre de una entrada se descarta de 5 cartas
- **THEN** roba 5 del monte, sigue con 9 y quedan 8 en el monte

#### Scenario: El monte se acaba
- **WHEN** quedan 3 cartas en el monte y un defensor quiere descartarse de 4
- **THEN** solo puede descartarse de 3

### Requirement: Bazas del Tresillo
Se juegan 9 bazas.
- **Salida:** en la primera sale el mano; después, quien gana la baza anterior.
- **Seguir el palo:** el jugador MUST echar una carta del palo de salida si tiene; si no, puede echar cualquier carta.
- **Privilegio de los matadores:** si sale triunfo, un matador no cuenta para la obligación de seguir el palo, salvo que la carta de salida sea un matador más alto. Así, quien solo tiene matadores como triunfos puede echar cualquier carta.
- **Ganadora:** la baza la gana el triunfo más alto o, si no hay triunfo, la carta más alta del palo de salida.

#### Scenario: Seguir el palo
- **WHEN** sale el rey de copas, que no es triunfo, y el jugador tiene el 4 de copas
- **THEN** solo puede echar copas

#### Scenario: El matador no está obligado
- **WHEN** el triunfo es oros, sale el 3 de oros y el jugador solo tiene de triunfo la malilla
- **THEN** puede echar cualquier carta

#### Scenario: Matador superior en la salida
- **WHEN** el triunfo es oros, sale la espadilla y el jugador solo tiene de triunfo el basto
- **THEN** tiene que echar el basto

### Requirement: Sacada, puesta y codillo
El contrato MUST valer 2 la entrada, 4 la vuelta y 6 el solo. Al acabar las bazas:
- **Sacada:** si el hombre hace más bazas que cada defensor, MUST llevarse el bote, y cada defensor MUST pagarle el valor del contrato.
- **Puesta:** si el hombre empata con el defensor que más bazas hace, MUST pagar al bote tanto como había en él y a cada defensor el valor del contrato.
- **Codillo:** si un defensor hace más bazas que el hombre, el hombre MUST pagarle tanto como hay en el bote, y a cada defensor el valor del contrato; el bote se queda. Si los dos defensores empatan con más bazas que el hombre, el codillo es para el primero de ellos después del hombre.

Nadie paga más fichas de las que tiene. Tras una puesta o un codillo, el bote pasa a la mano siguiente.

#### Scenario: Sacada
- **WHEN** con 3 fichas en el bote, el hombre de una entrada hace 5 bazas y los defensores 2 cada uno
- **THEN** el hombre se lleva las 3 fichas del bote y 2 de cada defensor

#### Scenario: Puesta
- **WHEN** con 3 fichas en el bote, el hombre de una vuelta hace 4 bazas, un defensor 4 y el otro 1
- **THEN** el hombre paga 3 al bote, que pasa a tener 6, y 4 a cada defensor

#### Scenario: Codillo
- **WHEN** con 3 fichas en el bote, el hombre de un solo hace 3 bazas y un defensor 5
- **THEN** el hombre paga 3 a ese defensor y 6 a cada defensor, y el bote sigue con 3

### Requirement: Fin de la partida del Tresillo
La partida MUST terminar tras 12 manos (contando las que pasan los tres) o cuando un jugador se queda sin fichas. Gana quien tiene más fichas; si varios empatan arriba, ganan todos ellos. Lo que quede en el bote no cuenta.

#### Scenario: Fin a las 12 manos
- **WHEN** termina la mano 12
- **THEN** la partida acaba y gana el jugador con más fichas

### Requirement: Vista del jugador en el Tresillo
La vista de cada jugador MUST mostrar:
- su mano;
- cuántas cartas tienen los otros;
- la subasta, el hombre, el contrato y el triunfo;
- la carta vuelta;
- cuántas cartas cambió cada uno y cuántas quedan en el monte;
- la baza en curso, la última baza y las bazas de cada uno;
- el bote, las fichas y el resumen de las manos anteriores.

La vista MUST NOT mostrar:
- las manos ajenas;
- las cartas descartadas;
- el monte (salvo la carta vuelta).

#### Scenario: Descartes ocultos
- **WHEN** un defensor se descarta de 4 cartas
- **THEN** el jugador ve que cambió 4, pero no cuáles
