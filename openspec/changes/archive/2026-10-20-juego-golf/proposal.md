## Why

La Pirámide abrió hueco para solitarios cortos de una baraja. El Golf es otro clásico de partidas de pocos minutos: se pasan al descarte cartas que valen una más o una menos que la de arriba, encadenando todas las que se pueda. Reutiliza todo lo que ya tienen los solitarios: deshacer y abandonar, pista, aviso de atasco, récords en las estadísticas y la guía.

## What Changes

- Nuevo solitario **Golf**, con la baraja francesa de 52 cartas:
  - **Reparto:** 35 cartas boca arriba en 7 columnas de 5. Una carta va boca arriba al descarte y las otras 16 forman el mazo, boca abajo.
  - **Mover:** la última carta de una columna pasa al descarte si vale exactamente una más o una menos que la de arriba del descarte, sea cual sea el palo. Sin vuelta (por defecto): sobre una K no va nada, y sobre un As solo un 2. Con la opción «con vuelta», la K y el As se tocan.
  - **Mazo:** en cualquier momento se puede robar: la carta de arriba del mazo pasa al descarte. El mazo se recorre una sola vez.
  - **Victoria:** se gana al pasar al descarte las 35 cartas de las columnas, aunque quede mazo.
  - **Deshacer y abandonar:** sin límite, como en el resto de solitarios. Cada acción suma un movimiento, también deshacer.
- **Pistas:** el Golf tiene su función de pista y se detecta cuando se atasca. La pista elige la carta con la que se pueden encadenar más cartas después; si no se puede mover ninguna, sugiere robar.
- **Estadísticas:** el Golf guarda, como el resto de solitarios, el mejor tiempo y el menor número de movimientos.
- **Cliente:**
  - el Golf en el menú y sus opciones (con o sin vuelta entre la K y el As);
  - una mesa propia: las 7 columnas, que en 360 px entran sin scroll horizontal, y el mazo y el descarte;
  - mover tocando la carta, robar tocando el mazo, deshacer, abandonar, pedir pista, y ver los movimientos, el tiempo y las cartas que quedan en el mazo;
  - la pantalla de fin, con victoria o abandono;
  - la guía «¿Cómo se juega?».
- **Fuera de alcance:** la puntuación a varias manos («hoyos»), las variantes de dos barajas y la de poner cartas sobre una K.
  - El Golf no se juega en red, como el resto de solitarios.

## Capabilities

### New Capabilities
- `juego-golf`: reglas del Golf:
  - reparto;
  - mover al descarte;
  - con o sin vuelta;
  - mazo;
  - victoria;
  - deshacer y abandonar;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: el Golf entra en la lista de solitarios con pista, con sus movimientos útiles.
- `estadisticas`: el Golf entra en los récords de los solitarios.
- `mesa-cliente`: el menú incluye el Golf con su mesa y su pantalla de fin.

## Impact

- `packages/engine`:
  - nuevo `juegos/golf.ts` con sus tests y la suite genérica del contrato;
  - `ia/pistas.ts` gana `pistaGolf`.
- `packages/client`:
  - nueva `MesaGolf.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- `packages/server`: ninguno.
- No hay dependencias nuevas.
- Las reglas salen del Golf clásico y las valida el usuario: sin vuelta entre la K y el As por defecto, y victoria al vaciar las columnas.
