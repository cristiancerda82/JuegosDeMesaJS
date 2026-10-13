## Why

FreeCell es, junto al Klondike, el solitario más jugado. Tiene una ventaja que lo hace ideal para el móvil: casi todas las partidas tienen solución y todas las cartas están a la vista desde el principio, así que depende de pensar y no de la suerte. Además reutiliza la baraja francesa, la mesa de solitario y la interacción de arrastrar y tocar que ya tiene el Klondike.

## What Changes

- Nuevo solitario **FreeCell** con baraja francesa de 52 cartas, jugable de principio a fin:
  - **Reparto:** las 52 cartas boca arriba en 8 columnas (4 de 7 y 4 de 6), con 4 celdas libres y 4 fundaciones.
  - **Movimientos:**
    - Una carta a una celda vacía.
    - De una celda o columna a la fundación de su palo (en orden, del As al Rey).
    - Sobre una columna, si es de valor inmediatamente inferior y de color opuesto; o a una columna vacía con cualquier carta.
  - **Secuencias («supermovimiento»):** se puede mover una escalera ordenada y alterna de tantas cartas como permitan las celdas y columnas vacías: `(celdas libres + 1) × 2^(columnas vacías)`.
  - **Partidas numeradas:** se reparten con el algoritmo clásico de Microsoft (del 1 al 32.000). Se puede jugar una partida concreta por su número o una al azar, y el número se muestra en la mesa.
  - **Ayudas:** deshacer, mover solas a la fundación las cartas que ya no hacen falta (activable), autocompletar cuando las columnas están ordenadas, contador de movimientos y tiempo, y abandonar.
  - **Variantes como configuración:** el número de celdas (de 1 a 4) y el movimiento automático a las fundaciones.
- El cliente suma el FreeCell al menú, con sus opciones (número de partida o al azar, celdas, movimiento automático), su mesa (celdas, fundaciones y columnas, con arrastrar y tocar), la pantalla de fin y su guía "¿Cómo se juega?".
- Fuera de alcance: pistas o «resolver», estadísticas por número de partida, las variantes Baker's Game y Eight Off, y deshacer más allá de la partida en curso.

## Capabilities

### New Capabilities
- `juego-freecell`: reglas del FreeCell: reparto numerado, celdas, fundaciones, columnas, supermovimientos, movimiento automático, deshacer, autocompletar, victoria y variantes configurables.

### Modified Capabilities
- `mesa-cliente`: el menú incluye el FreeCell, y su mesa muestra celdas, fundaciones y columnas con el número de partida y cuántas cartas se pueden mover a la vez.

## Impact

- `packages/engine`: nuevo `juegos/freecell.ts`, con sus tests y la suite genérica del contrato. Reutiliza la baraja francesa y el azar. No necesita IA, porque es un solitario.
- `packages/client`: nueva `MesaFreeCell.svelte`, que se apoya en la interacción, las animaciones y el estilo de `MesaKlondike`. También cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E, que llevan un resolvedor sencillo para completar partidas.
- Sin dependencias nuevas.
