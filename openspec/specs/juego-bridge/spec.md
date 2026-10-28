# juego-bridge Specification

## Purpose
TBD - created by archiving change juego-bridge. Update Purpose after archive.

## Requirements

### Requirement: Reparto del Bridge
El Bridge MUST jugarse con 4 jugadores en dos parejas (0 y 2 contra 1 y 3) y la baraja francesa de 52 cartas. En cada mano, el repartidor MUST dar 13 cartas a cada jugador. En la primera mano reparte el jugador 0, y el repartidor MUST rotar hacia la izquierda en cada mano que se juega.

#### Scenario: Reparto
- **WHEN** empieza una mano
- **THEN** cada jugador tiene 13 cartas y le toca pujar al repartidor

### Requirement: Subasta del Bridge
La subasta MUST empezar por el repartidor y seguir hacia la izquierda. En su turno, cada jugador MUST hacer una de estas declaraciones:
- **Pujar** un contrato: un nivel de 1 a 7 y una denominación (tréboles, diamantes, corazones, picas o sin triunfo, de menor a mayor). La puja MUST ser más alta que la anterior: de más nivel, o del mismo nivel con una denominación mayor.
- **Pasar.**
- **Doblar**, solo si la última puja es del rival y no está doblada.
- **Redoblar**, solo si la última puja es de su pareja, está doblada por el rival y no está redoblada.

Una puja nueva MUST anular el doblo y el redoblo anteriores. La subasta MUST terminar cuando, tras una puja, hay tres pases seguidos; el contrato es la última puja, con su doblo o redoblo. Si los cuatro pasan sin pujar, la mano MUST repartirse de nuevo con el mismo repartidor y la misma vulnerabilidad, sin contar como jugada.

#### Scenario: Puja más alta
- **WHEN** la última puja es 2 corazones
- **THEN** se puede pujar 2 picas, 2 sin triunfo o cualquier puja de nivel 3 o más, pero no 2 diamantes ni 1 sin triunfo

#### Scenario: Doblar y redoblar
- **WHEN** el jugador 1 puja 3 tréboles y el jugador 2 dobla
- **THEN** el jugador 3 puede redoblar, y el jugador 0 no puede volver a doblar

#### Scenario: Fin de la subasta
- **WHEN** tras la puja 4 picas del jugador 2 pasan los otros tres
- **THEN** el contrato es 4 picas de la pareja 0 y 2

#### Scenario: Todos pasan
- **WHEN** los cuatro pasan sin pujar
- **THEN** se reparten cartas nuevas, reparte el mismo jugador y la mano no cuenta para el Chicago

### Requirement: Declarante, salida y muerto del Bridge
El declarante MUST ser el jugador de la pareja del contrato que nombró primero en la subasta su denominación. La primera carta la MUST jugar el jugador a la izquierda del declarante. En cuanto se juega esa carta, la mano del compañero del declarante, el *muerto*, MUST quedar boca arriba a la vista de todos hasta el final de la mano. Cuando le toca jugar al muerto, MUST elegir la carta el declarante; el jugador del muerto no juega en esa mano.

#### Scenario: El declarante
- **WHEN** el jugador 0 puja 1 corazón, el 2 apoya con 3 corazones y la pareja se queda con 4 corazones que pujó el 2
- **THEN** el declarante es el 0, porque nombró antes los corazones, y el muerto es el 2

#### Scenario: El muerto se descubre
- **WHEN** el jugador a la izquierda del declarante juega la primera carta
- **THEN** todos ven la mano del muerto

#### Scenario: El declarante juega por el muerto
- **WHEN** le toca jugar al muerto
- **THEN** las acciones legales son las cartas del muerto, y las tiene el declarante

### Requirement: Bazas del Bridge
Cada jugador MUST seguir el palo de salida si tiene; si no, MAY jugar cualquier carta. La baza la MUST ganar el triunfo más alto o, si no hay triunfos, la carta más alta del palo de salida, con el As como la más alta. En los contratos sin triunfo no hay triunfo. Quien gana una baza MUST abrir la siguiente. La mano termina tras las 13 bazas.

#### Scenario: Seguir el palo
- **WHEN** salen diamantes y el jugador tiene diamantes
- **THEN** solo puede jugar diamantes

#### Scenario: Sin triunfo
- **WHEN** el contrato es 3 sin triunfo y un jugador sin el palo de salida juega un As de otro palo
- **THEN** no gana la baza

### Requirement: Puntuación de la mano del Bridge
Al acabar la mano, el contrato MUST cumplirse si la pareja del declarante hace al menos 6 bazas más el nivel del contrato. Si se cumple, esa pareja MUST sumar:
- **Bazas del contrato:** por cada nivel, 20 en tréboles y diamantes, 30 en corazones y picas, y en sin triunfo 40 la primera y 30 las demás. Se multiplican por 2 si está doblado y por 4 si está redoblado.
- **Manga o parcial:** si las bazas del contrato suman 100 o más, 300 sin vulnerabilidad o 500 con ella; si no, 50.
- **Slam:** con nivel 6, 500 sin vulnerabilidad o 750 con ella; con nivel 7, 1000 o 1500.
- **Por cumplir doblado:** 50 si está doblado y 100 si está redoblado.
- **Sobrebazas:** por cada baza de más, lo que vale una baza del contrato sin doblar; si está doblado, 100 sin vulnerabilidad o 200 con ella; si está redoblado, el doble.

Si no se cumple, la pareja rival MUST sumar, por las bazas que faltan:
- sin doblar, 50 por baza sin vulnerabilidad o 100 con ella;
- doblado sin vulnerabilidad, 100 la primera, 200 la segunda y la tercera, y 300 cada una de las siguientes;
- doblado con vulnerabilidad, 200 la primera y 300 cada una de las siguientes;
- redoblado, el doble que doblado.

El resultado de la mano MUST registrar el contrato, el declarante, si estaba doblado, las bazas de cada pareja, los puntos que suma cada pareja y el marcador tras la mano.

#### Scenario: Manga cumplida
- **WHEN** la pareja sin vulnerabilidad cumple 4 picas justas
- **THEN** suma 420

#### Scenario: Parcial con sobrebaza
- **WHEN** la pareja sin vulnerabilidad juega 2 corazones y hace 9 bazas
- **THEN** suma 140

#### Scenario: Doblado y multado
- **WHEN** una pareja vulnerable juega 4 picas doblado y hace 8 bazas
- **THEN** la pareja rival suma 500

#### Scenario: Gran slam
- **WHEN** una pareja vulnerable cumple 7 sin triunfo
- **THEN** suma 2220

### Requirement: Chicago y partida del Bridge
La partida MUST jugarse por ciclos de 4 manos (Chicago). La vulnerabilidad de cada mano del ciclo MUST ser:
1. nadie es vulnerable;
2. la pareja del repartidor es vulnerable;
3. la pareja del repartidor es vulnerable;
4. las dos parejas son vulnerables.

La configuración MUST permitir elegir 1, 2 o 3 ciclos (por defecto, 1). La partida MUST terminar al acabar el último ciclo; la gana la pareja con más puntos, y si tienen los mismos, es empate. Los puntos del resultado son los de cada pareja.

#### Scenario: Vulnerabilidad de la segunda mano
- **WHEN** empieza la segunda mano del ciclo y reparte el jugador 1
- **THEN** la pareja 1 y 3 es vulnerable y la 0 y 2 no

#### Scenario: Fin de la partida
- **WHEN** termina la cuarta mano de un ciclo con 1 ciclo configurado
- **THEN** la partida termina y la gana la pareja con más puntos

### Requirement: Vista del jugador en el Bridge
Cada jugador MUST ver:
- su mano;
- la mano del muerto, desde que se juega la primera carta;
- cuántas cartas tienen los demás;
- la subasta completa, el contrato, el declarante, el doblo o redoblo, y la vulnerabilidad;
- la baza en curso y la última baza;
- las cartas jugadas en la mano, y los palos que cada jugador no ha seguido en ella;
- las bazas de cada pareja, el marcador, la mano del ciclo y el resultado de las manos anteriores.

Las manos ajenas MUST quedar ocultas, salvo el muerto descubierto. En la vista del declarante, MUST indicarse cuándo le toca jugar por el muerto.

#### Scenario: Las manos ajenas no se ven
- **WHEN** un jugador pide su vista durante la subasta
- **THEN** no ve ninguna carta de las manos ajenas

#### Scenario: El muerto a la vista
- **WHEN** un defensor pide su vista después de la primera carta
- **THEN** ve las cartas del muerto, pero no las del declarante ni las de su compañero
