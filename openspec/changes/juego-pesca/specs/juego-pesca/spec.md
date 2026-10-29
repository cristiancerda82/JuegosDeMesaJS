## ADDED Requirements

### Requirement: Baraja y reparto de la Pesca
La Pesca MUST jugarse con 2 a 6 jugadores (por defecto, 4), cada uno por su cuenta, y la baraja francesa de 52 cartas. Al empezar, cada jugador MUST recibir 7 cartas si son 2 o 3 jugadores, y 5 si son de 4 a 6. El resto MUST formar el *mar*, boca abajo. Empieza el jugador 0.

#### Scenario: Reparto con 3 jugadores
- **WHEN** empieza una partida de 3 jugadores
- **THEN** cada uno tiene 7 cartas y quedan 31 en el mar

#### Scenario: Reparto con 5 jugadores
- **WHEN** empieza una partida de 5 jugadores
- **THEN** cada uno tiene 5 cartas y quedan 27 en el mar

### Requirement: Pedir cartas en la Pesca
En su turno, el jugador MUST pedir a un rival que tenga cartas todas las de un valor (As, 2… 10, J, Q o K) del que él tenga al menos una.
- **Si el rival tiene cartas de ese valor:** MUST darle todas, y el jugador MUST seguir pidiendo.
- **Si no tiene:** el jugador MUST robar la carta de arriba del mar («¡A pescar!»). Si la carta es del valor pedido, MUST enseñarse a todos y el jugador sigue pidiendo; si no, el turno MUST pasar al siguiente jugador a su izquierda. Si el mar está vacío, no roba y el turno pasa.

#### Scenario: El rival tiene
- **WHEN** el jugador 0, con un 7, pide sietes al jugador 1, que tiene dos
- **THEN** el jugador 1 le da los dos sietes y el jugador 0 vuelve a pedir

#### Scenario: A pescar
- **WHEN** el jugador 0 pide reyes al jugador 1, que no tiene, y roba un 4 del mar
- **THEN** el 4 va a su mano sin enseñarse y le toca al jugador 1

#### Scenario: Pesca lo que pidió
- **WHEN** el jugador 0 pide reyes, le dicen «¡A pescar!» y roba un rey
- **THEN** todos ven el rey y el jugador 0 sigue pidiendo

#### Scenario: Solo valores propios
- **WHEN** el jugador no tiene ninguna Q
- **THEN** no puede pedir damas

### Requirement: Cuartetos de la Pesca
En cuanto un jugador tenga las cuatro cartas de un valor, MUST bajarlas delante de él como un *cuarteto*, a la vista de todos. También MUST hacerse con las cartas del reparto inicial.

#### Scenario: Cuarteto al recibir
- **WHEN** el jugador 0 tiene dos nueves y el jugador 1 le da los otros dos
- **THEN** el jugador 0 baja el cuarteto de nueves y ya no los tiene en la mano

### Requirement: Jugadores sin cartas en la Pesca
Si a un jugador le toca, o sigue pidiendo, sin cartas en la mano, MUST robar una carta del mar y pedir con ella. Si el mar está vacío, MUST quedar fuera: el turno pasa al siguiente jugador que tenga cartas o pueda robar. A un rival sin cartas no se le puede pedir.

#### Scenario: Roba y sigue
- **WHEN** le toca al jugador 2 sin cartas y quedan cartas en el mar
- **THEN** roba una y pide con ella

#### Scenario: Fuera
- **WHEN** le toca al jugador 2 sin cartas y el mar está vacío
- **THEN** le toca al siguiente jugador con cartas

### Requirement: Fin de la Pesca
La partida MUST terminar cuando se hayan bajado los 13 cuartetos. La MUST ganar quien tenga más cuartetos; si empatan varios con el máximo, todos ellos son ganadores y es empate. Los puntos del resultado son los cuartetos de cada jugador.

#### Scenario: Gana quien más cuartetos tiene
- **WHEN** se baja el último cuarteto y el jugador 1 tiene 5, el resto menos
- **THEN** la partida termina y gana el jugador 1

#### Scenario: Empate
- **WHEN** termina la partida y los jugadores 0 y 2 tienen 4 cuartetos, el máximo
- **THEN** es empate entre el 0 y el 2

### Requirement: Vista del jugador en la Pesca
Cada jugador MUST ver:
- su mano;
- cuántas cartas tienen los demás y cuántas quedan en el mar;
- los cuartetos de cada jugador;
- a quién le toca;
- el registro público de la partida: cada petición (quién pide, a quién y qué valor), las cartas que se dieron, si hubo que pescar y, si se pescó la carta pedida, cuál fue.

Las manos ajenas y el mar MUST quedar ocultos, salvo las cartas que se dieron o se enseñaron en el registro.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** no ve ninguna carta de las manos ajenas ni del mar que no se haya dado o enseñado
