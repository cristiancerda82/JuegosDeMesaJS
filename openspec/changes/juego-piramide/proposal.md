## Why

La suite tiene tres solitarios (Klondike, FreeCell y Spider), y en los últimos changes solo han entrado juegos de bazas. La Pirámide es un solitario clásico, corto y de reglas muy sencillas: se quitan parejas de cartas que suman 13. Da variedad y reutiliza casi todo lo que ya hay para los solitarios: la baraja francesa, deshacer y abandonar, las pistas, la detección de partida atascada y las estadísticas con récords.

## What Changes

- Nuevo solitario **Pirámide**, con la baraja francesa de 52 cartas:
  - **Reparto:** 28 cartas boca arriba en una pirámide de 7 filas (1, 2, …, 7 cartas). Cada carta queda tapada por las dos de la fila de abajo que la solapan. Las otras 24 forman el mazo, boca abajo.
  - **Valores:** el As vale 1, los números lo que marcan, la J 11, la Q 12 y la K 13.
  - **Quitar:** el jugador quita dos cartas libres que suman 13, o una K libre sola. Una carta está libre si es de la pirámide y no la tapa ninguna, o si es la de arriba del descarte.
  - **Mazo:** robar pasa la carta de arriba del mazo al descarte. Con el mazo vacío, el descarte se puede volver a usar como mazo, en el mismo orden. Se puede recorrer el mazo 3 veces en total (por defecto), 1 vez o sin límite.
  - **Victoria:** se gana al vaciar la pirámide, aunque queden cartas en el mazo o en el descarte.
  - **Deshacer y abandonar:** sin límite, como en el resto de solitarios. Cada acción suma un movimiento, también deshacer.
- **Pistas:** la Pirámide tiene su función de pista y se detecta cuando se atasca, como el resto de solitarios.
- **Estadísticas:** la Pirámide guarda, como el resto de solitarios, el mejor tiempo y el menor número de movimientos.
- **Cliente:**
  - la Pirámide en el menú y sus opciones (pasadas del mazo);
  - una mesa propia: la pirámide, que en 360 px entra entera sin scroll horizontal, el mazo y el descarte;
  - quitar tocando las dos cartas (o la K sola), robar tocando el mazo, deshacer, abandonar, pedir pista, y ver los movimientos, el tiempo y las pasadas que quedan;
  - la pantalla de fin, con victoria o abandono;
  - la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - quitar una carta con la que la tapa (variante en que una carta y la única que aún la cubre se quitan juntas si suman 13);
  - las parejas con la carta de arriba del mazo sin robarla;
  - la puntuación por puntos y las partidas numeradas.
  - La Pirámide no se juega en red, como el resto de solitarios.

## Capabilities

### New Capabilities
- `juego-piramide`: reglas de la Pirámide:
  - reparto;
  - cartas libres;
  - quitar parejas y reyes;
  - mazo y pasadas;
  - victoria;
  - deshacer y abandonar;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: la Pirámide entra en la lista de solitarios con pista, con sus movimientos útiles.
- `estadisticas`: la Pirámide entra en los récords de los solitarios.
- `mesa-cliente`: el menú incluye la Pirámide con su mesa y su pantalla de fin.

## Impact

- `packages/engine`:
  - nuevo `juegos/piramide.ts` con sus tests y la suite genérica del contrato;
  - `ia/pistas.ts` gana `pistaPiramide`.
- `packages/client`:
  - nueva `MesaPiramide.svelte`;
  - cambian el registro de juegos, las opciones, los textos, las estadísticas (récords), la guía y los tests E2E.
- `packages/server`: ninguno.
- No hay dependencias nuevas.
- Las reglas salen de la Pirámide clásica y las valida el usuario: 3 pasadas por defecto y victoria al vaciar la pirámide.
