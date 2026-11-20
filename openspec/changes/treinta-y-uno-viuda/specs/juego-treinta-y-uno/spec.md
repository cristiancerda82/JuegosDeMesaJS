## ADDED Requirements

### Requirement: Treinta y uno con viuda
El Treinta y uno MAY jugarse con la opción «Con viuda» (desactivada por defecto). Una partida o una sala sin esa opción MUST jugarse como siempre.

Con viuda:
- **Reparto:** en cada ronda, MUST repartirse 3 cartas a cada jugador con vidas y ponerse 3 boca arriba en la mesa, la viuda; el resto queda como mazo y no hay descarte.
- **Turno:** el jugador MUST hacer una de estas cosas:
  - cambiar una de sus cartas por una de la viuda;
  - cambiar sus tres cartas por las tres de la viuda;
  - pasar;
  - plantarse, si nadie se ha plantado aún en la ronda.
- **Viuda nueva:** si todos los jugadores con vidas pasan seguidos, la viuda MUST apartarse y ponerse 3 cartas nuevas del mazo. Si el mazo no tiene bastantes, las viudas apartadas se barajan y se ponen debajo del mazo.
- **Lo demás no cambia:**
  - plantarse y el último turno de los demás;
  - el máximo de 8 vueltas;
  - el valor de las manos;
  - las vidas y el fin de la partida.

La vista MUST mostrar la viuda y las cartas que cada jugador cogió de ella y aún tiene. Las demás cartas ajenas siguen ocultas.

#### Scenario: Reparto con viuda
- **WHEN** empieza la primera ronda con 4 jugadores y la viuda
- **THEN** cada uno tiene 3 cartas, hay 3 boca arriba en la viuda y 37 en el mazo

#### Scenario: Cambiar una
- **WHEN** el jugador cambia su 4 de tréboles por el As de picas de la viuda
- **THEN** tiene el As de picas, el 4 de tréboles queda en la viuda y le toca al siguiente

#### Scenario: Cambiar las tres
- **WHEN** el jugador cambia sus tres cartas por las de la viuda
- **THEN** tiene las tres que había en la viuda y la viuda tiene las tres suyas

#### Scenario: Pasan todos
- **WHEN** con 3 jugadores pasan los tres seguidos
- **THEN** la viuda se aparta y se ponen tres cartas nuevas del mazo

#### Scenario: Partida sin la opción
- **WHEN** se empieza una partida sin la opción de la viuda
- **THEN** hay descarte y mazo, y se roba y se descarta como siempre
