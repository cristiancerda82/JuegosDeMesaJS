# juego-pinacle Specification

## Purpose
TBD - created by archiving change juego-pinacle. Update Purpose after archive.

## Requirements

### Requirement: Baraja, jugadores y reparto del Pinacle
El Pinacle MUST jugarse con dos barajas francesas de 52 cartas y 4 comodines (108 cartas). Hay dos copias de cada carta, que valen igual.
- **Jugadores:** 2, o 4 en dos parejas. En la partida de 4, los compañeros MUST sentarse enfrente: los asientos 0 y 2 contra los asientos 1 y 3.
- **Reparto:** en cada mano se MUST barajar con el azar de la partida y repartir 11 cartas a cada jugador. Una carta MUST quedar boca arriba para empezar el montón de descartes, y el resto forma el mazo.
- **Turnos:** el repartidor MUST rotar un asiento en cada mano, y empieza el jugador siguiente al repartidor.

#### Scenario: Reparto de 2 jugadores
- **WHEN** empieza una mano de 2 jugadores
- **THEN** cada uno tiene 11 cartas, el montón tiene 1 carta boca arriba y el mazo tiene 85

#### Scenario: Parejas enfrentadas
- **WHEN** se juega con 4 jugadores
- **THEN** los asientos 0 y 2 forman un bando y los asientos 1 y 3 el otro

### Requirement: Comodines y valor de las cartas
Los 4 comodines y los 8 doses MUST ser comodines: pueden sustituir a cualquier carta en una combinación. Un dos MUST NOT contar nunca como carta natural.

Las cartas MUST valer:
- comodín: 30;
- dos: 20;
- As: 15;
- 8, 9, 10, J, Q y K: 10;
- 3, 4, 5, 6 y 7: 5.

#### Scenario: Valor de una combinación sencilla
- **WHEN** un jugador baja el grupo K♠, K♥ y un dos
- **THEN** la combinación vale 40 (10 + 10 + 20)

### Requirement: Turno del Pinacle
En su turno, el jugador MUST primero robar, y solo puede hacerlo de una de estas dos formas:
- **Del mazo:** la carta de arriba del mazo.
- **Del montón:** se lleva **todo** el montón de descartes. Solo es legal si la carta de arriba del montón puede bajarse en ese turno: formando una combinación nueva con cartas de su mano, o añadiéndola a una combinación de su bando. Tras llevarse el montón, lo primero que baje el jugador MUST llevar esa carta, y MUST NOT descartar hasta haberla bajado.

Después de robar puede bajar combinaciones nuevas, añadir cartas a las de su bando y cambiar comodines, tantas veces como quiera. El turno MUST terminar al descartar una carta en el montón, o al quedarse sin cartas.

Las cartas del montón son públicas: la vista MUST mostrar el montón entero. Las que un jugador se ha llevado del montón y siguen en su mano MUST verse en la vista de todos como cartas conocidas de ese jugador.

#### Scenario: Robar del mazo
- **WHEN** el jugador roba del mazo
- **THEN** recibe la carta de arriba del mazo y el montón no cambia

#### Scenario: Llevarse el montón
- **WHEN** el montón tiene 5 cartas, con un 9♦ arriba, y el jugador tiene 9♣ y 9♠
- **THEN** puede llevarse las 5 cartas, y su primera jugada tiene que bajar el 9♦ antes de poder descartar

#### Scenario: Montón que no se puede bajar
- **WHEN** la carta de arriba del montón no puede formar una combinación con la mano del jugador ni añadirse a ninguna combinación de su bando
- **THEN** el jugador no puede llevarse el montón y tiene que robar del mazo

### Requirement: Combinaciones del Pinacle
Las combinaciones MUST ser de dos clases, de 3 cartas o más:
- **Grupo:** cartas del mismo número, de cualquier palo, del 3 al As. Un grupo MUST tener como mucho 11 cartas.
- **Escalera:** cartas seguidas del mismo palo, en el orden 3, 4, …, 10, J, Q, K, As. El As MUST ir solo por arriba, y una escalera MUST tener como mucho 12 cartas (del 3 al As).

Toda combinación MUST tener al menos 2 cartas naturales. Fuera de eso, puede llevar cualquier número de comodines.

En una escalera, cada comodín MUST ocupar un puesto concreto (un hueco o un extremo), que elige quien lo baja. Ese puesto no puede quedar por debajo del 3 ni por encima del As.

Un jugador MUST poder añadir cartas a las combinaciones de su bando (en la partida de 2, a las suyas) y MUST NOT poder añadirlas a las del bando rival.

#### Scenario: Grupo con comodines
- **WHEN** un jugador baja 7♣, 7♦, un comodín y un dos
- **THEN** es un grupo legal de cuatro sietes

#### Scenario: Una sola carta natural
- **WHEN** un jugador intenta bajar 7♣, un comodín y un dos
- **THEN** la jugada no es legal

#### Scenario: Escalera con hueco
- **WHEN** un jugador baja 5♥, un comodín en el puesto del 6 y 7♥
- **THEN** es una escalera legal del 5 al 7 de corazones

#### Scenario: El As va arriba
- **WHEN** un jugador intenta bajar As♠, un dos en el puesto del 2 y 3♠
- **THEN** la jugada no es legal

#### Scenario: Añadir a la pareja
- **WHEN** en la partida de 4 el compañero tiene bajado un grupo de reinas y el jugador tiene una reina
- **THEN** puede añadirla a ese grupo, pero no a un grupo de reinas del bando rival

### Requirement: Cambiar un comodín
Un jugador MUST poder cambiar un comodín de una combinación de su bando por la carta natural que lo sustituye, si la tiene en la mano. Cada comodín se puede cambiar una sola vez, y el cambio tiene premio.
- **En una escalera:** la carta natural ocupa el puesto del comodín, y el comodín pasa a un extremo de la escalera, el que elija el jugador. Si no cabe en ningún extremo, no se puede cambiar.
- **En un grupo:** la carta natural se añade al grupo y el comodín se queda en él, marcado como cambiado.

#### Scenario: Cambio en una escalera
- **WHEN** el bando tiene la escalera 8♠, comodín (en el puesto del 9), 10♠ y el jugador tiene el 9♠
- **THEN** puede poner el 9♠ en su sitio y llevar el comodín al puesto del 7 o al de la J

#### Scenario: Escalera completa
- **WHEN** la escalera va del 3 al As y el jugador tiene la carta natural de uno de sus comodines
- **THEN** no puede hacer el cambio

### Requirement: Barbelé
Un bando que empieza la mano con 750 puntos o más MUST estar barbelé durante esa mano. Su primera bajada de la mano MUST sumar al menos 70 puntos, contando el valor de las cartas que se bajan en ese turno.

Si al terminar ese turno no llega a 70:
- las cartas que bajó en el turno MUST volver a la mano del jugador;
- el bando MUST perder 50 puntos.

Antes de descartar con una bajada que no llega a 70, la mesa MUST avisar al jugador.

#### Scenario: Primera bajada suficiente
- **WHEN** un bando con 820 puntos baja en su primer turno de bajada un grupo de Ases y una escalera que suman 75
- **THEN** las combinaciones se quedan en la mesa

#### Scenario: Primera bajada insuficiente
- **WHEN** un bando con 820 puntos baja solo un grupo de tres sietes (15 puntos) y descarta
- **THEN** los tres sietes vuelven a la mano del jugador y el bando pasa a tener 770 puntos

### Requirement: Fin de la mano del Pinacle
La mano MUST terminar en cuanto un jugador se queda sin cartas, sea bajando o descartando: ese jugador cierra. Si alguien roba la última carta del mazo, la mano MUST terminar cuando ese jugador acaba su turno, aunque nadie haya cerrado.

#### Scenario: Cerrar descartando
- **WHEN** un jugador baja todas sus cartas menos una y la descarta
- **THEN** cierra y la mano termina

#### Scenario: Se acaba el mazo
- **WHEN** un jugador roba la última carta del mazo y descarta sin cerrar
- **THEN** la mano termina sin cierre

### Requirement: Combinaciones con premio
Al terminar la mano, cada combinación MUST valer la suma de sus cartas, salvo las combinaciones con premio, que MUST valer su premio en lugar de sus cartas.

**Grupos.** Si un grupo cumple varias condiciones, vale la primera de la lista:
1. **Pinacle:** 11 cartas. Vale 3000 si se bajaron todas en el mismo turno y 1500 si se bajaron en varios turnos.
2. **Sin comodines, de Ases:** 8 valen 1000, 7 valen 400 y 6 valen 300.
3. **Sin comodines, de K, Q o J:** 8 valen 750, 7 valen 300 y 6 valen 200.
4. **Sin comodines, de otro número:** 8 valen 50 más el valor de sus cartas.
5. **6 cartas con un solo comodín:** de Ases, 180; de K, Q o J, 120.

**Escaleras completas**, del 3 al As (12 cartas):
- sin comodines: 1000;
- con un comodín, que sea un comodín o un dos de su palo: 800;
- con dos comodines, comodines o doses de su palo: 750;
- con más comodines, o con un dos de otro palo: 550 (escalera sucia).

#### Scenario: Ocho Ases limpios
- **WHEN** un bando termina la mano con un grupo de los 8 Ases sin comodines
- **THEN** el grupo vale 1000

#### Scenario: Pinacle poco a poco
- **WHEN** un bando termina la mano con un grupo de 11 reyes bajado en varios turnos
- **THEN** el grupo vale 1500

#### Scenario: Escalera con un dos de su palo
- **WHEN** un bando termina la mano con la escalera de corazones del 3 al As con el 2♥ en el puesto del 9
- **THEN** la escalera vale 800

#### Scenario: Escalera sucia
- **WHEN** la escalera completa de corazones lleva el 2♣ en un puesto
- **THEN** vale 550

### Requirement: Puntuación de la mano del Pinacle
Al terminar la mano, cada bando MUST sumar:
- el valor de sus combinaciones;
- **por cerrar:** 20 puntos;
- **por cerrar sin comodín:** si en el turno en que cierra el jugador no baja ni añade ningún comodín, las combinaciones nuevas de ese turno valen el doble;
- **por cerrar de golpe:** si el jugador cierra bajando en un solo turno todas sus cartas, sin haber bajado nada antes en la mano, se dobla todo lo que suma su bando en la mano. Se cuadruplica si no ha usado ningún comodín. Este premio sustituye a los otros dos premios por cerrar;
- **por cada comodín cambiado:** 30 si era un comodín, y si era un dos, 15 en una escalera y 30 en un grupo.

Después MUST restar el valor de las cartas que les quedan en la mano a sus jugadores, también al bando que cierra si el compañero aún tiene cartas. La mesa MUST mostrar este desglose para cada bando.

#### Scenario: Puntuación con cierre
- **WHEN** un jugador cierra con combinaciones que valen 180, sin cerrar de golpe ni sin comodín, y su rival tiene combinaciones de 90 y 35 puntos en la mano
- **THEN** el bando que cierra suma 200 y el rival suma 55

#### Scenario: Cerrar de golpe sin comodines
- **WHEN** un jugador que no había bajado nada en la mano baja todas sus cartas en un turno, sin comodines, con combinaciones que valen 95
- **THEN** su bando suma 380 en la mano (95 × 4), sin los 20 de cerrar

### Requirement: Fin de la partida del Pinacle
La partida MUST terminar al acabar la mano en la que algún bando llega a 1500 puntos o más. Gana el bando con más puntos; si los dos bandos empatan en lo más alto, es empate. Los puntos acumulados pueden ser negativos.

#### Scenario: Llegar a 1500
- **WHEN** al terminar una mano un bando tiene 1620 y el otro 1480
- **THEN** la partida termina y gana el bando de 1620
