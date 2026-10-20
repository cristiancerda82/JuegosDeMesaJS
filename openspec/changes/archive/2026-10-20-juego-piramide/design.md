## Context

Los tres solitarios que hay comparten forma:
- un `Estado` con un tablero, `movimientos`, un `historial` de tableros para deshacer y `abandonada`;
- acciones de juego más `deshacer` y `abandonar`;
- una vista con `situacion: 'jugando' | 'victoria' | 'abandono'`;
- en `ia/pistas.ts`, una función de pista por juego y `atascado`;
- en el cliente, su mesa con `BotonPista`, `AvisoAtasco`, el tiempo y los movimientos, y los récords en las estadísticas.

La Pirámide sigue ese molde. Lo único nuevo es la disposición en pirámide, que en 360 px tiene que caber con 7 cartas en la fila más ancha.

## Goals / Non-Goals

**Goals:**
- Pirámide completa: reparto, cartas libres, parejas y reyes, mazo con pasadas, victoria al vaciar la pirámide, deshacer y abandonar.
- Pista y detección de atasco.
- Récords en las estadísticas.
- Mesa que cabe en 360 × 640.

**Non-Goals:**
- Las variantes del «Fuera de alcance» de la propuesta.
- Juego en red (ningún solitario lo tiene).

## Decisions

### 1. Estado
`EstadoPiramide`:
- `config: { pasadas: 1 | 3 | null }` (`null` es sin límite);
- tablero:
  - `piramide: (IdCarta | null)[]` de 28 posiciones, fila a fila (la fila `f` empieza en `f(f+1)/2`); `null` es un hueco;
  - `mazo: IdCarta[]`, que se roba del final;
  - `descarte: IdCarta[]`, con la carta de arriba al final;
  - `vueltas`: las veces que ya se ha dado la vuelta al descarte;
- `movimientos`, `historial` y `abandonada`.

Posiciones y tapado:
- `tapadoras(p)` da las dos posiciones de la fila siguiente;
- `libre(p)` exige que la carta esté y que no esté ninguna de sus tapadoras, o que sea de la última fila.

### 2. Acciones
- `quitar{cartas: Sitio[]}`, con uno o dos sitios. Un `Sitio` es `{ piramide: number }` o `{ descarte: true }`.
- `robar`, `reciclar`, `deshacer` y `abandonar`.

`accionesLegales`:
- genera las K libres solas y todas las parejas libres que suman 13; como mucho hay 8 cartas libres, así que son pocas;
- `robar` si queda mazo;
- `reciclar` si el mazo está vacío, hay descarte y quedan vueltas (`pasadas === null || vueltas < pasadas − 1`);
- `deshacer` si hay historial;
- `abandonar` siempre.

Al reciclar, el descarte invertido pasa a ser el mazo, para que se robe en el mismo orden que la primera vez.

### 3. Fin
- `resultado`: con la pirámide vacía, `{ ganadores: [0] }`; con `abandonada`, `{ ganadores: [] }`.
- Con la partida terminada no hay acciones legales.

La vista lleva `vueltasRestantes` (`null` si no hay límite), y el descarte entero, porque todas sus cartas se han visto.

### 4. Pista (`ia/pistas.ts`)
`puntosPiramide`:
- una pareja de dos cartas de la pirámide: 100 más 10 por cada carta que libera;
- una pareja con una carta de la pirámide: 60 más lo que libera;
- una K de la pirámide: 80 más lo que libera;
- quitar solo del descarte (una K): 20.

Liberar cuenta las cartas que pasan a estar libres. Si no hay ningún `quitar`, la pista sugiere `robar`, después `reciclar` y, si no, `null`. `atascado` funciona sin cambios.

### 5. Cliente
- **`MesaPiramide.svelte`:**
  - la pirámide es una rejilla de 7 filas centradas; el ancho de carta es `min(12.5vw, 70px)` y cada fila sube un 55 % de la altura de una carta sobre la anterior, así que las filas se solapan;
  - debajo van el mazo (con las vueltas que quedan) y el descarte, en abanico de las 3 últimas;
  - **selección:** la primera carta libre que se toca queda elegida. Al tocar una segunda carta, se quitan las dos si forman pareja; si no, queda elegida la nueva. Una K se quita al tocarla. Tocar otra vez la carta elegida la suelta;
  - las cartas tapadas se ven más apagadas;
  - los botones (deshacer, pista, abandonar), el tiempo, los movimientos y el aviso de atasco son los del Spider.
- **Registro:** `juegos.ts` (`DEF_PIRAMIDE`, con `pista: pistaPiramide` y `ia: null`), el menú, las opciones (pasadas: 3, 1, ilimitadas), los textos, la guía y los récords. Las estadísticas usan la lista de solitarios que ya existe, a la que se añade `piramide`.

## Risks / Trade-offs

- **[La pirámide no cabe en 360 px]** → 7 cartas de 12,5vw (45 px) más los huecos ocupan unos 330 px. El E2E de 360 × 640 lo comprueba.
- **[Muchas parejas legales]** → como mucho hay 8 cartas libres, 28 parejas; es trivial.
- **[Deshacer con historial grande]** → el tablero es pequeño (52 cartas). Un historial de tableros completos, como en el Spider, cuesta poco.
