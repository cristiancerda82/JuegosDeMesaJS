## Context

El Tysiącha se parece al Préférence:
- tres jugadores;
- una subasta;
- un talón que se enseña y pasa al declarante;
- bazas con la obligación de seguir y de triunfar.

Se diferencia en:
- la baraja de 24 con puntos de cartas (As 11, 10 10…);
- que el declarante da cartas a los rivales en vez de descartarse;
- que no hay triunfo hasta el primer matrimonio, y cada matrimonio lo cambia;
- que los rivales también anotan;
- el barril y la partida a 1000.

Se reaprovechan:
- del Préférence: el esquema de subasta y viuda, y la reconstrucción con `repartirConPermitidos` y `fallos`;
- del Schnapsen: los cantes;
- la mesa de bazas compartida (`MesaBazas`) con 3 jugadores;
- el esquema de niveles con `decideLaBase` fuera de las bazas.

## Goals / Non-Goals

**Goals:**
- Tysiącha para 3 a 1000, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El bolt, los cuatro Ases, la rospis, el matrimonio de Ases y las variantes para 2 y 4.

## Decisions

### 1. Cartas (`juegos/tysiacha.ts`)
- **Baraja:** `BARAJA_TYSIACHA`, la francesa de 9 a As (ids `picas-9` … `picas-1`).
- **Orden:** `rangoTysiacha(c)`: As 6, 10 5, K 4, Q 3, J 2, 9 1.
- **Puntos:** `puntosCartaTysiacha(c)`.
- **Matrimonios:** `MATRIMONIO_TYSIACHA`: corazones 100, diamantes 80, tréboles 60, picas 40.
- **Cartas legales:** `cartasLegalesTysiacha(mano, mesa, triunfo)`.
  - Al salir, todas.
  - Al responder, las del palo de salida si tiene.
  - Si no, los triunfos si hay triunfo y tiene.
  - Si no, todas.

### 2. Fases y acciones
- **Fases:** `'subasta' | 'dar' | 'contrato' | 'bazas'`.
- **Acciones:**
  - `pujar` (sube 5) y `pasar` (en `subasta`);
  - `dar { carta }`: una por acción, primero al rival que sigue al declarante y luego al otro;
  - `fijar { valor }`: el contrato, de la puja al tope de 5 en 5;
  - `jugar { carta }`: en `bazas`.
- **Apertura obligada:** al repartir, la puja de 100 del que sigue al que reparte se registra en `crear` y en el reparto de cada mano. La subasta empieza con el turno del siguiente.
- **Fin de la subasta:** cuando dos han pasado.
  - El prikup se marca como enseñado y pasa a la mano del declarante.
  - Fase `dar`.
- **Cantar:** automático. Al jugar `jugar` como primera carta de la baza un K o una Q cuya pareja sigue en la mano, si el jugador tiene alguna baza ganada en la mano, se canta: se suma el matrimonio y cambia el triunfo antes de resolver la baza.
- **Fin de la mano:** tras la octava baza se puntúa y se reparte de nuevo, salvo que la partida haya terminado.

### 3. Puntuación y barril
- **`puntuarManoTysiacha`:** devuelve lo que anota cada uno, el redondeo de los rivales (`redondear5`, con el 2,5 hacia arriba) y los nuevos marcadores.
- **Barril:**
  - `barril: (number | null)[]`: manos que lleva cada uno en el barril, o `null` si no está.
  - Tras anotar, en este orden:
    1. si el declarante cumple y llega a 1000, gana;
    2. quien está en el barril y no era declarante no cambia, y se le suma una mano;
    3. si el declarante en el barril falla, resta y sale del barril;
    4. quien llega a 880 o más sin ganar se queda en 880 y entra en el barril con 0 manos;
    5. quien llega a 3 manos baja a 760 y sale del barril.
  - El declarante en el barril que cumple un contrato que no le lleva a 1000 (de 100 a 115) no anota, y también suma una mano.
- **Límite de manos:** `MANOS_MAXIMAS_TYSIACHA` (100). Si se llega sin ganador, gana el mejor marcador. Evita partidas sin fin entre IAs que no cumplen.

### 4. Estado y vista
- **Config:** `{ jugadores: 3; meta?: number }`. La meta (1000 por defecto) va en la config solo por las pruebas. El cliente juega siempre a 1000.
- **Estado:**
  - `repartidor`, `manos`, `prikup`, `prikupVisto`, `fase`, `turno`;
  - `pujas` (la última de cada uno, o `'paso'`), `puja`, `declarante`, `contrato`;
  - `dadas` (la carta dada a cada rival);
  - `triunfo`, `matrimonios` (asiento y palo), `mesa`, `salida`, `ultimaBaza`;
  - `jugadas`, `fallos` (por jugador: palos no seguidos y `'triunfo'`), `bazasGanadas`, `puntosMano`;
  - `marcador`, `barril`, `resultadosManos`, `azar`.
- **Vista:**
  - su mano;
  - cuántas cartas tiene cada uno;
  - el prikup si está enseñado (si no, `null`);
  - su carta en `dadas` (las dos si es el declarante; la otra, `null`);
  - todo lo público.

  El prikup enseñado se queda en la vista toda la mano, como la viuda del Préférence. `ultimaBaza` se vacía al repartir.
- **`ResultadoManoTysiacha`:**
  - `declarante`, `contrato`, `cumplido`;
  - `puntosCartas`, `matrimonios`, `anotado`;
  - `marcadorTras`, `barrilTras`.

### 5. IAs
- **Normal (`ia/tysiacha-basica.ts`):** las reglas de la spec, con `valorManoTysiacha(mano)`.
- **Difícil (`ia/reconstruir/tysiacha.ts`):** `SIMULABLE_TYSIACHA`.
  - **Reconstrucción:** con `repartirConPermitidos`, con los tamaños de cada mano y del prikup oculto.
    - Las cartas conocidas se fijan antes: el prikup enseñado, las cartas dadas, las parejas de los matrimonios cantados.
    - Se respetan los `fallos`.
  - **`decideLaBase`:** fuera de la fase `bazas` (pujar, dar y fijar).
  - **Valoración:** lo que anota el asiento en la mano menos la media de los otros dos, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 40 y `presupuesto` 400, sin horizonte (la mano dura 24 cartas). La difícil gana 96 de 200 partidas contra dos normales (la parte justa son 67), con 99 ms como máximo.

### 6. Cliente
- **`MesaTysiacha.svelte`:** sobre `MesaBazas` con 3 jugadores, a partir de `MesaPreference`.
  - **Subasta:** botones «Pujar N» y «Pasar», y la puja de cada uno junto a su asiento.
  - **Prikup:** las 3 cartas, boca abajo o enseñadas.
  - **Dar:** el aviso «Toca la carta para <nombre>» y la carta tocada se da.
  - **Contrato:** un selector con los valores posibles y «Fijar».
  - **Información:** el triunfo, los matrimonios cantados, el contrato, los puntos de la mano y el marcador con el barril.
- **`ResumenTysiacha.svelte`:** la tabla de la mano y los marcadores.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.
- **Sala en red:** de 3 jugadores, como el Préférence.

## Risks / Trade-offs

- **Partidas largas** (a 1000, unas 15 a 25 manos) → los E2E de la partida completa usan `rapido`. Las pruebas del motor usan la meta en la config para partidas cortas.
- **Cantar automático** → quita una decisión al jugador, pero cantar siempre es lo que conviene. Así la acción de jugar sigue siendo una sola.
