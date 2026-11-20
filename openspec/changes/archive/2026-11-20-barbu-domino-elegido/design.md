## Context

En el Barbu de la suite (`juegos/barbu.ts`), el repartidor elige el contrato en la fase `contrato`. Si elige el triunfo, elige también el palo en la fase `triunfo`; si elige el dominó, pasa a la fase `domino` y empieza a jugar. En el dominó, `encajaBarbu` y `encajanBarbu` abren cada fila con la Jota. `encajanBarbu` también da lo que se sabe que no tiene quien pasa. La IA básica, la reconstrucción y la mesa (`DominoBarbu.svelte`) cuentan las filas desde la Jota.

## Goals / Non-Goals

**Goals:**
- Que el número elegido sea una opción del mismo juego, con la IA de los tres niveles, en red y en la mesa.
- Que las partidas y salas sin la opción no cambien.

**Non-Goals:**
- Otras reglas del dominó, como poder abrir una fila nueva con cualquier carta.
- Dobles (redoblar) en el Barbu.

## Decisions

### 1. Opción, fase y acción
- **`ConfigBarbu`:** gana `dominoElegido?: boolean`. `crear` la normaliza a `config.dominoElegido === true`.
- **Fase nueva `inicio`:** con la opción, elegir el dominó lleva a la fase `inicio` en lugar de `domino`, igual que elegir el triunfo lleva a la fase `triunfo`.
- **Acción nueva:** `{ tipo: 'inicio', rango }`, con `rango` del 2 al 14 (As). Las legales son los 13 números. Tras elegir, la fase pasa a `domino` y el turno sigue siendo del repartidor, que empieza.
- **Estado:** `inicio?: number`, el número de salida de la mano. Sin él vale la Jota, así que las partidas guardadas siguen igual. Se borra en cada mano nueva.
- **Vista:** `inicio: number`, siempre presente: la Jota sin la opción y mientras no se ha elegido.

### 2. Encaje
- `encajaBarbu(filas, carta, inicio = 11)` y `encajanBarbu(filas, inicio = 11)` abren cada fila con el número de salida.
- Si la salida es el 2, la fila solo crece hacia arriba; si es el As, solo hacia abajo. Los límites (2 y As) ya los comprueba `encajanBarbu`.
- Lo que se sabe de quien pasa se calcula con el mismo `inicio`.

### 3. IA
- **Normal (`barbu-basica.ts`):**
  - **Valor de un número de salida:** sus cartas de ese número más las seguidas a ellas, hacia arriba y hacia abajo. Hoy se calcula así solo para la Jota.
  - **Elegir el dominó:** con la opción, `estimacionBarbu` lo valora con el mejor número.
  - **Fase `inicio`:** elige el número de más valor; a igualdad, el más cercano al centro (8), y si no, el más bajo.
  - **Al jugar el dominó:** `cartaDominoBarbu` cuenta las filas desde `vista.inicio` en lugar de la Jota.
- **Reconstrucción:** copia `inicio` de la vista. Lo que se sabe de quien pasa ya llega en `noTiene`.
- **Difícil:** `decideLaBase` incluye la fase `inicio`, como el contrato y el triunfo.

### 4. Cliente
- **Opciones:** casilla «Dominó: elige el número» con su explicación.
- **Mesa:**
  - **Fase `inicio`:** en `MesaBarbu.svelte` es una decisión más, con un botón por número («2», «3»… «J», «Q», «K», «A») y el aviso «Elige el número de salida».
  - **Filas:** en `DominoBarbu.svelte`, el hueco de salida de las filas vacías pasa a `vista.inicio`.
  - **Contrato:** con la opción, el texto del dominó dice el número de salida («Dominó · número de salida: 7»).
- **Guía:** la línea «En otros sitios…» pasa a «Variante (opción «Dominó: elige el número»)…».

## Risks / Trade-offs

- **Un paso más para elegir el contrato** → solo con la opción y solo en el dominó.
- **La IA elige con una regla sencilla** → es la misma idea con la que ya valora el dominó con las Jotas. La fuerza del difícil se vuelve a medir con la opción.
