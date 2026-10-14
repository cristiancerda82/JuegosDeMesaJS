## Context

El Klondike y el FreeCell ya resuelven, para un solitario, todo lo que el Spider necesita:
- **Motor:** columnas con cartas boca abajo y boca arriba (`ColumnaKlondike`), deshacer con instantáneas del tablero (FreeCell), abandono y contadores.
- **Cliente:**
  - En `MesaFreeCell`, la interacción con orígenes y destinos: arrastre, toque, doble toque y el destino equivalente para las columnas vacías.
  - La animación FLIP.
  - La barra con movimientos, tiempo, deshacer y abandonar.

La novedad es que el Spider tiene cartas repetidas (con 1 palo, 8 de cada valor). Sin embargo:
- `aplicar` compara las acciones con `accionesLegales`;
- el cliente usa el identificador de la carta como clave de los `{#each}` y de las animaciones;
- el oráculo de la suite del contrato busca identificadores ocultos en la vista.

## Goals / Non-Goals

**Goals:**
- Spider completo con 1, 2 y 4 palos.
- Una mesa de 10 columnas usable en 360 px.

**Non-Goals:**
- Pistas, puntuación de Windows, partidas numeradas y variantes.

## Decisions

### 1. Identificadores con copia
- **Formato:** cada carta del Spider es un `CartaSpider = \`${IdCarta}#${number}\``, por ejemplo `picas-12#3`. El número de copia empieza en 0 y es único entre las cartas iguales.
- **`baseSpider(id)`:** devuelve el `IdCarta` para dibujarla y comparar su valor y su palo.
- **Por qué:**
  - las acciones (`mover {desde, hasta, cantidad}`) no llevan cartas, así que el formato solo afecta a las claves y al oráculo;
  - la alternativa, posiciones sin identidad, rompería las animaciones FLIP.

### 2. Estado (`juegos/spider.ts`)
`EstadoSpider { config, columnas: ColumnaSpider[], mazo: CartaSpider[], completadas: PaloFrances[], movimientos, historial: Tablero[], abandonada }`:
- `ColumnaSpider { ocultas, visibles }`, como en el Klondike.
- `Tablero` es `{ columnas, mazo, completadas }`, la instantánea para deshacer.

`ConfigSpider { palos: 1 | 2 | 4, repartirConVacias: boolean }`; por defecto `{ palos: 1, repartirConVacias: false }`.

**Creación:**
- Se forman las 104 cartas según los palos: cada palo se repite `8 / palos` veces, con copias numeradas.
- Se barajan con la semilla.
- Se reparte en filas: las cartas `i < 54` van a la columna `i % 10`.
- La última de cada columna queda boca arriba.

### 3. Acciones
- **`mover {desde: number, hasta: number, cantidad}`:**
  - se ofrece para cada escalera final del mismo palo (de 1 a su largo) y para cada columna destino en la que encaja;
  - en las columnas vacías se ofrecen todas: son pocas y así el cliente no necesita equivalencias.
- **`repartir`:** si queda mazo y (la opción lo permite o ninguna columna está vacía).
- **`deshacer`:** si hay historial.
- **`abandonar`.**

**Después de mover o repartir:**
1. Se revisan las columnas tocadas: si terminan en Rey…As del mismo palo, boca arriba, se retiran a `completadas`.
2. Se voltea la última oculta de cualquier columna que haya quedado sin cartas visibles.

**`resultado`:** victoria con 8 completadas; abandono con `abandonada`.

### 4. Vista
`VistaSpider { config, columnas: { ocultas: number, visibles: CartaSpider[] }[], repartosRestantes, completadas, movimientos, situacion }`.

El oráculo de la suite del contrato es `[...mazo, ...columnas.flatMap((c) => c.ocultas)]`. La vista solo da el número de cartas ocultas, así que una carta que vuelve boca abajo al deshacer tampoco aparece.

### 5. Cliente (`MesaSpider.svelte`)
**Barra superior:**
- el mazo, que se toca para repartir, con el número de repartos que quedan;
- las escaleras completadas, como pequeñas cartas del Rey de su palo;
- movimientos, tiempo, deshacer y abandonar.

**Columnas:**
- Rejilla de 10 columnas: `--ancho-carta: min(9.2vw, 64px)` cabe en 360 px con un hueco de 2 px.
- Las cartas boca abajo se solapan mucho y las visibles lo justo para ver el índice.
- Si una columna es más alta que el espacio, el solape se reduce con una variable CSS calculada por columna según su número de cartas.

**Interacción (`Interaccion`):**
- **Origen:** cualquier carta visible que encabece una escalera del mismo palo hasta el final.
- **Destinos:** las columnas con un `mover` legal para esa carta y cantidad.
- **Destino obvio del doble toque:** primero una columna que alargue una escalera del mismo palo, luego cualquier otra no vacía y por último una vacía.

**Fin:** reutiliza el texto del solitario ganado o abandonado, con movimientos y tiempo.

## Risks / Trade-offs

- **Cartas pequeñas en 360 px** → el índice de `Carta` sigue siendo legible a ~32 px de ancho. Hay un E2E que comprueba que no hay scroll horizontal y una captura para revisarlo.
- **Columnas muy largas** → solape variable por columna. Si aun así no cabe, la página hace scroll vertical, que es aceptable.
- **No hay solver para un E2E de partida ganada** → la victoria se prueba en el motor con un tablero armado a mano. El E2E cubre mover, repartir, completar una escalera (en una partida buscada con el motor) y abandonar.
