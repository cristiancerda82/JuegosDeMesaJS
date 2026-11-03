## ADDED Requirements

### Requirement: Baraja y reparto del Préférence
El Préférence MUST jugarse entre 3 jugadores con 32 cartas francesas: del 7 al As de cada palo, con el orden A, K, Q, J, 10, 9, 8 y 7. En cada mano, cada jugador MUST recibir 10 cartas y quedan 2 boca abajo en la viuda. El repartidor de la primera mano es el asiento 2 y pasa al siguiente en cada mano; el siguiente al repartidor puja primero y sale en la primera baza.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 10 cartas, la viuda tiene 2 que nadie ve y le toca pujar al siguiente al repartidor

### Requirement: Subasta del Préférence
Las pujas MUST ordenarse, de menor a mayor:
- de 6 a 10 bazas;
- dentro de cada número, picas, tréboles, diamantes, corazones y sin triunfo;
- la **miseria** (no ganar ninguna baza) entre el 8 sin triunfo y el 9 de picas.

Desde el siguiente al repartidor y en turno, cada jugador MUST pujar más alto que la puja más alta o pasar; quien pasa no vuelve a pujar. La miseria MUST poder decirse solo como primera puja de un jugador. La subasta termina cuando quedan pasados dos jugadores y el otro ha pujado: ese gana la subasta. Si pasan los tres, se juega la raspasy.

#### Scenario: Pujar más alto
- **WHEN** el jugador 0 puja 6 de corazones
- **THEN** el jugador 1 puede pujar 6 sin triunfo, pero no 6 de diamantes

#### Scenario: Miseria solo como primera puja
- **WHEN** un jugador que ya pujó 6 de picas vuelve a hablar
- **THEN** no puede pujar miseria

#### Scenario: Gana la subasta
- **WHEN** el jugador 0 puja 7 de tréboles y los otros dos pasan
- **THEN** el jugador 0 gana la subasta

### Requirement: Viuda, descarte y contrato del Préférence
Quien gana la subasta MUST enseñar a todos las 2 cartas de la viuda y quedárselas, descartar 2 cartas boca abajo y declarar su contrato: una puja de bazas igual o más alta que la suya. Si ganó con miseria, el contrato es la miseria. La viuda MUST verse hasta el final de la mano; los descartes, solo el que los hizo.

#### Scenario: Contrato más alto
- **WHEN** el jugador gana la subasta con 7 de tréboles y, tras ver la viuda, declara 8 de corazones
- **THEN** juega 8 de corazones

#### Scenario: No se declara menos
- **WHEN** el jugador ganó con 7 de tréboles
- **THEN** no puede declarar 6 de corazones ni 7 de picas

### Requirement: Whist del Préférence
En un contrato de bazas, cada uno de los otros dos jugadores, en orden de juego, MUST decidir si hace **whist** (juega a ganar bazas contra el que juega) o pasa. Si los dos pasan, el contrato MUST darse por cumplido sin jugar las bazas. En la miseria no hay whist: se juega siempre.

A los que hacen whist les toca ganar entre todos un número de bazas: 4 en un contrato de 6, 2 en uno de 7, 1 en uno de 8 o de 9, y ninguna en uno de 10.

#### Scenario: Nadie hace whist
- **WHEN** el jugador declara 6 de picas y los otros dos pasan
- **THEN** la mano termina con el contrato cumplido, sin jugarse

### Requirement: Bazas del Préférence
Sale en la primera baza el siguiente al repartidor; después, quien ganó la anterior. Cada jugador MUST seguir el palo de salida si puede; si no, MUST echar un triunfo si tiene; si tampoco, MAY echar cualquier carta. Gana el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida. En los contratos sin triunfo, en la miseria y en la raspasy no hay triunfo.

#### Scenario: Obligación de fallar
- **WHEN** el triunfo es corazones, salen diamantes y el jugador no tiene diamantes pero sí corazones
- **THEN** solo puede echar corazones

#### Scenario: Sin triunfo
- **WHEN** en un contrato sin triunfo salen picas y un jugador sin picas echa el As de corazones
- **THEN** no gana la baza

### Requirement: Raspasy del Préférence
Si los tres pasan en la subasta, la mano MUST jugarse sin triunfo, sin viuda y cada uno para sí, saliendo el siguiente al repartidor. Cada baza que gana un jugador MUST sumar 1 a su montaña.

#### Scenario: Raspasy
- **WHEN** pasan los tres y un jugador gana 4 bazas en la raspasy
- **THEN** suma 4 a su montaña

### Requirement: Cuenta de la mano del Préférence
Los contratos MUST valer 2 (6 bazas), 4 (7), 6 (8), 8 (9) y 10 (10 bazas o miseria). Al acabar la mano:
- **El que juega cumple** (gana tantas bazas como su contrato o más, o ninguna en la miseria): suma el valor a su **pulka**.
- **El que juega falla:**
  - en un contrato de bazas, suma a su **montaña** el valor por cada baza que le falta;
  - en la miseria, el valor por cada baza que ganó.
- **Whists de cada uno que hace whist:**
  - se apunta contra el que juega el valor por cada baza que ganó;
  - si el que juega falla, además el valor por cada baza que le faltó.
- **Si los que hacen whist ganan entre todos menos bazas de las que les tocan:** cada uno suma a su montaña el valor por cada baza que falta, dividido entre los que hicieron whist.

#### Scenario: Contrato cumplido con whist
- **WHEN** el jugador cumple un 7 de picas y el único que hace whist gana 2 bazas
- **THEN** el que juega suma 4 a su pulka y el del whist se apunta 8 whists contra él

#### Scenario: Contrato fallado
- **WHEN** el jugador gana 5 bazas en un 6 de picas y los dos hacen whist, uno con 3 bazas y otro con 2
- **THEN** el que juega suma 2 a su montaña, y se apuntan contra él 8 y 6 whists

#### Scenario: Whist que no llega
- **WHEN** en un 6 de picas el único que hace whist gana 3 bazas
- **THEN** suma 2 a su montaña

#### Scenario: Miseria fallada
- **WHEN** el jugador gana 2 bazas en la miseria
- **THEN** suma 20 a su montaña

### Requirement: Partida y cierre de cuentas del Préférence
La partida MUST terminar al acabar la mano en la que las pulkas de los tres suman tres veces la meta (10 por defecto, así que 30): lo que la pulka de uno pasa de la meta cubre lo que les falta a los demás. Para que la partida no se alargue sin fin cuando nadie cumple sus contratos, MUST terminar también al acabar la mano 60. Entonces se cierran las cuentas. Para cada jugador, su montaña menos su pulka es su deuda. El saldo de cada jugador MUST ser:
- 10 por la diferencia entre la deuda media y la suya;
- más los whists que se apuntó contra los demás;
- menos los que los demás se apuntaron contra él.

Los saldos de los tres suman 0. Gana quien tiene el saldo más alto (empatan los que lo comparten); si los tres empatan, la partida queda en empate. Los saldos MUST mostrarse con un decimal.

#### Scenario: Cierre de cuentas
- **WHEN** termina la partida con pulkas de 10, montañas de 0, 6 y 12 y sin whists
- **THEN** los saldos son +60, 0 y −60, y gana el primero

#### Scenario: La pulka de uno cubre la de otro
- **WHEN** tras una mano las pulkas son 14, 10 y 6
- **THEN** la partida termina, porque suman 30

#### Scenario: Límite de manos
- **WHEN** acaba la mano 60 y las pulkas no suman 30
- **THEN** la partida termina y se cierran las cuentas

### Requirement: Vista del Préférence
Cada jugador MUST ver:
- su mano, cuántas cartas tiene cada uno y sus propios descartes;
- la subasta, el contrato, quién juega y el triunfo;
- la viuda, desde que la enseña quien gana la subasta hasta el final de la mano;
- quién hace whist;
- la baza en curso, la última baza y las bazas de cada jugador;
- las cartas que ha echado cada uno y los palos de los que se sabe que no tiene;
- la pulka, la montaña y los whists de cada uno, y los resultados de las manos anteriores.

Cada jugador MUST NOT ver las manos de los demás, la viuda antes de enseñarse ni los descartes ajenos.

#### Scenario: Viuda oculta durante la subasta
- **WHEN** el jugador 0 mira la mesa durante la subasta
- **THEN** no ve las cartas de la viuda
