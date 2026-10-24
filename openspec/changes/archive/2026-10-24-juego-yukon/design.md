## Context

El Yukon es el Klondike sin mazo y con movimientos de grupos sin ordenar. Reutiliza:
- la estructura de `klondike.ts`: columnas con `ocultas` y `visibles`, fundaciones, historial para deshacer, `movimientos` y `abandonada`;
- la pista por puntos de `ia/pistas.ts` y `atascado`;
- los récords de tiempo y movimientos de las estadísticas, que ya distinguen los solitarios por el resultado (`movimientos` y `tiempoMs`);
- la mesa del Klondike (`MesaKlondike.svelte`), con `Interaccion` para arrastrar, tocar y hacer doble toque.

## Goals / Non-Goals

**Goals:**
- Yukon clásico y Solitario ruso como opción, con deshacer, autocompletar, pista y récords.

**Non-Goals:**
- Otras variantes, cualquier carta en una columna vacía, partidas con solución garantizada.

## Decisions

### 1. Motor propio, no una opción del Klondike
`juegos/yukon.ts` es un juego aparte (`id: 'yukon'`): no tiene mazo ni descarte, mueve grupos sin ordenar y autocompleta con otra condición. Meterlo en el Klondike llenaría sus reglas de excepciones. Se copian los tipos y la forma de trabajar de `klondike.ts` (una `Mesa` mutable dentro de cada transición).

- `ConfigYukon = { construccion: 'colores' | 'palo' }`, por defecto `'colores'`.
- `PilaYukon = 'c0'…'c6' | 'f0'…'f3'`.
- `EstadoYukon = { config, columnas, fundaciones, movimientos, historial, abandonada }`.
- `AccionYukon = mover{desde, hasta, cantidad} | deshacer | autocompletar | abandonar`.
- `VistaYukon = { config, columnas: { ocultas: number, visibles }[], fundaciones, movimientos, situacion }`.

### 2. Reparto
Se baraja y se reparte con `repartir` en las cantidades 1, 6, 7, 8, 9, 10 y 11. En cada columna, las últimas 5 (o la única, en la primera) van boca arriba.

### 3. Acciones legales
- **Entre columnas:** para cada carta visible `k` de cada columna, la `cantidad` es lo que queda desde `k` hasta el final. Se puede mover a cada otra columna en la que `puedeIr(base, destino)`: sobre una carta de un valor más, de color contrario o del mismo palo según la construcción; en una columna vacía, solo un rey.
- **A las fundaciones:** la última carta de cada columna.
- **Desde las fundaciones:** la carta de arriba a una columna en la que encaje.
- `deshacer` si hay historial, `autocompletar` si se puede, y siempre `abandonar`.

### 4. Autocompletar
Disponible cuando no queda ninguna carta boca abajo, queda alguna en las columnas y cada columna está ordenada según la construcción. Entonces la carta más baja de todas está siempre arriba de su columna y es la siguiente de su fundación: se sube siempre la más baja, como en el Klondike.

### 5. Pista
`pistaYukon` puntúa como el Klondike:
- 100 por subir a una fundación (más 50 si además descubre una carta);
- 80 si el movimiento descubre una carta boca abajo;
- 60 si deja arriba de la columna de origen una carta que puede subir a una fundación;
- 30 si vacía una columna y el destino no estaba vacío.

El resto vale 0, también bajar de una fundación. Si nada puntúa, devuelve `null`, porque no hay mazo.

### 6. Cliente
- **`MesaYukon.svelte`:** copia de la mesa del Klondike sin el mazo ni el descarte. Las fundaciones arriba, las 7 columnas debajo, y los botones de deshacer, pista, autocompletar y abandonar. Las columnas del Yukon son más largas (hasta 11 cartas al empezar), así que el solape vertical de las cartas boca arriba se ajusta a la altura disponible.
- **Opciones:** construcción por colores alternos o por palo.
- **Estadísticas:** sin cambios de código; el Yukon entra en los récords de tiempo y movimientos al registrar sus partidas.
- **Fin:** movimientos y tiempo, como el Klondike.

## Risks / Trade-offs

- **[Columnas largas en el móvil]** → con 11 cartas al empezar y grupos que crecen, la columna puede no caber en 640 px. El solape de las cartas boca arriba se reduce según la altura, dejando a la vista al menos la esquina con el valor. Un E2E comprueba que la mesa cabe sin scroll horizontal.
- **[Muchas acciones legales]** → cada carta visible puede ir a varias columnas, pero son pocas decenas por estado; la pista y las acciones legales siguen siendo instantáneas.
- **[El Solitario ruso es muy difícil]** → es solo una opción; el E2E de victoria usa el Yukon clásico.
