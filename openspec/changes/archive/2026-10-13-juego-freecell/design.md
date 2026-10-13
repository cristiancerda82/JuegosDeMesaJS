## Context

El Klondike ya tiene en el motor la baraja francesa, el modelo de pilas (`c0…c6`, `f0…f3`, `descarte`), el historial para deshacer, el autocompletar, el abandono y la vista de solitario (`situacion`, `movimientos`). En el cliente, `MesaKlondike.svelte` aporta la interacción por arrastre y toque (`Interaccion`), las animaciones FLIP, el contador de tiempo y la pantalla de fin de solitario. El FreeCell tiene toda la información a la vista, así que no hay oráculo de cartas ocultas que respetar: la vista es el estado sin el historial.

## Goals / Non-Goals

**Goals:**
- FreeCell completo con reparto numerado compatible con Microsoft, supermovimientos, movimiento automático seguro, deshacer y autocompletar.
- Reutilizar en el cliente la interacción y el estilo del Klondike.

**Non-Goals:**
- Pistas, un resolvedor dentro del producto y estadísticas.
- Variantes como Baker's Game o Eight Off.

## Decisions

### 1. Reparto de Microsoft
Generador congruencial lineal: `semilla = (semilla × 214013 + 2531011) mod 2^31` y `rand = semilla >> 16`. Las cartas se numeran de 0 a 51 con `palo = i mod 4` (tréboles, diamantes, corazones, picas) y `valor = ⌊i / 4⌋ + 1`. El reparto saca, para `i` de 0 a 51, el índice `j = rand mod (52 − i)`: la carta `j` va a la columna `i mod 8` y se sustituye por la última que queda.

El número de partida es `config.partida`, o, si es `null`, `1 + hash(semilla) mod 32000` con el `cyrb128` del azar. El número se guarda en el estado y aparece en la vista.

*Alternativa descartada:* barajar con el `sfc32` del proyecto. Se perderían los números de partida conocidos, que permiten compartir y comparar una partida.

### 2. Estado y acciones
`EstadoFreeCell` guarda:
- `config` (`partida: number | null`, `celdas: 1 | 2 | 3 | 4`, `autoFundacion: boolean`) y `numero`;
- `celdas: (IdCarta | null)[]`, `fundaciones: IdCarta[][]` y `columnas: IdCarta[][]`;
- `movimientos`, `historial` (instantáneas compactas de celdas, fundaciones y columnas antes de cada movimiento) y `abandonada`.

Las pilas se nombran `l0…l3` (celdas), `f0…f3` (fundaciones) y `c0…c7` (columnas).

Acciones:
- `mover{desde, hasta, cantidad}`: `cantidad > 1` solo de columna a columna.
- `deshacer`, `autocompletar` y `abandonar`.

`accionesLegales` enumera todos los movimientos válidos:
- de cada celda y del final de cada columna a fundaciones, celdas y columnas;
- y, para cada columna, cada secuencia final válida hasta el máximo del supermovimiento.

Hacia las celdas vacías y las columnas vacías solo se ofrece la primera, porque las otras son equivalentes. La UI resuelve igual cualquier destino vacío, así que se busca la primera acción que coincida en tipo de destino.

*Por qué guardar instantáneas para deshacer:* con el movimiento automático, un movimiento del jugador encadena varios. Guardar el tablero anterior (52 identificadores) es más simple y más seguro que invertir cada paso, y el estado sigue siendo JSON plano.

### 3. Movimiento automático seguro
Después de cada `mover` y si `autoFundacion` está activado, se repite: buscar en celdas y finales de columna una carta que pueda ir a su fundación y sea segura, es decir, un As, un 2, o una carta con `valor ≤ min(fundaciones del color contrario) + 1`. Las cartas que se mueven solas no cuentan en el número de movimientos.

### 4. Autocompletar y victoria
Autocompletar está disponible cuando todas las columnas están en orden no creciente desde la base. Esto basta, porque siempre hay una carta mínima accesible. Mueve repetidamente la carta accesible de menor valor a su fundación hasta acabar. La victoria llega con 52 cartas en las fundaciones. `resultado` devuelve `{ ganadores: [0] }` con victoria, y `{ ganadores: [] }` si se abandona.

### 5. Cliente
- **`MesaFreeCell.svelte`:**
  - Arriba, 4 celdas y 4 fundaciones; debajo, 8 columnas con solape vertical adaptable. El solape se calcula con el número de cartas de la columna más larga y el alto disponible, como en el Klondike.
  - Interacción con `Interaccion`. El origen es una carta, que lleva su secuencia si se puede mover entera. Los destinos son las pilas válidas según `accionesLegales`. El destino obvio con doble toque es la fundación y, si no, una celda.
  - Una barra muestra el número de partida, los movimientos, el tiempo, el máximo de cartas que se pueden mover y los botones.
- **Registro y fin:** `DEF_FREECELL` sin IA. La pantalla de fin reutiliza la rama de solitario del Klondike, con el número de partida.
- **Opciones:** elegir «Al azar» o «Número» con un campo numérico (1–32.000), las celdas y el movimiento automático.

### 6. E2E con resolvedor
`e2e/freecell-solucion.ts` resuelve una partida por búsqueda en profundidad. Usa una heurística (cartas en fundaciones y cartas bien ordenadas), estados visitados y movimientos de una sola carta o de secuencias por las acciones legales del motor. Con la partida 1 conocida, el test reproduce la solución en la UI con toques.

## Risks / Trade-offs

- **Número de acciones legales alto** (hasta ~100 por estado) → no importa, porque no hay IA. Para la suite de propiedades, la cantidad de pasos se limita.
- **Un resolvedor demasiado lento en E2E** → se fija la partida y se limita la búsqueda. Si no encuentra solución, el test falla con un mensaje claro.
- **Partida 11982 sin solución** → es un hecho conocido del reparto de Microsoft. El jugador puede abandonar.
