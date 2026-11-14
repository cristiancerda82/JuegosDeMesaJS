## ADDED Requirements

### Requirement: Torneo y ciegas del Póker de cinco cartas
El Póker de cinco cartas MUST jugarse de 2 a 6 jugadores (4 por defecto), cada uno por su cuenta, con la baraja francesa de 52 cartas barajada en cada mano. El torneo MUST seguir las reglas del Texas Hold'em de la suite:
- 100 fichas por jugador;
- las ciegas empiezan en 1/2 y suben cada 10 manos por la misma escala;
- el botón empieza en el asiento 0 y pasa en cada mano al siguiente jugador que sigue en la partida;
- la ciega pequeña la pone el siguiente al botón y la grande el siguiente a la pequeña; con 2 jugadores, el botón pone la pequeña.

En cada mano, cada jugador que sigue en la partida MUST recibir cinco cartas tapadas.

#### Scenario: Empezar el Póker de cinco cartas
- **WHEN** empieza una partida de 4 jugadores
- **THEN** cada uno tiene 5 cartas, el asiento 1 ha puesto 1 de ciega, el asiento 2 ha puesto 2 y le toca al asiento 3

### Requirement: Rondas de apuestas del Póker de cinco cartas
Cada mano MUST tener dos rondas de apuestas, con las acciones sin límite del Texas Hold'em (retirarse, pasar, igualar y apostar o subir, con la misma subida mínima y sin reabrir las apuestas tras un all-in corto):
1. **antes del descarte:** habla primero el siguiente a la ciega grande (con 2 jugadores, el botón);
2. **después del descarte:** habla primero el siguiente al botón que sigue en la mano y no está all-in.

Una ronda MUST terminar como en el Texas Hold'em. Si tras el descarte no quedan al menos dos jugadores que puedan apostar, no hay segunda ronda.

#### Scenario: La ciega grande puede subir
- **WHEN** antes del descarte todos igualan la ciega grande
- **THEN** la ciega grande todavía puede pasar o subir antes del descarte

#### Scenario: Habla primero el siguiente al botón
- **WHEN** empieza la segunda ronda con el botón en el asiento 0 y el asiento 1 se retiró
- **THEN** habla primero el asiento 2

### Requirement: Descarte del Póker de cinco cartas
Tras la primera ronda, cada jugador que sigue en la mano (también quien va all-in) MUST cambiar, en su turno y empezando por el siguiente al botón:
- de 0 a 3 cartas;
- o 4, si la que se queda es un As, que MUST quedar a la vista de todos.

Recibe del mazo tantas cartas como cambia. Si el mazo no tiene bastantes, MUST barajarse con los descartes de los jugadores anteriores. Todos MUST ver cuántas cartas cambió cada uno.

#### Scenario: Cambiar tres
- **WHEN** un jugador cambia tres cartas
- **THEN** sigue teniendo cinco y los demás ven que cambió tres

#### Scenario: Cuatro con un As
- **WHEN** un jugador tiene un As y quiere cambiar las otras cuatro
- **THEN** puede hacerlo y los demás ven su As

#### Scenario: Cuatro sin As
- **WHEN** un jugador quiere cambiar cuatro cartas y quedarse con una que no es un As
- **THEN** no puede

#### Scenario: Servido
- **WHEN** un jugador no cambia ninguna carta
- **THEN** los demás ven que va servido

### Requirement: Botes y showdown del Póker de cinco cartas
Si todos menos uno se retiran, ese jugador MUST llevarse todo el bote sin enseñar sus cartas.

Si no, tras la segunda ronda (o tras el descarte, si no hay segunda ronda), los que siguen en la mano MUST enseñar sus cinco cartas. Los botes se reparten como en el Texas Hold'em, con el valor de las manos de póker sobre las cinco cartas de cada uno:
- un bote principal y botes secundarios según lo que puso cada uno;
- en cada bote ganan solo quienes participan en él;
- en caso de empate, el bote se reparte, y la ficha que sobra va al primero después del botón.

#### Scenario: Gana la mejor mano
- **WHEN** en el showdown uno tiene doble pareja y otro trío
- **THEN** se lleva el bote el del trío

#### Scenario: Bote secundario
- **WHEN** A va all-in con 20, B y C ponen 50 cada uno, y A tiene la mejor mano y B la segunda
- **THEN** A gana el bote principal de 60 y B gana el secundario de 60

### Requirement: Eliminación y fin del Póker de cinco cartas
Al terminar cada mano, quien MUST tener 0 fichas queda eliminado y no recibe cartas en las siguientes. La partida MUST terminar cuando solo un jugador tiene fichas, que gana. El resultado de cada mano MUST quedar a la vista de todos:
- las manos enseñadas con su jugada;
- quién se lleva cada bote y cuánto;
- las fichas de cada uno.

#### Scenario: Ganar el torneo
- **WHEN** en una partida de 2 jugadores uno gana todas las fichas del otro
- **THEN** la partida termina y ese jugador gana

### Requirement: Vista del jugador del Póker de cinco cartas
La vista de cada jugador MUST mostrar:
- sus cinco cartas;
- de cada jugador:
  - sus fichas y su apuesta en la ronda;
  - si se ha retirado, si va all-in y si está eliminado;
  - cuántas cartas cambió y el As que enseñó;
- el botón, las ciegas, el número de mano, la fase, los botes y a quién le toca;
- las manos enseñadas en las manos anteriores.

MUST NOT mostrar:
- las cartas tapadas de los demás hasta que se enseñan en un showdown;
- qué cartas descartó cada uno;
- el orden del mazo.

#### Scenario: Cartas ajenas ocultas
- **WHEN** se pide la vista de un jugador tras el descarte
- **THEN** ve sus cinco cartas y cuántas cambió cada uno, pero no las cartas de los demás ni las que descartaron
