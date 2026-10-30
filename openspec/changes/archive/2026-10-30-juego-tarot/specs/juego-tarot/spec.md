## ADDED Requirements

### Requirement: Reparto del Tarot
El Tarot MUST jugarse entre 3, 4 o 5 con la baraja de Tarot de 78 cartas. En cada mano MUST repartirse:
- con 3 jugadores, 24 cartas a cada uno y 6 al perro;
- con 4, 18 a cada uno y 6 al perro;
- con 5, 15 a cada uno y 3 al perro.

Si un jugador recibe el 1 de triunfo (el Petit) sin ningún otro triunfo ni la Excusa, se MUST repartir de nuevo. El repartidor de la primera mano es el último asiento y pasa al siguiente en cada mano. Habla primero y sale el jugador siguiente al repartidor.

#### Scenario: Reparto con 4
- **WHEN** empieza una mano con 4 jugadores
- **THEN** cada uno tiene 18 cartas y el perro tiene 6

#### Scenario: Reparto con 5
- **WHEN** empieza una mano con 5 jugadores
- **THEN** cada uno tiene 15 cartas y el perro tiene 3

#### Scenario: Petit seco
- **WHEN** un reparto deja a un jugador con el Petit como único triunfo y sin la Excusa
- **THEN** se reparte de nuevo con la misma mano de la ronda

### Requirement: Subasta del Tarot
Cada jugador, por orden y una sola vez, MUST pasar o pedir un contrato más alto que el último pedido. Los contratos, de menor a mayor y con su multiplicador, son:
- *Petite*, ×1;
- *Garde*, ×2;
- *Garde sans le chien*, ×4;
- *Garde contre le chien*, ×6.

Quien pide el contrato más alto es el preneur. Si todos pasan, la mano es nula: nadie suma y se reparte la siguiente.

#### Scenario: Subir
- **WHEN** un jugador ha pedido Garde
- **THEN** los siguientes solo pueden pasar o pedir Garde sans o Garde contre

#### Scenario: Todos pasan
- **WHEN** los cuatro jugadores pasan
- **THEN** la mano cuenta como nula, nadie suma y se reparte la siguiente mano de la ronda

### Requirement: Perro y descarte del Tarot
Según el contrato:
- **Petite y Garde:** el perro MUST enseñarse a todos y pasar a la mano del preneur. Después, el preneur MUST descartar tantas cartas como tenía el perro, que cuentan para él. No MAY descartar Reyes ni *oudlers*, y MAY descartar triunfos solo si no le quedan otras cartas que descartar; los triunfos descartados se enseñan a todos.
- **Garde sans le chien:** el perro no se ve y MUST contar para el preneur al final de la mano.
- **Garde contre le chien:** el perro no se ve y MUST contar para la defensa al final de la mano.

#### Scenario: Descarte
- **WHEN** el preneur de una Garde con 4 jugadores se queda el perro
- **THEN** tiene 24 cartas y tiene que descartar 6 antes de la primera baza

#### Scenario: Reyes en el descarte
- **WHEN** el preneur está descartando
- **THEN** no puede descartar un Rey ni un *oudler*

#### Scenario: Garde sans
- **WHEN** el contrato es Garde sans le chien
- **THEN** nadie ve el perro y sus puntos se suman al preneur al acabar la mano

### Requirement: Llamada al Rey en el Tarot de 5
Con 5 jugadores, tras la subasta (y antes del perro), el preneur MUST llamar a un Rey que no tenga; si tiene los cuatro, a una Dama que no tenga, y si tiene también las cuatro Damas, a un Caballo. Quien tiene la carta llamada MUST ser su pareja, sin que nadie lo sepa hasta que la juega. Si la carta llamada está en el perro, el preneur juega solo contra los otros cuatro.

#### Scenario: Pareja secreta
- **WHEN** el preneur llama al Rey de corazones y lo tiene el jugador 3
- **THEN** el jugador 3 juega con el preneur, pero los demás no lo saben hasta que juega ese Rey

#### Scenario: Rey en el perro
- **WHEN** el Rey llamado está en el perro
- **THEN** el preneur juega solo contra los otros cuatro

### Requirement: Bazas del Tarot
El que sale MAY jugar cualquier carta. Los demás MUST:
1. seguir el palo de salida si pueden;
2. si no tienen ese palo, jugar triunfo;
3. cuando juegan triunfo (por fallar o porque salió triunfo), jugar uno más alto que todos los triunfos de la baza si pueden.

Si no tienen ni el palo ni triunfos, MAY jugar cualquier carta. La Excusa MAY jugarse siempre, en lugar de cualquier otra carta. Si sale la Excusa, la siguiente carta marca el palo. La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida (Rey, Dama, Caballo, Sota, 10…1). La Excusa no gana nunca: MUST volver al bando de quien la jugó, que da a cambio al ganador una carta de medio punto. El ganador sale en la siguiente baza.

#### Scenario: Fallar y subir
- **WHEN** salen corazones, en la baza hay el 12 de triunfo y el jugador no tiene corazones pero tiene el 5 y el 15 de triunfo
- **THEN** está obligado a jugar el 15

#### Scenario: Excusa
- **WHEN** un jugador juega la Excusa en una baza que gana un rival
- **THEN** la Excusa cuenta para el bando del que la jugó, y el ganador recibe medio punto a cambio

#### Scenario: Seguir el palo
- **WHEN** salen picas y el jugador tiene picas y triunfos
- **THEN** tiene que jugar picas o la Excusa

### Requirement: Poignée del Tarot
En su primer turno de bazas, antes de jugar su carta, un jugador MAY enseñar una *poignée* si tiene suficientes triunfos (la Excusa cuenta como triunfo):
- con 3 jugadores, 13, 15 o 18 triunfos (simple, doble o triple);
- con 4, 10, 13 o 15;
- con 5, 8, 10 o 13.

Se enseñan exactamente esos triunfos, los más bajos, y la Excusa solo si no hay bastantes sin ella. La *poignée* MUST valer 20, 30 o 40 puntos para el bando que gane la mano, sin multiplicar.

#### Scenario: Poignée simple
- **WHEN** en una partida de 4 un jugador con 11 triunfos enseña una *poignée* simple
- **THEN** todos ven sus 10 triunfos más bajos, y el bando que gane la mano suma 20

### Requirement: Puntos de la mano del Tarot
Las cartas MUST valer: Reyes y *oudlers* (el 1 y el 21 de triunfo y la Excusa) 4,5; Damas 3,5; Caballos 2,5; Sotas 1,5; el resto 0,5. En total suman 91.

Al acabar la mano, el preneur (con su pareja, con 5) MUST sumar los puntos de sus bazas y, según el contrato, del descarte o del perro. Necesita 56 si no tiene ningún *oudler*, 51 con uno, 41 con dos y 36 con tres. Gana el contrato si llega. La diferencia con lo necesario MUST redondearse hacia arriba a un punto entero.

El valor de la mano para el preneur MUST ser:
- ± (25 + la diferencia) × el multiplicador del contrato, positivo si gana el contrato;
- más el *petit au bout*: ± 10 × el multiplicador, positivo si el Petit está en la última baza y la gana el bando del preneur, negativo si la gana la defensa;
- más las *poignées*: su valor, positivo si gana el contrato.

Cada defensor MUST restar ese valor. Con 3 o 4 jugadores, el preneur suma el valor multiplicado por el número de defensores. Con 5, el preneur suma el doble y su pareja el valor; si juega solo, el preneur suma cuatro veces el valor. La suma de la mesa es siempre 0.

#### Scenario: Petite ganada
- **WHEN** con 4 jugadores el preneur de una Petite tiene dos *oudlers* y 47 puntos
- **THEN** gana por 6: vale 31, el preneur suma 93 y cada defensor resta 31

#### Scenario: Garde perdida
- **WHEN** el preneur de una Garde con un *oudler* tiene 48,5 puntos
- **THEN** pierde por 3 (2,5 redondeado hacia arriba): vale −56, y cada defensor suma 56

#### Scenario: Petit au bout
- **WHEN** en una Petite el bando del preneur gana la última baza con el Petit
- **THEN** la mano vale 10 más para el preneur

#### Scenario: Con 5 y pareja
- **WHEN** con 5 jugadores el preneur gana una Petite que vale 30 con una pareja
- **THEN** el preneur suma 60, su pareja 30 y cada uno de los otros tres resta 30

### Requirement: Ronda del Tarot
La partida MUST durar una ronda en la que cada jugador reparte dos veces: 6 manos con 3 jugadores, 8 con 4 y 10 con 5, contando las manos nulas. Al acabar la ronda, MUST ganar el jugador con más puntos; si varios empatan, ganan todos ellos.

#### Scenario: Fin de la ronda
- **WHEN** acaba la octava mano de una partida de 4
- **THEN** la partida termina y gana el jugador con más puntos

### Requirement: Vista del Tarot
Cada jugador MUST ver:
- su mano;
- cuántas cartas tiene cada uno;
- la subasta, el contrato y el preneur;
- con 5, la carta llamada y la pareja del preneur cuando se sepa;
- el perro, cuando se enseña;
- los triunfos descartados;
- las *poignées*;
- las bazas jugadas en la mano, con quién salió y la carta de cada uno, y la baza en curso;
- los puntos de cada mano anterior y el marcador.

Cada jugador MUST NOT ver las manos de los demás, el perro que no se enseña ni las cartas descartadas que no son triunfos. El preneur MUST ver su propio descarte.

#### Scenario: Descarte oculto
- **WHEN** el preneur ha descartado un 7 de picas
- **THEN** los demás no ven qué cartas ha descartado, salvo los triunfos
