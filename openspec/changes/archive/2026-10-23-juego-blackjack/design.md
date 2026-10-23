## Context

El Blackjack se parece a la Siete y media (fichas, apuesta por mano, pedir y plantarse, resumen entre manos), pero la banca no es un jugador: la juega el motor dentro de las transiciones, con una regla fija. Reutiliza:
- la baraja francesa, `barajar` y el azar del estado;
- las manos encadenadas con `resultadosManos` y un resumen que pausa la sesión (Cuatrola, Ocho loco);
- `porSimulacion` con una base experta, como el Ocho loco.

Lo nuevo es una banca automática, varias manos por jugador al separar, doblar y el valor blando del As.

## Goals / Non-Goals

**Goals:**
- Blackjack de 1 a 4 jugadores contra la banca, con doblar y separar, blackjack 3 a 2 y partida a un número de manos.
- IA normal sencilla, experta con la estrategia básica y difícil por simulación sobre la experta.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Seguro, rendición, varias barajas, resplit, doblar tras separar, banca humana.

## Decisions

### 1. Valores
- `valorBlackjack(cartas)` → `{ total, blanda }`: suma los ases como 1 y, si hay alguno y el total más 10 no pasa de 21, suma 10 y la mano es blanda.
- `esBlackjack(cartas, separada)`: dos cartas, no separada, total 21.
- «Mismo valor» para separar: el valor de la carta con J, Q y K como 10.

### 2. Estado y acciones
`EstadoBlackjack`:
- `config: { jugadores: 1..4, manos: 5 | 10 | 20 }`, `azar`;
- `fichas: number[]`, `activos: boolean[]` (quién juega la mano en curso: tenía al menos 2 fichas al empezarla);
- `fase: 'apuesta' | 'juego'`, `turno`, `manoActiva` (índice de la mano del jugador en turno);
- `apuestas: (number | null)[]`: la apuesta base de cada jugador en esta mano;
- `manos: ManoJugador[][]`, con `ManoJugador = { cartas, apuesta, doblada, separada, terminada }`;
- `banca: IdCarta[]` (la segunda es la tapada), `descubierta: boolean`, `miro: boolean` (miró la tapada y no tenía blackjack);
- `mazo`;
- `numeroMano`, `resultadosManos`.

Acciones: `apostar{fichas}`, `pedir`, `plantarse`, `doblar` y `separar`.

`accionesLegales`:
- en la apuesta, los pares de 2 a `min(20, fichas)`;
- en el juego, para la mano activa: `pedir` y `plantarse`; `doblar` si tiene 2 cartas, no está separada y le quedan fichas libres para otra apuesta igual (fichas − apuestas comprometidas); `separar` si tiene 2 cartas del mismo valor, el jugador no tiene ya dos manos y le quedan fichas libres.

Transiciones:
- **`apostar`:** guarda la apuesta; con la última, baraja, reparte (una a cada jugador, una a la banca, otra a cada jugador y la tapada a la banca) y mira el blackjack de la banca. Si lo tiene, se descubre y se liquida. Si no, las manos con blackjack quedan terminadas y el turno pasa a la primera mano sin terminar (o juega la banca si no queda ninguna).
- **`pedir`:** una carta a la mano activa; con más de 21 o con 21, la mano termina.
- **`plantarse`:** la mano termina.
- **`doblar`:** dobla la apuesta, una carta y la mano termina.
- **`separar`:** dos manos `separada: true` con una carta cada una y una carta nueva cada una; con ases, las dos terminan.
- Al terminar una mano, el turno pasa a la siguiente mano del jugador o al siguiente jugador activo. Cuando no queda ninguna, la banca descubre, pide hasta 17 (si alguna mano no se pasó), se liquida y se apunta el resultado. Si la partida no ha terminado, empieza la apuesta de la siguiente mano con `activos` recalculados.

`ResultadoManoBlackjack = { banca, valorBanca, manos: { cartas, apuesta, valor, resultado: 'gana' | 'blackjack' | 'empata' | 'pierde' | 'pasa' }[][], ganancias: number[], fichasTras: number[] }`.

### 3. Vista
- `fichas`, `activos`, `apuestas`, `manos` (todas boca arriba), `fase`, `turno`, `manoActiva`;
- `banca: (IdCarta | null)[]`: la tapada es `null` hasta que se descubre; `valorBanca` solo cuando está descubierta;
- `mazo` (número), `numeroMano`, `resultadosManos`;
- `miro`: público (todos ven si la banca miró), para la reconstrucción.

### 4. IAs
- **Normal** (`iaBlackjackBasica`): apuesta 10 (o la mayor legal); separa A-A y 8-8; dobla con 10 u 11; pide con 16 o menos y se planta con 17 o más.
- **Fácil:** `conErrores` sobre la normal.
- **Experta** (`iaBlackjackExperta`): apuesta como la normal y juega la estrategia básica de una baraja con la banca plantándose en 17 blando:
  - **parejas:** separa A-A y 8-8; 2-2, 3-3 y 7-7 contra 2–7; 6-6 contra 2–6; 9-9 contra 2–6, 8 y 9; nunca 5-5 ni 10-10;
  - **dobla** 11 siempre; 10 contra 2–9; 9 contra 3–6; A-2…A-7 blandas contra 4–6 (A-6 y A-7 también contra 3);
  - **duras:** 17 o más, planta; 13–16 planta contra 2–6; 12 planta contra 4–6; si no, pide;
  - **blandas:** 19 o más, planta; 18 planta contra 2–8; si no, pide.
- **Difícil:** `porSimulacion(iaBlackjackExperta, SIMULABLE_BLACKJACK)`:
  - `decideLaBase` en la apuesta;
  - `reconstruir`: baraja al azar las cartas que no se ven en la tapada de la banca y el mazo; si `miro` y la visible es un As, la tapada no vale 10; si la visible vale 10, la tapada no es un As;
  - `valorar`: las fichas que gana o pierde el asiento en la mano, más el bono de partida;
  - `manoTerminada`: cuando se apunta un resultado nuevo.

**Prueba de fuerza por fichas:** medido con las mismas cartas (2.000 partidas de 20 manos, jugando solo y apostando 10), la normal pierde 0,43 fichas por mano, la experta 0,10 y la difícil 0,06 (300 partidas). Pero en partidas de 10 manos esa diferencia casi no se nota en quién gana: la experta gana 504 de 1.000 partidas a la normal y la difícil 102 de 200. Por eso, y con el visto bueno del usuario, el Blackjack sale de la prueba de fuerza por partidas (`simula: false` en la tabla de niveles) y tiene la suya: la difícil, jugando sola 300 partidas de 20 manos, tiene que perder por mano al menos 0,15 fichas menos que la normal con las mismas semillas. Un test rápido comprueba lo mismo para la experta en 1.000 partidas.

### 5. Cliente
- **`MesaBlackjack.svelte`:** propia, no la de bazas:
  - arriba, la banca con sus cartas (dorso para la tapada) y su valor si se conoce;
  - debajo, los jugadores en filas: nombre, fichas, apuesta y sus manos con el valor (la activa resaltada); el propio, el último y más grande;
  - abajo, los botones según las acciones legales: en la apuesta, 2–20; en el juego, «Pedir», «Plantarse», «Doblar», «Separar».
- **`ResumenBlackjack.svelte`:** entre manos (pausando la sesión, como la Cuatrola): la banca, cada mano con su resultado y las fichas.
- **Pausas:** 600 ms tras cada carta que reparte la IA o la banca; la banca juega dentro de una sola transición, así que el resumen deja ver sus cartas.
- **Fin:** las fichas ordenadas y el resumen de la última mano.

## Risks / Trade-offs

- **[La banca juega de golpe]** → su turno es parte de la transición que cierra el de los jugadores; la mesa no anima carta a carta su juego, pero el resumen muestra todas sus cartas.
- **[Fuerza de la difícil]** → descrito arriba.
- **[Fichas impares]** → las apuestas son pares para que el 3 a 2 sea exacto; tras un empate o una pérdida las fichas pueden quedar impares, y la apuesta máxima se redondea al par inferior.
