## Context

Cuarenta ladrones junta piezas de otros solitarios de la suite:
- las 104 cartas con copia (`palo-valor#copia`) y su `base`, del Spider;
- el mazo y el descarte, y la mesa con doble toque, pista y deshacer, del Klondike y el Canfield;
- la capacidad de los tramos según los huecos, del FreeCell, aquí sin celdas libres.

## Goals / Non-Goals

**Goals:**
- Cuarenta ladrones clásico: por palo, una vuelta al mazo y una carta cada vez, con tramos por los huecos.
- Las 10 columnas y las 8 fundaciones caben en 360 × 640.
- Pista, récords, deshacer y autocompletar como el resto de solitarios.

**Non-Goals:**
- Más vueltas al mazo, otras variantes y la puntuación.

## Decisions

### 1. Estado (`juegos/cuarenta-ladrones.ts`)
- `columnas: CartaLadrones[][]`, todas boca arriba;
- `fundaciones: CartaLadrones[][]` (8);
- `mazo` (se roba la última) y `descarte`;
- `movimientos`, `historial` (los movimientos hechos, para deshacerlos, como en el Canfield);
- `abandonada`.

`CartaLadrones` es el mismo tipo que `CartaSpider` y se reutiliza `baseSpider`. El reparto sale de dos copias de la baraja francesa barajadas con la semilla.

### 2. Acciones
- `robar`;
- `mover { desde, hasta, cantidad }`, con las pilas como en el Canfield: `desde` es `'descarte'` o una columna `'c0'`–`'c9'`, y `hasta` una columna o una fundación `'f0'`–`'f7'`;
- `deshacer`, `autocompletar` y `abandonar`.

Con `cantidad` mayor que 1, solo de columna a columna. La capacidad es `2 ** huecos`, contando los huecos que no son el destino. A una fundación solo va una carta. Para no repetir acciones, a una columna vacía se lista solo la primera columna vacía. Un tramo entero que ocupa toda su columna no se lista hacia otra columna vacía, porque no cambia nada.

### 3. Autocompletar
Se simula `subirTodo`: subir repetidamente cualquier carta que pueda subir, hasta que no quede ninguna. Si al final las 104 están en las fundaciones, `autocompletar` es legal. Solo se comprueba con el mazo y el descarte vacíos.

### 4. Pista (`pistaCuarentaLadrones` en `ia/pistas.ts`)
Por orden de preferencia:
1. subir a una fundación;
2. sacar la carta del descarte a una columna;
3. un movimiento que vacía una columna;
4. un movimiento que deja arriba de su columna una carta que puede subir;
5. robar.

Nunca propone pasar un tramo a una columna vacía si no deja nada al descubierto. Si no hay nada útil, `null`.

### 5. Cliente
- **`MesaCuarentaLadrones.svelte`:** parte de `MesaCanfield.svelte`.
  - Fila de arriba: el mazo, el descarte y las 8 fundaciones, que son 10 huecos; caben con `--ancho-carta` igual al ancho disponible entre 10,6.
  - Debajo, las 10 columnas, con un solape vertical que se reduce cuando son largas.
  - Los tramos se seleccionan tocando una carta: se mueven ella y las que tiene encima.
- **Récords y fin:** como el resto de solitarios, con la pista en la definición del juego.
- **E2E:**
  - un solucionador en `e2e/cuarenta-ladrones-solucion.ts`, por búsqueda en profundidad con límite, busca una semilla ganable y la gana desde la interfaz;
  - si no encuentra una partida corta, se prueba la victoria con autocompletar desde un estado preparado.

## Risks / Trade-offs

- **[Muchas acciones legales]** → 10 columnas × 10 destinos × tramos dan unos cientos como mucho. Se filtran los movimientos repetidos hacia columnas vacías.
- **[Partidas ganables difíciles de encontrar para el E2E]** → Cuarenta ladrones se gana pocas veces. El solucionador tiene un límite de nodos y prueba varias semillas; la búsqueda se hace en Node antes de abrir el navegador.
