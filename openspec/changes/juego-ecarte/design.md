## Context

El Écarté se parece al Piquet:
- dos jugadores con 32 cartas francesas;
- un cambio de cartas con el montón antes de las bazas;
- bazas con un orden de palos propio.

Se diferencia en:
- el triunfo vuelto;
- el orden K, Q, J, As, 10…;
- la obligación de ganar y de fallar;
- la negociación de proponer y aceptar, que puede repetirse;
- el castigo de jugar de autoridad;
- partidas cortas a 5 puntos.

Se reaprovechan:
- el modelo del Piquet: descartar carta a carta y robar, la reconstrucción con `repartirConPermitidos` y `fallos`;
- su mesa sobre `MesaBazas`;
- el esquema de niveles con `decideLaBase` fuera de las bazas del Préférence.

## Goals / Non-Goals

**Goals:**
- Écarté de 2 a 5 puntos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Las apuestas de los mirones, otras metas y el anuncio opcional del rey.

## Decisions

### 1. Cartas (`juegos/ecarte.ts`)
- **Baraja:** `BARAJA_ECARTE`, la francesa del 7 al As.
- **Orden:** `rangoEcarte(c)`: K 8, Q 7, J 6, As 5, 10 4, 9 3, 8 2, 7 1.
- **Cartas legales:** `cartasLegalesEcarte(mano, mesa, triunfo)`.
  - Al salir, todas.
  - Al responder, del palo de salida: las que ganan si hay alguna; si no, todas las del palo.
  - Sin el palo, los triunfos.
  - Si no, todas.
- **Ganadora:** gana el triunfo si la segunda es triunfo y la primera no; si no, la más alta del palo de salida.

### 2. Fases y acciones
- **Fases:** `'cambio' | 'respuesta' | 'descarte' | 'bazas'`.
- **Acciones:**
  - `proponer` y `jugar` (el mano en `cambio`);
  - `aceptar` y `rehusar` (el que reparte en `respuesta`);
  - `descartar { carta }` y `robar` (en `descarte`, primero el mano y luego el que reparte);
  - `jugarCarta { carta }` (en `bazas`).
- **Descarte:** como en el Piquet, una carta por acción.
  - El mano puede robar tras descartarse de 1 o más.
  - El que reparte puede robar con 0.
  - Ninguno se descarta de más de lo que queda en el montón.
  - Tras robar el que reparte, vuelve a `cambio`, o a `bazas` si el montón está vacío.
- **Autoridad:** `autoridad: Asiento | null`. Se pone:
  - con `jugar` si aún no hubo ninguna propuesta;
  - con `rehusar` si es la primera propuesta.

  `propuestas` cuenta cuántas ha habido.
- **Rey:**
  - `reyVuelto` si la vuelta es un rey;
  - `rey: Asiento | null`, quien lo anunció. Al jugar su primera carta de las bazas, si tiene el rey de triunfo en la mano (antes de echar la carta), se anota 1 y queda público.
- **Resultado de la mano:** guarda el palo del triunfo y no la vuelta, y `ultimaBaza` se vacía al repartir: esas cartas pueden estar ocultas en la mano siguiente.
- **Fin inmediato:** `anotar(e, asiento, n)` suma a `puntos`. Si alguien llega a la meta, la mano se cierra a medias con su resultado, como en el Cuarenta, para que la pantalla de fin tenga resumen.

### 3. Estado y vista
- **Config:** `{ meta: 5 }`. La meta va en la config por las pruebas; el cliente juega siempre a 5.
- **Estado:**
  - `repartidor`, `vuelta`, `manos`, `monton`, `descartes` por jugador;
  - `fase`, `turno`, `propuestas`, `autoridad`, `reyVuelto`, `rey`;
  - `mesa`, `ultimaBaza`, `jugadas` (las cartas de las bazas de la mano), `bazas`, `fallos` (por jugador: palos no seguidos y `'triunfo'`);
  - `puntos`, `resultadosManos`;
  - `azar`.
- **Vista:** su mano y sus descartes, cuántas cartas tiene y ha descartado el otro, y todo lo público (vuelta, montón, fase, propuestas, autoridad, rey, bazas, fallos, resultados y puntos).
- **`ResultadoManoEcarte`:**
  - `repartidor`, `triunfo`, `reyVuelto`, `rey`, `autoridad`, `bazas`;
  - `ganador`, `vole`, `puntosMano`, `puntosTras`;
  - `completa: false` si la partida terminó antes de las bazas.

### 4. IAs
- **Normal (`ia/ecarte-basica.ts`):** las reglas de la spec, con `bazasEsperadasEcarte(mano, triunfo)`.
- **Difícil (`ia/reconstruir/ecarte.ts`):** `SIMULABLE_ECARTE`.
  - **Reconstrucción:** con `repartirConPermitidos`, la mano del rival, el montón y los descartes del rival al azar, con su tamaño y sin los palos ni triunfos que el rival no siguió (`fallos`). Si el rival anunció el rey de triunfo y no lo ha jugado, va a su mano.
  - **Simula todas las decisiones:** sin `decideLaBase`. Al principio decidía el cambio y el descarte como la normal y solo simulaba las bazas, pero el carteo del Écarté está casi siempre forzado y la difícil apenas ganaba (163 de 300 partidas). Lo que decide la mano es el cambio.
  - **Valoración:** los puntos que gana el asiento con la mano menos los del otro, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 60 y `presupuesto` 400. La mano dura 10 cartas, así que no hace falta horizonte. La difícil gana a la normal 173 de 300 partidas (107 ms como máximo); con más reconstrucciones y solo las bazas simuladas se quedaba en 165.

### 5. Cliente
- **`MesaEcarte.svelte`:** a partir de `MesaPiquet`, sobre `MesaBazas` con 2 jugadores.
  - **Vuelta y montón:** con `MazoYMuestra`.
  - **Cambio:** botones «Proponer» y «Jugar», o «Aceptar» y «Rehusar».
  - **Descarte:** se toca cada carta que se quiere cambiar (se descarta al tocarla, como en el Piquet) y luego «Cambiar» (robar).
  - **Información:** el triunfo, quién juega de autoridad, el rey anunciado, las bazas de cada uno y los puntos.
- **`ResumenEcarte.svelte`:** bazas de cada uno, el rey vuelto o anunciado, la autoridad, los puntos de la mano y de la partida.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.

## Risks / Trade-offs

- **Las propuestas podrían repetirse sin fin** → no pasa, porque cada cambio aceptado gasta al menos una carta del montón (el mano se descarta de 1 como mínimo).
