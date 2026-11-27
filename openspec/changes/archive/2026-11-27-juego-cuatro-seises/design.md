## Context

Núñez Elvira describe Los cuatro seises así:
- se reparte toda la baraja, de una en una, entre 4 y 8 jugadores, «siempre común divisor de 40 o 48»;
- abre quien tiene el 6 de oros; después, cada uno pone el 5 o el 7 de un palo abierto, o un 6 que abra otro palo. Si no puede, pasa y paga al fondo;
- el orden es 12-11-10-7…1 con la de 40, y 12-11-10-9-8-7…1 con la de 48;
- todos ponen al empezar una cantidad igual en el fondo, y quien se queda antes sin cartas se lo lleva entero.

La suite ya tiene el Cinquillo:
- su mesa de cuatro escaleras (`MesaCinquillo`), con los tipos `EscaleraCinquillo` y `MesaCinquillo`;
- la regla de encajar una carta en las escaleras (`encajaEnMesa`);
- su IA básica, que valora cuántas cartas propias acerca una jugada y cuántos huecos abre a los demás;
- su reconstrucción, que reparte las manos ajenas al azar.

## Goals / Non-Goals

**Goals:**
- El Cuatro seises de Núñez, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Fondos con otras cantidades y la partida sin fin del libro: se juega a un número de manos.

## Decisions

### 1. Estado y acciones (`juegos/cuatro-seises.ts`)
- **Config:** `{ baraja: 40 | 48; jugadores: 4 | 5 | 6 | 8; manos: 1 | 3 | 5 }`, con los jugadores que dividen la baraja: 4, 5 u 8 con la de 40 y 4, 6 u 8 con la de 48. Por defecto, 40 cartas, 4 jugadores y 3 manos.
- **Orden y escaleras:**
  - `ordenCuatroSeises(baraja)`: As, 2… 7, Sota, Caballo y Rey con la de 40; con la de 48, también el 8 y el 9 entre el 7 y la Sota;
  - la mesa son los mismos tipos del Cinquillo: por palo, los extremos de su escalera (`null` si no se ha abierto);
  - la regla de encajar pasa a ser común (`encajaEnEscaleras(mesa, carta, orden, valorInicial)`), y `encajaEnMesa` del Cinquillo la usa con su orden y el 5.
- **Reparto:** toda la baraja, de una en una desde el siguiente al que reparte. El que reparte pasa al siguiente en cada mano, aunque no decide quién sale: sale quien tiene el 6 de oros, que es su única jugada.
- **Acciones:** `{ tipo: 'jugar'; carta }` y `{ tipo: 'pasar' }`, solo si no tiene ninguna carta que encaje, como en el Cinquillo.
- **El fondo:**
  - al repartir, cada jugador pone 1 ficha (`fondo` = jugadores);
  - cada pase pone 1 ficha más, y el estado cuenta los pases de cada uno en la mano;
  - al pasar, todos saben que no tiene ninguna de las cartas que encajaban: el estado las guarda para cada jugador (`noTiene`), y la vista las muestra, porque cualquiera que mire la mesa lo sabe;
  - quien se queda sin cartas se lleva el fondo: su mano vale `fondo − 1 − pases`, y la de los demás, `−1 − pases`. La suma de los saldos es siempre 0.
- **Fin:** al acabar la última mano. Ganan los de más fichas (pueden ser varios); `puntos` es el saldo de fichas.
- **Vista:**
  - la mesa, el fondo y los pases de cada uno en la mano;
  - cuántas cartas tienen los demás y la última acción;
  - los saldos y los resultados de las manos.

### 2. IAs
- **Normal (`ia/cuatro-seises-basica.ts`):**
  - la valoración de la IA del Cinquillo pasa a ser común (`valorarEnEscalera`), con el orden y la posición de la carta de la que nacen las escaleras;
  - la del Cuatro seises la usa con su orden. Un 6 sin cartas propias por detrás vale menos que casi cualquier otra jugada, así que lo guarda para bloquear, como aconseja el libro, y lo suelta cuando le abre camino a sus cartas.
- **Difícil (`ia/reconstruir/cuatro-seises.ts`):**
  - **Reconstrucción:** las manos ajenas al azar entre las cartas que no se ven, con su tamaño y con `repartirConPermitidos`, sin las cartas que cada uno no tiene por sus pases.
  - **Valoración:** lo que gana o paga en la mano menos la media de los demás, más `bonoPartida`.
- **Mediciones** (partidas de 4 jugadores con la baraja de 40 y 3 manos, la IA medida en un asiento contra las otras tres):

  | Duelo | Fichas de la IA | Partidas ganadas |
  |---|---|---|
  | Azar contra el azar | +155 | 68 de 200 |
  | Normal contra el azar | +885 | 105 de 200 |
  | Difícil contra el azar | +1273 | 108 de 200 |
  | Difícil contra la normal | +294 | 88 de 300, con 66 ms como máximo por decisión |

  Con el presupuesto habitual (150 simulaciones) la difícil no se distinguía de la normal; como cada mano se simula muy deprisa, usa 600 (80 reconstrucciones). Con 1200 no mejora más.

### 3. Cliente
- **`MesaEscaleras.svelte`:** la mesa del Cinquillo, generalizada sin cambiar lo que muestra:
  - las filas de cada palo con el orden que se le pasa y los huecos donde se puede jugar;
  - los rivales, con el texto que da cada juego junto a cada uno;
  - la mano propia, el botón de pasar, el turno y el aviso de la última jugada;
  - el resumen de cada mano, como un snippet de cada juego.
- **`MesaCinquillo.svelte`:** usa la mesa común con su orden, sus textos y su resumen; sus E2E no cambian.
- **`MesaCuatroSeises.svelte`:**
  - la mesa común con 10 o 12 huecos por fila, que se estrechan para caber en 360 px;
  - junto a cada jugador, sus cartas y sus fichas; en la barra, el fondo, la mano y tus fichas;
  - el aviso de quién pasa y paga;
  - el resumen de cada mano: quién se lleva el fondo, los pases de cada uno, lo que gana o paga y el saldo.
- **Fin:** la clasificación por fichas y el resumen de la última mano.
- **Menú:** familia «Descarte», con 12 juegos.
- **Guía:**
  - ejemplos comprobados con el motor: las cartas que se pueden poner en una mesa dada y la cuenta del fondo de una mano;
  - los consejos de Núñez;
  - la historia, como pariente del Cinquillo.

## Risks / Trade-offs

- **Mesa común con el Cinquillo** → refactorizar una mesa que funciona puede romperla; sus E2E y sus capturas deben quedar igual.
- **8 jugadores** → 7 rivales en el móvil: la fila de rivales se parte en dos líneas, y con 5 o 6 cartas por jugador la mano cabe de sobra.
- **Valor de las fichas** → el libro deja la cantidad a los jugadores; con 1 ficha al empezar y 1 por pase, el fondo premia a quien obliga a pasar a los demás, que es lo que busca el bloqueo.
