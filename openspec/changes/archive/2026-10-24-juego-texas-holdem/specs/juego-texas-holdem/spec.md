## ADDED Requirements

### Requirement: Torneo y ciegas del Texas Hold'em
El Texas Hold'em MUST jugarse de 2 a 6 jugadores (4 por defecto), cada uno por su cuenta, con la baraja francesa de 52 cartas barajada en cada mano. Cada jugador MUST empezar con 100 fichas. Las ciegas MUST empezar en 1/2 y subir cada 10 manos por esta escala: 1/2, 2/4, 3/6, 5/10, 10/20, 15/30, 25/50, 50/100, 100/200; después se quedan en 100/200.

En la primera mano el botón es del asiento 0. En cada mano siguiente, el botón pasa al siguiente jugador que sigue en la partida. La ciega pequeña la pone el siguiente al botón y la grande el siguiente a la pequeña; con 2 jugadores, el botón pone la pequeña y el otro la grande. Quien no tiene fichas para la ciega entera pone las que tiene y queda all-in.

#### Scenario: Empezar el Texas Hold'em
- **WHEN** empieza una partida de 4 jugadores
- **THEN** cada uno tiene 2 cartas y 100 fichas menos su ciega: el asiento 1 ha puesto 1, el asiento 2 ha puesto 2, y le toca al asiento 3

#### Scenario: Ciegas que suben
- **WHEN** empieza la mano 11
- **THEN** las ciegas son 2/4

#### Scenario: Ciegas con 2 jugadores
- **WHEN** empieza una partida de 2 jugadores
- **THEN** el asiento 0 tiene el botón, pone la ciega pequeña y habla primero antes del flop

### Requirement: Rondas de apuestas del Texas Hold'em
Cada mano MUST tener hasta cuatro rondas de apuestas:
1. **antes del flop**, tras repartir dos cartas tapadas a cada jugador;
2. **flop**, tras descubrir tres cartas comunes;
3. **turn**, tras descubrir la cuarta;
4. **river**, tras descubrir la quinta.

Antes del flop habla primero el siguiente a la ciega grande; en las demás rondas, el primero después del botón que sigue en la mano y no está all-in. Una ronda MUST terminar cuando todos los que siguen en la mano y no están all-in han actuado desde la última subida completa y han igualado la apuesta más alta (o están all-in). Las apuestas de la ronda pasan entonces al bote.

#### Scenario: Habla después de la ciega grande
- **WHEN** antes del flop todos igualan la ciega grande
- **THEN** la ciega grande todavía puede pasar o subir antes de que se descubra el flop

#### Scenario: Pasar el flop
- **WHEN** en el flop todos pasan
- **THEN** se descubre el turn y empieza otra ronda

### Requirement: Acciones sin límite
En su turno, el jugador MUST poder:
- **retirarse**, y deja la mano;
- **pasar**, si no hay apuesta que igualar;
- **igualar** la apuesta más alta de la ronda, o ir all-in con todas sus fichas si no le llegan;
- **apostar o subir** hasta cualquier cantidad total en la ronda entre la subida mínima y todas sus fichas. La subida mínima es la apuesta más alta más la última subida completa de la ronda, y la apuesta mínima es la ciega grande. Ir all-in siempre se puede, aunque no llegue al mínimo.

Una subida all-in que no llega a una subida completa MUST NOT reabrir las apuestas: los que ya habían actuado y la igualaron antes solo pueden igualarla o retirarse.

#### Scenario: Subida mínima
- **WHEN** antes del flop con ciegas 1/2 el primero sube a 6
- **THEN** el siguiente, para volver a subir, tiene que llegar al menos a 10

#### Scenario: All-in corto
- **WHEN** un jugador sube a 10, otro iguala y un tercero va all-in con 13
- **THEN** el que subió a 10 solo puede igualar los 13 o retirarse, no volver a subir

### Requirement: Botes y showdown del Texas Hold'em
Si todos menos uno se retiran, ese jugador MUST llevarse todo el bote sin enseñar sus cartas.

Si no, cuando terminan las apuestas (tras el river, o en cuanto ya no queda nadie que pueda apostar, descubriendo las cartas comunes que falten) los jugadores que siguen en la mano MUST enseñar sus cartas. El bote se MUST dividir en un bote principal y botes secundarios según lo que puso cada uno: en cada bote solo participan quienes pusieron al menos esa cantidad. Cada bote se lo lleva la mejor mano de cinco cartas, entre las siete de cada uno (sus dos y las cinco comunes), de los que participan en él y no se retiraron. Si empatan varios, se reparte a partes iguales, y la ficha que sobra va al primero de ellos después del botón.

#### Scenario: Bote secundario
- **WHEN** A va all-in con 20, B y C ponen 50 cada uno, y A tiene la mejor mano y B la segunda
- **THEN** A gana el bote principal de 60 y B gana el secundario de 60

#### Scenario: Reparto por empate
- **WHEN** dos jugadores empatan con la misma escalera un bote de 41 fichas
- **THEN** cada uno se lleva 20 y la ficha que sobra va al primero de ellos después del botón

#### Scenario: Todos all-in antes del river
- **WHEN** antes del flop los dos jugadores que quedan van all-in
- **THEN** se descubren las cinco cartas comunes sin más apuestas y se enseñan las manos

### Requirement: Valor de las manos de póker
Las manos de cinco cartas MUST ordenarse, de mayor a menor:
1. **escalera de color**: cinco seguidas del mismo palo;
2. **póker**: cuatro del mismo número;
3. **full**: un trío y una pareja;
4. **color**: cinco del mismo palo;
5. **escalera**: cinco seguidas;
6. **trío**;
7. **doble pareja**;
8. **pareja**;
9. **carta alta**.

El As cuenta alto (10-J-Q-K-A) o bajo (A-2-3-4-5, la escalera más baja); las escaleras no dan la vuelta (Q-K-A-2-3 no). Entre dos manos de la misma clase se MUST desempatar por las cartas que forman la jugada y después por las demás, de mayor a menor. Los palos no desempatan.

#### Scenario: La mejor mano entre siete
- **WHEN** un jugador tiene el As y la K de corazones, y en la mesa están la Q, la J y el 10 de corazones, el 2 de picas y el 2 de tréboles
- **THEN** su mejor mano es una escalera de color, aunque también tenga doble pareja de doses

#### Scenario: Escalera baja
- **WHEN** una mano es A-2-3-4-5 y otra es 2-3-4-5-6
- **THEN** gana la que llega al 6

#### Scenario: Desempate por la carta más alta
- **WHEN** dos jugadores tienen pareja de reyes y sus otras cartas son A-9-4 y A-8-7
- **THEN** gana el de A-9-4

### Requirement: Eliminación y fin del Texas Hold'em
Al terminar cada mano, quien MUST tener 0 fichas queda eliminado y no recibe cartas en las siguientes. La partida MUST terminar cuando solo un jugador tiene fichas, que gana. El resultado de cada mano (cartas comunes, manos enseñadas con su jugada, quién se lleva cada bote y cuánto, y las fichas de cada uno) MUST quedar a la vista de todos.

#### Scenario: Eliminación
- **WHEN** un jugador va all-in con sus últimas fichas y pierde el bote
- **THEN** queda eliminado y la siguiente mano se reparte sin él

#### Scenario: Ganar el torneo
- **WHEN** en una partida de 2 jugadores uno gana todas las fichas del otro
- **THEN** la partida termina y ese jugador gana

### Requirement: Vista del jugador del Texas Hold'em
La vista de cada jugador MUST mostrar:
- sus dos cartas;
- las cartas comunes descubiertas;
- de cada jugador, sus fichas, su apuesta en la ronda, si se ha retirado, si va all-in y si está eliminado;
- el botón, las ciegas, el número de mano, los botes y a quién le toca;
- las manos y jugadas enseñadas en las manos anteriores.

MUST NOT mostrar las cartas tapadas de los demás hasta que se enseñan en un showdown, ni las cartas comunes que faltan por descubrir, ni las de quien ganó sin enseñar.

#### Scenario: Cartas ajenas ocultas
- **WHEN** se pide la vista de un jugador durante el turn
- **THEN** ve sus dos cartas y las cuatro comunes, pero no las de los demás ni el river
