# juego-corazones Specification

## Purpose
TBD - created by archiving change juego-corazones. Update Purpose after archive.

## Requirements

### Requirement: Reparto y pase
La partida MUST jugarse con la baraja francesa y de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta. Para que el reparto salga igual, MUST quitarse:
- con 3 jugadores, el 2 de diamantes (17 cartas a cada uno);
- con 4, ninguna (13 a cada uno);
- con 5, el 2 de diamantes y el 2 de picas (10 a cada uno);
- con 6, el 2 y el 3 de diamantes y de picas (8 a cada uno).

En cada mano se MUST repartir todas las cartas que quedan.

Con 4 jugadores y el pase activado (por defecto), antes de jugar cada jugador MUST elegir 3 cartas de su mano, que recibe:
- en la primera mano, el jugador siguiente en el orden de juego;
- en la segunda, el anterior;
- en la tercera, el de enfrente;
- en la cuarta no hay pase, y vuelta a empezar.

Con 3, 5 o 6 jugadores no hay pase.

Las cartas pasadas MUST entregarse cuando los cuatro han elegido. Un jugador MUST NOT ver qué cartas han elegido los demás hasta recibir las suyas.

#### Scenario: Pase al siguiente
- **WHEN** en la primera mano el asiento 0 pasa el As, el Rey y la Q de picas
- **THEN** cuando los cuatro han elegido, esas tres cartas están en la mano del asiento 1 y no en la del 0

#### Scenario: Mano sin pase
- **WHEN** empieza la cuarta mano
- **THEN** se juega directamente, sin fase de pase

#### Scenario: Tres jugadores
- **WHEN** empieza una partida de 3 jugadores
- **THEN** cada uno tiene 17 cartas, el 2 de diamantes no está en ninguna mano y se juega sin pase

#### Scenario: Seis jugadores
- **WHEN** empieza una partida de 6 jugadores
- **THEN** cada uno tiene 8 cartas y no están el 2 ni el 3 de diamantes ni de picas

### Requirement: Salida y bazas
- **Salida:** la primera baza de cada mano la MUST abrir el jugador que tiene el 2 de tréboles, y MUST jugarlo.
- **Juego de cartas:** cada jugador MUST seguir el palo de salida si lo tiene. Gana la baza la carta más alta del palo de salida, del As (la más alta) al 2. No hay triunfo. Quien gana la baza sale en la siguiente.
- **Primera baza:** en la primera baza de la mano, MUST NOT poder echarse corazones ni la Q de picas, salvo que el jugador no tenga otra carta.
- **Corazones rotos:** MUST NOT poder salirse con un corazón hasta que alguien haya echado uno en la mano, salvo que el jugador solo tenga corazones.

#### Scenario: Sale el 2 de tréboles
- **WHEN** empieza el juego de una mano y el asiento 2 tiene el 2 de tréboles
- **THEN** su única jugada legal es el 2 de tréboles

#### Scenario: Seguir el palo
- **WHEN** se sale con diamantes y el jugador tiene diamantes
- **THEN** solo puede jugar diamantes

#### Scenario: Sin puntos en la primera baza
- **WHEN** en la primera baza un jugador no tiene tréboles pero tiene corazones, la Q de picas y otros diamantes
- **THEN** solo puede jugar diamantes

#### Scenario: Corazones sin romper
- **WHEN** a un jugador le toca salir, nadie ha echado corazones y tiene corazones y picas
- **THEN** no puede salir con corazones

### Requirement: Puntuación de la mano
Al jugarse todas las bazas, cada jugador MUST sumar 1 punto por cada corazón y 13 por la Q de picas de las bazas que se llevó. Si un jugador se llevó los 26 puntos (tiró la luna), MUST sumar 0 y cada uno de los demás sumar 26. El resultado de la mano MUST registrar los puntos de cada jugador, quién tiró la luna y los totales.

#### Scenario: Puntos de una mano
- **WHEN** un jugador se lleva 5 corazones y la Q de picas
- **THEN** suma 18 puntos en esa mano

#### Scenario: Tirar la luna
- **WHEN** un jugador se lleva los 13 corazones y la Q de picas
- **THEN** él suma 0 y cada uno de los demás suma 26

#### Scenario: La luna con 5 jugadores
- **WHEN** en una partida de 5 un jugador tira la luna
- **THEN** cada uno de los otros cuatro suma 26

### Requirement: Fin de la partida
Al terminar una mano en la que algún jugador llega a 100 puntos (opción: 50), la partida MUST terminar. Ganan el jugador o jugadores con menos puntos.

#### Scenario: Llegar a 100
- **WHEN** al terminar una mano los totales son 102, 64, 40 y 79
- **THEN** la partida termina y gana el jugador con 40

### Requirement: Vista de los Corazones
La vista de cada jugador MUST mostrar:
- su mano y el número de cartas de los demás;
- la fase (pase o juego) y a quién se pasa;
- las cartas que él eligió para pasar y las que recibió;
- la baza en curso y la anterior;
- si los corazones están rotos;
- los puntos de cada uno en la mano y los totales;
- los resultados de las manos anteriores.

MUST NOT mostrar las cartas en mano de los demás ni las que han elegido para pasar.

#### Scenario: Manos ajenas ocultas
- **WHEN** se pide la vista de un jugador durante el pase o el juego
- **THEN** no contiene ninguna carta de la mano de los demás ni de su pase
