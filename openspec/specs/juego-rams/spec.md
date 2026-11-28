# juego-rams Specification

## Purpose
TBD - created by archiving change juego-rams. Update Purpose after archive.

## Requirements

### Requirement: Baraja, reparto, niña y pinte del Rams
El Rams MUST jugarse entre 3 y 6 jugadores, cada uno contra los demás, con una baraja francesa de 32 cartas, del As al 7. Las cartas de cada palo MUST ordenarse, de mayor a menor, As, Rey, Dama, Jota, 10, 9, 8 y 7. Cada jugador MUST empezar la partida con 5 fichas.

En cada mano MUST recibir cartas solo los jugadores que aún tienen fichas: 5 cada uno si son de 2 a 5, y 4 si son 6. MUST dejarse aparte, boca abajo, tantas cartas como tiene cada mano (la niña), y volverse la siguiente (el pinte), cuyo palo MUST ser el triunfo. El que reparte MUST pasar al siguiente jugador con fichas en cada mano.

#### Scenario: Reparto con 4
- **WHEN** empieza una partida de 4
- **THEN** cada jugador tiene 5 cartas y 5 fichas, hay una niña de 5 cartas y el pinte marca el triunfo

#### Scenario: Reparto con 6
- **WHEN** empieza una partida de 6
- **THEN** cada jugador tiene 4 cartas, la niña tiene 4 y hay pinte

#### Scenario: Sin fichas no se reciben cartas
- **WHEN** un jugador se ha quedado sin fichas
- **THEN** en las manos siguientes no recibe cartas

### Requirement: Hablar en el Rams
Antes de jugar cada mano, empezando por el siguiente al que reparte, cada jugador con cartas, menos el que reparte, MUST decir si juega o pasa. Mientras nadie la haya cogido, cualquiera de ellos MAY cambiar su mano por la niña, y entonces MUST jugar. El que reparte MUST jugar siempre. Si todos los demás pasan, el que reparte MUST ganar la mano sin jugarla, con todas sus bazas.

Después de hablar, si alguien más juega, el que reparte MUST descartar una carta de su mano y quedarse el pinte, que todos ven hasta que lo juega.

#### Scenario: Coger la niña
- **WHEN** el primero en hablar coge la niña
- **THEN** su mano pasa a ser la niña, juega, y los siguientes ya no pueden cogerla

#### Scenario: Todos pasan
- **WHEN** en una mano de 5 cartas todos menos el que reparte pasan
- **THEN** el que reparte se quita 5 fichas sin jugar la mano

#### Scenario: El que reparte se queda el pinte
- **WHEN** alguien juega y termina el hablar
- **THEN** el que reparte descarta una carta y el pinte pasa a su mano, a la vista de todos

### Requirement: Bazas y obligaciones del Rams
Solo MUST jugar las bazas quienes juegan la mano. Sale el primero que juega después del que reparte, y después quien gana cada baza. Al responder, cada jugador MUST:
- seguir el palo de salida y superar la carta más alta de ese palo si puede;
- sin el palo, fallar con un triunfo y, si la baza ya la gana un triunfo, superarlo si puede;
- sin el palo, si no puede superar el triunfo que gana, echar un triunfo igualmente;
- sin el palo ni triunfos, echar cualquier carta.

#### Scenario: Echar triunfo sin poder superarlo
- **WHEN** un jugador no tiene el palo de salida, la baza la gana el Rey de triunfo y él solo tiene el 8 de triunfo y cartas de otro palo
- **THEN** tiene que echar el 8 de triunfo

#### Scenario: Seguir el palo subiendo
- **WHEN** se sale con la Jota de corazones y un jugador tiene el Rey y el 8 de corazones
- **THEN** solo puede echar el Rey de corazones

### Requirement: Fichas del Rams
Al acabar cada mano, cada jugador que la jugó MUST quitarse una ficha por cada baza que hizo, sin bajar de cero. Quien la jugó sin hacer ninguna baza MUST quedar «ramsé» y tomar 5 fichas de la canasta, que empieza la partida con 5 fichas por jugador; si quedan menos, MUST tomar las que queden, y si está vacía, ninguna. Las fichas que se quitan con las bazas no vuelven a la canasta. Los que pasaron MUST quedarse con sus fichas. Quien se queda sin fichas MUST retirarse de la partida.

#### Scenario: Bazas y fichas
- **WHEN** un jugador con 3 fichas juega y hace 2 bazas
- **THEN** se queda con 1 ficha

#### Scenario: Ramsé
- **WHEN** un jugador con 2 fichas juega y no hace ninguna baza, con la canasta llena
- **THEN** se queda con 7 fichas y la canasta tiene 5 menos

#### Scenario: Canasta vacía
- **WHEN** un jugador queda ramsé y la canasta está vacía
- **THEN** no toma ninguna ficha

### Requirement: Fin de la partida del Rams
La partida MUST terminar al acabar la mano tras la cual como mucho un jugador conserva fichas; ese jugador MUST perder. MUST ganar los que se quedaron sin fichas en la primera mano en que alguien lo consiguió.

#### Scenario: El último con fichas
- **WHEN** al acabar una mano solo un jugador conserva fichas
- **THEN** la partida termina, ese jugador pierde y gana quien se quedó antes sin fichas

### Requirement: Vista del jugador del Rams
La vista de cada jugador MUST mostrar:
- su mano y cuántas cartas tienen los demás;
- cuántas cartas tiene la niña y quién la cogió;
- el pinte y el triunfo, y si el que reparte ya se quedó el pinte;
- lo que ha dicho cada jugador en la mano;
- la baza en curso, la última baza, las bazas jugadas y cuántas lleva cada uno;
- las fichas de cada jugador, las que quedan en la canasta y los resultados de las manos anteriores.

La vista no MUST mostrar las cartas de las manos de los demás, de la niña ni la descartada por el que reparte.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista
- **THEN** ve su mano, el pinte y solo cuántas cartas tienen los demás y la niña
