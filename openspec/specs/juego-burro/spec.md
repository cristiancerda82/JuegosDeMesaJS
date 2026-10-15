# juego-burro Specification

## Purpose
TBD - created by archiving change juego-burro. Update Purpose after archive.

## Requirements

### Requirement: Jugadores y reparto
El Burro MUST jugarse con 3, 4 o 5 jugadores, cada uno por su cuenta. En cada mano MUST elegirse al azar, con la semilla de la partida, tantos números distintos de la baraja española de 40 cartas como jugadores, y usarse las 4 cartas de cada uno de ellos (una por palo). Esas cartas MUST barajarse y repartirse 4 a cada jugador.

#### Scenario: Reparto con 4 jugadores
- **WHEN** empieza una mano con 4 jugadores
- **THEN** se reparten 16 cartas de 4 números distintos, las 4 de cada número, y cada jugador tiene 4

#### Scenario: Número de jugadores inválido
- **WHEN** se intenta crear una partida con 2 o con 6 jugadores
- **THEN** se rechaza con un error

### Requirement: Pase simultáneo
Mientras nadie se ha plantado, cada jugador que aún no ha elegido MUST poder elegir una carta de su mano para pasar, todos a la vez y sin orden. La carta elegida MUST quedar oculta para los demás. Cuando todos han elegido, cada jugador MUST pasar su carta al siguiente (del asiento `a` al `a + 1`, y del último al primero) y recibir la del anterior, todos a la vez. Un jugador que ya ha elegido MUST NOT poder cambiar su elección.

#### Scenario: Intercambio completo
- **WHEN** los 4 jugadores han elegido una carta
- **THEN** cada uno da la suya al siguiente y recibe la del anterior, y todos vuelven a tener 4 cartas

#### Scenario: Esperar a los demás
- **WHEN** un jugador ya ha elegido su carta y otros no
- **THEN** ese jugador no tiene acciones legales hasta el intercambio

### Requirement: Plantarse
Mientras nadie se ha plantado, un jugador con las 4 cartas de un mismo número MUST poder plantarse en lugar de elegir carta. Un jugador sin 4 iguales MUST NOT poder plantarse el primero. En cuanto alguien se planta, las elecciones pendientes de pase MUST anularse y todos los que no se han plantado MUST poder plantarse, sin más condición. Cuando solo queda un jugador sin plantarse, la mano MUST terminar y ese jugador MUST sumar una letra.

#### Scenario: Plantarse con cuatro iguales
- **WHEN** un jugador tiene los cuatro sietes y nadie se ha plantado
- **THEN** puede plantarse, y desde ese momento los demás solo pueden plantarse

#### Scenario: Sin cuatro iguales no se planta el primero
- **WHEN** nadie se ha plantado y un jugador no tiene 4 cartas del mismo número
- **THEN** plantarse no está entre sus acciones legales

#### Scenario: El último lleva letra
- **WHEN** con 4 jugadores se han plantado 3
- **THEN** la mano termina y el cuarto suma una letra

### Requirement: Mano nula
Si se completan 50 intercambios en una mano sin que nadie se plante, la mano MUST anularse sin sumar letras a nadie y MUST repartirse una nueva.

#### Scenario: Cincuenta intercambios
- **WHEN** se completa el intercambio número 50 de una mano y nadie se ha plantado
- **THEN** la mano se anula sin letras y empieza otra

### Requirement: Letras y fin de la partida
Cada mano perdida MUST sumar una letra de B-U-R-R-O. Cuando un jugador completa las 5 letras, la partida MUST terminar: ese jugador es el burro y pierde, y todos los demás ganan. Si no, MUST repartirse la mano siguiente.

#### Scenario: Quinta letra
- **WHEN** un jugador con B-U-R-R pierde una mano
- **THEN** la partida termina, él es el burro y los demás ganan

### Requirement: Vista del Burro
La vista de un jugador MUST mostrar:
- su mano, la carta que ha elegido para pasar, la que pasó y la que recibió en el último intercambio;
- quién ha elegido ya su carta, sin cuál;
- quién se ha plantado y en qué orden;
- las letras de cada jugador, el número de mano y de intercambio;
- el resultado de la última mano: quién se plantó primero y con qué 4 cartas, el orden de los demás y quién llevó letra, o que fue nula.

La vista MUST NOT mostrar las cartas de los demás ni las que han elegido para pasar.

#### Scenario: Cartas ajenas ocultas
- **WHEN** un jugador consulta su vista durante el pase
- **THEN** ve su mano y cuántos han elegido, pero no las cartas de los demás ni las que van a pasar
