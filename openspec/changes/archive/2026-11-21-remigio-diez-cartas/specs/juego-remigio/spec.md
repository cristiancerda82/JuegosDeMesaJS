## ADDED Requirements

### Requirement: Remigio de diez cartas
El Remigio MUST tener la opción «Diez cartas», desactivada por defecto. Una partida sin la opción, también una guardada antes de este cambio, MUST jugarse como el Remigio de 7 cartas.

Con la opción:
- **Baraja:** dos barajas francesas de 52 cartas y 4 comodines (108 cartas). Hay dos copias de cada carta, que valen igual.
- **Reparto:** 10 cartas a cada jugador que sigue en la partida. El resto del reparto y el orden de juego no cambian.
- **Turno:** cada jugador roba (del mazo o del montón) y después descarta una carta o cierra. No se baja, no se añade a la mesa ni se cambian comodines. El mazo rehecho y la mano anulada siguen igual.
- **Cerrar:** en lugar de descartar, el jugador MAY cerrar soltando una carta al montón, siempre que las otras diez queden ligadas. Cerrar es opcional: el jugador MAY seguir jugando para buscar un cierre con premio.

#### Scenario: Reparto con diez cartas
- **WHEN** empieza una partida de 3 jugadores con la opción «Diez cartas»
- **THEN** cada uno tiene 10 cartas de la baraja francesa o comodines, el montón tiene 1 carta y el mazo 77

#### Scenario: Sin bajar con diez cartas
- **WHEN** con la opción «Diez cartas», un jugador que acaba de robar tiene tres cincos
- **THEN** sus acciones son descartar o cerrar, nunca bajar una combinación

#### Scenario: Partida guardada sin la opción
- **WHEN** se retoma una partida de Remigio creada sin la opción
- **THEN** se sigue jugando con 7 cartas y la baraja española

### Requirement: Cartas ligadas en el Remigio de diez cartas
Con la opción «Diez cartas», una carta queda ligada si forma parte de una de estas combinaciones:
- **Grupo:** 3 o más cartas del mismo número, de cualquier palo.
- **Escalera:** 3 o más cartas de números seguidos, de cualquier palo. El orden es A, 2, …, 10, J, Q, K, A: el As va abajo (A-2-3) o arriba (Q-K-A), pero una escalera no da la vuelta (K-A-2 no vale).

El comodín sustituye a cualquier carta. Cada combinación MUST llevar al menos 2 cartas naturales, y cada carta forma parte de una sola combinación.

Diez cartas MUST considerarse ligadas también si todas sus cartas naturales son del mismo palo o del mismo color (rojas o negras), aunque no formen combinaciones. Eso es un «color».

#### Scenario: Escalera de palos distintos
- **WHEN** las cartas son el 4 de picas, el 5 de corazones y el 6 de tréboles
- **THEN** forman una escalera

#### Scenario: El As arriba
- **WHEN** las cartas son la Q de diamantes, la K de picas y el As de corazones
- **THEN** forman una escalera

#### Scenario: Sin dar la vuelta
- **WHEN** las cartas son la K de picas, el As de picas y el 2 de picas
- **THEN** no forman una escalera

#### Scenario: Color
- **WHEN** las diez cartas son corazones y diamantes que no combinan entre sí
- **THEN** están ligadas: es un color rojo

### Requirement: Puntuación del Remigio de diez cartas
Con la opción «Diez cartas», al cerrar, quien cierra MUST sumar 0. Cada uno de los demás MUST sumar los puntos de las cartas que no puede ligar, eligiendo la forma de ligar que deja menos puntos:
- cada número vale lo que indica (el As, 1);
- la J vale 10, la Q 11 y la K 12;
- el comodín vale 25.

Esos puntos se MUST multiplicar según el cierre, por el mayor premio que cumplan las diez cartas de quien cierra:

| Cierre | Con comodines | Sin comodines |
|---|---|---|
| Ligadas | ×1 | ×2 |
| Color | ×3 | ×4 |
| Escalera de diez | ×5 | ×6 |
| Escalera de color (escalera de diez y color) | ×8 | ×10 |

La eliminación al pasar de 100 y el final de la partida no cambian. Además de lo que ya registra, el resultado de cada mano MUST registrar:
- la jugada con la que se cerró;
- si llevaba comodines;
- el multiplicador;
- las cartas sin ligar de cada jugador.

#### Scenario: Sumar solo lo que no se liga
- **WHEN** alguien cierra sin premio y con comodines, y a otro jugador le quedan tres sietes, el 9 de picas, la K de corazones y del 2 al 6 de palos variados
- **THEN** ese jugador suma 21 puntos (el 9 y la K)

#### Scenario: Cierre sin comodines
- **WHEN** un jugador cierra con diez cartas ligadas sin ningún comodín y a otro le quedan 15 puntos sin ligar
- **THEN** ese otro suma 30

#### Scenario: Escalera de color
- **WHEN** un jugador cierra con del 2 al J de picas, sin comodines
- **THEN** los demás suman diez veces sus puntos sin ligar
