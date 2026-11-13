## Why

La guía «¿Cómo se juega?» es la puerta de entrada para quien nunca ha jugado, pero de las 80 guías de juego solo 19 enseñan cartas; las otras 61 lo explican todo con texto. En los juegos de póker, por ejemplo, la lista «escalera de color, póker, full, color…» no se entiende sin ver las cartas, y lo mismo pasa con quién gana una baza, qué se puede capturar o qué movimiento vale en un solitario. Ver un ejemplo es la forma más rápida de entender una regla.

## What Changes

- Cada guía de juego tiene ejemplos visuales en las secciones donde ayudan, con las cartas del propio tema del jugador. Hay cuatro tipos:
  - **Cartas:** una fila de cartas con una etiqueta debajo de cada una (su valor, su puesto en la jerarquía) y, si hace falta, un resultado («= 31», «= 20 / 40»).
  - **Jugadas:** varias filas con nombre, de mayor a menor. Por ejemplo, las manos del póker con sus cinco cartas, o las combinaciones que se pueden bajar.
  - **Baza resuelta:** las cartas que juega cada asiento en una baza, con el palo de salida y el triunfo, la carta ganadora resaltada y una frase que explica por qué gana.
  - **Antes y después:** dos estados pequeños de la mesa con lo que cambia (un movimiento de solitario, una captura, un robo del descarte), con la carta movida resaltada.
- Los ejemplos se comprueban con el motor siempre que se pueda: la mano de póker es de verdad la que dice la etiqueta, la carta resaltada gana de verdad la baza, la captura suma de verdad lo que dice, la combinación es válida y el movimiento es legal. Así un ejemplo no puede enseñar una regla equivocada.
- Los 61 juegos sin ejemplos los reciben, y las 19 guías que ya tienen se pasan al formato nuevo y se completan (por ejemplo, una baza resuelta en la Brisca y en el Tute).
- Cada ejemplo tiene una descripción en texto para los lectores de pantalla, y se ve bien a 360 px de ancho.
- La guía de la red (`red`) no cambia: no tiene cartas.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `mesa-cliente`: el requisito «Guía de cada juego» pide ejemplos visuales con cartas, comprobados con las reglas del juego, en todas las guías de juego.

## Impact

- `packages/client/src/pantallas/ComoSeJuega.svelte`: la cadena de `{#if}` por ejemplo pasa a componentes genéricos, uno por cada tipo de ejemplo.
- Nuevo `packages/client/src/ayuda/`: los tipos de ejemplo, los componentes que los pintan y los datos de los ejemplos de cada juego, por familias.
- `packages/client/src/textos.ts`: las secciones de `T.ayuda` apuntan a los ejemplos; algunos textos se ajustan para referirse a ellos.
- Tests: uno de vitest que comprueba cada ejemplo con el motor, y E2E de la guía que verifican que cada juego enseña al menos un ejemplo y que cabe a 360 px.
- Sin cambios en el motor, salvo exportar alguna función de las reglas que hoy es interna y que los tests necesiten para comprobar los ejemplos.
