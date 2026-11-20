## Context

En la Siete y media de la suite (`juegos/siete-y-media.ts`), la primera carta de cada jugador va boca abajo y las que pide, boca arriba. La vista esconde la primera carta ajena y calcula `visibles` con las demás. La última acción (`ultimaAccion`) guarda la carta pedida. Hoy no es un problema porque esa carta es pública, pero con la variante dejaría de serlo.

## Goals / Non-Goals

**Goals:**
- Pedir tapada como opción del mismo juego, con la IA de los tres niveles, en red y con su mesa.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- Otras reglas caseras: doblar la apuesta, la banca que no juega contra los pasados, y comprar carta pagando.

## Decisions

### 1. Opción en la config y acción nueva
- **`ConfigSieteYMedia`:** gana `tapadas?: boolean`. `crear` la normaliza a `config.tapadas === true`.
- **Acción nueva:** `{ tipo: 'pedirTapada' }`, legal solo con la opción y cuando se puede pedir. `pedir` sigue siendo pedir boca arriba, así que las partidas y registros de siempre no cambian.

### 2. Estado y vista
- **Estado:** `tapadas: boolean[][]`, paralelo a `cartas`. Al repartir, la primera es `true`; cada carta pedida, según la acción.
- **Vista:**
  - `cartas` pone `null` en cada carta ajena tapada (no solo en la primera);
  - `visibles` suma solo las destapadas;
  - `tapadas` es pública, porque todos ven qué cartas están boca abajo;
  - `ultimaAccion` de un `pedir` lleva `tapada`, y su `carta` es `null` para los demás si iba tapada. El tipo de `carta` pasa a `IdCarta | null`.
- **Pasarse:** la cuenta sigue siendo la del motor con todas las cartas. El estado `pasado` es público y las cartas tapadas no se enseñan hasta el resumen de la mano, que ya las destapa todas.

### 3. IA
- **Normal (`siete-y-media-basica.ts`):**
  - **Como punto:** decide si pide como hasta ahora y, con la opción, pide tapada: no le cuesta nada y esconde su jugada a la banca.
  - **Como banca:** el valor mínimo de un punto plantado es lo que se ve más medio punto por cada carta tapada. Con eso calcula la amenaza, y pide destapada (su jugada da igual que se vea, porque juega la última).
- **Reconstrucción:** cada `null` de la vista se rellena al azar, como ya hacía con la primera carta. Las `tapadas` se copian de la vista. La `ultimaAccion` se copia con la carta que se ve.
- **Difícil:** el mismo `SIMULABLE_SIETE_Y_MEDIA`, que ya prueba cada acción legal, ahora también `pedirTapada`.

### 4. Cliente
- **Opciones:** casilla «Pedir tapada» con su explicación.
- **Mesa:**
  - **Botones:** con la opción, en lugar de «Pedir carta», «Pedir destapada» y «Pedir tapada», con `data-accion` y `data-jugada`.
  - **Cartas propias tapadas:** una marca pequeña de «tapada» encima.
  - **Cartas ajenas:** las tapadas boca abajo, como la primera.
  - **Aviso:** «Rival 1 pide tapada».
- **Guía:** la línea «En otros sitios…» pasa a «Variante (opción «Pedir tapada»)…».

## Risks / Trade-offs

- **Cambia el tipo de `ultimaAccion.carta`** → el cliente no la pinta, solo usa el tipo y `pasado`. Las partidas guardadas tienen siempre una carta.
- **La banca juega peor contra tapadas** → es el sentido de la variante. Las pruebas de fuerza y contra el azar se repiten con la opción.
