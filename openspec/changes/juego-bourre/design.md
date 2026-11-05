## Context

El Bourré junta dos cosas que la suite ya tiene:
- las bazas con triunfo vuelto y obligación de ganar y de fallar, como en el Écarté;
- las fichas y el bote, como en el Hold'em.

Lo propio es:
- la decisión de jugar o pasar cada mano;
- el cambio de cartas para varios jugadores;
- el bourré, que obliga a pagar el bote si no se hace ninguna baza;
- el bote que se arrastra.

Se reaprovechan:
- la mesa de bazas compartida (`MesaBazas`) para 5, como el Sheepshead;
- el cambio carta a carta del Écarté (descartar y luego robar);
- la reconstrucción con `repartirConPermitidos` y los fallos.

## Goals / Non-Goals

**Goals:**
- Bourré para 5 con 100 fichas y 15 manos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Otros números de jugadores, subir apuestas y las obligaciones de jugar.

## Decisions

### 1. Cartas (`juegos/bourre.ts`)
- **Baraja:** la francesa de 52.
- **Rango:** `rangoBourre`, del 2 (2) al As (14).
- **Cartas legales:** `cartasLegalesBourre(mano, mesa, triunfo)`.
  - **Al salir:** si tiene el As de triunfo, solo el As; si no, todas.
  - **Con el palo:** las del palo que superan a la ganadora de ahora (si la ganadora es un triunfo y el palo no lo es, ninguna la supera: todas las del palo); si no hay, todas las del palo.
  - **Sin el palo, con triunfos:** los que superan al triunfo más alto de la baza; si no hay, todos los triunfos.
  - **Si no:** todas.
- **Ganadora:** `ganadoraBourre`, como en el resto de juegos con triunfo.

### 2. Fases y acciones
- **Fases:** `'decidir' | 'cambio' | 'bazas'`.
- **Acciones:**
  - `jugar` y `pasar` (en `decidir`);
  - `descartar { carta }` y `robar` (en `cambio`: una carta por acción; `robar` cierra su cambio, también con 0);
  - `jugarCarta { carta }` (en `bazas`).
- **Activos:** `activos`, los asientos con fichas al empezar la mano; los demás no reciben cartas y se saltan.
- **Orden:** `ordenDesde(repartidor)` con los activos. `juega: (boolean | null)[]` por asiento.
- **Tras decidir todos:**
  - con 0 que juegan, se cierra la mano y el bote queda;
  - con 1, se lleva el bote;
  - si no, pasa a `cambio` con el primero que juega.
- **Tras el cambio de todos:** `bazas`, y sale el primero que juega desde el siguiente al que reparte.
- **Vuelta:** `vuelta: IdCarta`, la última carta del que reparte. `descartar` no la admite.

### 3. Bote y fichas
- **`fichas`** por asiento y **`bote`**. Al repartir, cada activo pone 1.
- **Al cerrar las bazas:**
  - `boteJugado` es el bote al empezar las bazas;
  - el que más bazas hizo, si es único, se lleva `bote`;
  - cada jugador que jugó con 0 bazas paga `min(fichas, boteJugado)`, que va al bote siguiente.
- **`ResultadoManoBourre`:**
  - `repartidor`, `triunfo`, `juegan`, `bazas`;
  - `ganador` (o `null`), `bourre` (asientos);
  - `bote` (el que se jugó), `cambioFichas`, `fichasTras`, `boteTras`.
- **Fin:** tras `config.manos` manos (15; menos en las pruebas), o con un solo jugador con fichas. Gana quien tiene más fichas.

### 4. Estado y vista
- **Config:** `{ jugadores: 5; manos: number; fichas: number }`, con 15 y 100 por defecto.
- **Estado:**
  - `repartidor`, `activos`, `manos`, `mazo`, `descartes`, `vuelta`;
  - `fase`, `turno`, `juega`, `cambiadas` (cuántas cambió cada uno, o `null` si aún no), `cambiando`;
  - `mesa`, `ultimaBaza`, `jugadasPor`, `fallos`, `bazas`;
  - `fichas`, `bote`, `boteJugado`, `resultadosManos`, `azar`.
- **Vista:**
  - la mano propia y cuántas cartas tiene cada uno;
  - cuántas quedan en el mazo;
  - la vuelta;
  - todo lo público (salvo los descartes, que no se enseñan).

  `ultimaBaza` se vacía al repartir.

### 5. IAs
- **Normal (`ia/bourre-basica.ts`):** las reglas de la spec, con `bazasEsperadasBourre`.
- **Difícil (`ia/reconstruir/bourre.ts`):** `SIMULABLE_BOURRE`.
  - **Reconstrucción:**
    - con `repartirConPermitidos`, entre las manos ajenas (también las de quien pasó), los descartes y el mazo;
    - la vuelta va a la mano del que reparte si no la ha jugado;
    - se respetan los fallos.
  - **`decideLaBase`:** solo en el cambio. Jugar o pasar también se simula: decidiéndolo como la normal, la difícil ganaba 55 de 200 partidas contra cuatro normales, y simulándolo, 63.
  - **Valoración:** el cambio de fichas del asiento en la mano, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 60 y `presupuesto` 600. La difícil gana 68 de 200 partidas contra cuatro normales (la parte justa son 40), con 85 ms como máximo.

### 6. Cliente
- **`MesaBourre.svelte`:** sobre `MesaBazas` con 5 jugadores, a partir de `MesaSheepshead` y `MesaEcarte`.
  - **Decidir:** botones «Jugar» y «Pasar».
  - **Cambio:** las cartas tocadas se descartan y luego «Cambiar N» o «No cambiar».
  - **Información:** la vuelta (`MazoYMuestra`, con el mazo), el triunfo, el bote, mis fichas y la mano de las 15.
  - **Detalle de cada asiento:** «Juega», «Pasa», cuántas cambió, sus bazas y sus fichas.
- **`ResumenBourre.svelte`:** la línea de quién se lleva el bote (o si se queda), los bourrés y la tabla de bazas, el cambio de fichas y las fichas.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.

## Risks / Trade-offs

- **El bote puede crecer mucho con varios bourrés seguidos** → es la gracia del juego. Las fichas no bajan de 0 y la partida tiene 15 manos como máximo.
- **Jugadores eliminados** → no reciben cartas. La mesa los muestra sin mano y con 0 fichas.
