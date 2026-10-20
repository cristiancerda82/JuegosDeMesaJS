## Context

La Pirámide acaba de fijar el molde de los solitarios cortos de una baraja:
- un estado con su tablero, `movimientos`, el `historial` para deshacer y `abandonada`;
- la vista con `situacion`;
- una pista en `ia/pistas.ts`, y `atascado`;
- una mesa con `BotonPista`, `AvisoAtasco`, el tiempo y los movimientos;
- los récords, que salen solos para los juegos sin IA.

El Golf es aún más simple. Solo hay dos acciones de juego, mover y robar, y el tablero son 7 columnas a la vista.

## Goals / Non-Goals

**Goals:**
- Golf completo: reparto, mover con o sin vuelta, robar, victoria, deshacer y abandonar.
- Pista con algo de previsión: elegir la carta que deja encadenar más.
- Mesa que cabe en 360 × 640.

**Non-Goals:**
- Los «hoyos» (varias manos con puntuación), las variantes de dos barajas y la de poner sobre una K.
- Juego en red.

## Decisions

### 1. Estado
`EstadoGolf`:
- `config: { vuelta: boolean }`;
- tablero:
  - `columnas: IdCarta[][]`, con la última carta al final;
  - `mazo: IdCarta[]`, que se roba del final;
  - `descarte: IdCarta[]`, con la de arriba al final;
- `movimientos`, `historial` y `abandonada`.

`encaja(carta, arriba, vuelta)`: la diferencia de valor es 1, o es 12 si hay vuelta (K con As).

### 2. Acciones
- `mover{columna}`: por cada columna con cartas cuya última carta encaja.
- `robar`: si queda mazo.
- `deshacer` y `abandonar`, como en la Pirámide.

Con las columnas vacías, `resultado` da `{ ganadores: [0] }`; con `abandonada`, `{ ganadores: [] }`.

### 3. Pista (`ia/pistas.ts`)
`pistaGolf`:
- para cada `mover`, calcula con una búsqueda en profundidad la cadena más larga que se podría hacer después sin robar, usando solo las columnas;
- la búsqueda está acotada a 5.000 nodos, que es de sobra y cabe en menos de 50 ms;
- elige el `mover` con la cadena más larga y, si empatan, el de la columna con más cartas, para no vaciar antes las cortas;
- si no hay `mover`, sugiere `robar`, y si no queda mazo, `null`.

### 4. Cliente
- **`MesaGolf.svelte`:**
  - 7 columnas de ancho `min(12.5vw, 70px)`, con el paso entre cartas de una columna al 28 % de la altura de la carta: se ve el índice de todas y 5 cartas ocupan 2,1 alturas;
  - debajo, el mazo (con su cuenta) y el descarte, con la de arriba grande y las anteriores asomando;
  - la última carta de cada columna que encaja se resalta y se mueve al tocarla; las demás no responden;
  - la barra (pista, deshacer, abandonar, movimientos y tiempo) es la de la Pirámide.
- **Registro:** `juegos.ts` (`DEF_GOLF`, con `pista: pistaGolf` e `ia: null`), el menú, las opciones (una casilla «con vuelta»), los textos, el fin y la guía.

## Risks / Trade-offs

- **[Partidas casi imposibles sin vuelta]** → el Golf sin vuelta se gana pocas veces; es lo clásico y lo que eligió el usuario. Con la casilla «con vuelta» es más fácil.
- **[Búsqueda de la pista]** → con 7 columnas de 5 cartas la cadena más larga cabe de sobra en el límite de nodos. Si se corta, la pista sigue siendo legal, aunque menos buena.
