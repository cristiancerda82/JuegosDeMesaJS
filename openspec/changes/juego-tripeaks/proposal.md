## Why

Los solitarios de la suite (Klondike, FreeCell, Spider, Pirámide y Golf) se ganan o se pierden y guardan récords de tiempo y movimientos. TriPeaks es el pariente más popular del Golf: tres picos de cartas que se van despejando subiendo o bajando uno sobre el descarte, con cartas boca abajo que se descubren al liberarlas. Añade algo que ningún solitario de la suite tiene: una puntuación por rachas, que premia encadenar muchas cartas seguidas sin robar y que da un récord más que batir.

## What Changes

- Nuevo solitario **TriPeaks**:
  - **Reparto:** baraja francesa de 52 cartas. 28 cartas forman tres picos en cuatro filas (3, 6, 9 y 10 cartas). Las 10 de la fila de abajo van boca arriba y el resto boca abajo. Una carta va boca arriba al descarte y las 23 restantes forman el mazo.
  - **Quitar:** una carta de los picos que no tenga ninguna encima puede pasar al descarte si vale uno más o uno menos que la carta de arriba del descarte, sea cual sea su palo. La K y el As se tocan («con vuelta»): sobre una K puede ir una Q o un As, y sobre un As un 2 o una K.
  - **Descubrir:** una carta boca abajo se vuelve boca arriba en cuanto no le queda ninguna carta encima.
  - **Mazo:** se puede robar en cualquier momento; la carta de arriba del mazo pasa al descarte. El mazo se recorre una sola vez.
  - **Puntos:** cada carta quitada de los picos suma tantos puntos como lleve la racha: la primera de una racha suma 1, la segunda 2, y así. Robar corta la racha. Despejar un pico (quitar su carta de arriba) suma 15, y despejar los tres, 30 más.
  - **Victoria:** al despejar las 28 cartas de los picos, aunque quede mazo.
  - **Deshacer y abandonar:** como en el resto de solitarios. Cada acción suma un movimiento, deshacer también, y deshacer devuelve también los puntos y la racha.
- **Pista:** sugiere la carta que deja encadenar más cartas visibles después; si no hay ninguna, robar.
- **Récords:** además del mejor tiempo y de los menos movimientos al ganar, TriPeaks guarda la mejor puntuación de todas sus partidas terminadas, ganadas o no. Las estadísticas muestran ese récord y la pantalla de fin avisa al batirlo.
- **Cliente:**
  - TriPeaks en el menú, sin más opciones;
  - una mesa propia con los tres picos solapados, el mazo y el descarte, la racha y los puntos, deshacer, pista y abandonar, y el aviso de partida atascada;
  - el fin de partida con los puntos, y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - jugar sin vuelta;
  - varias partidas encadenadas con puntos acumulados;
  - variantes con comodines o con el mazo reciclado.

## Capabilities

### New Capabilities
- `juego-tripeaks`: reglas de TriPeaks:
  - reparto en tres picos;
  - quitar, descubrir y robar;
  - puntos por racha y por picos;
  - victoria;
  - deshacer y abandonar;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: TriPeaks tiene su pista, y su partida atascada se detecta como en el resto de solitarios.
- `estadisticas`: TriPeaks entra en los récords de los solitarios, con un récord nuevo de mejor puntuación.
- `mesa-cliente`: el menú incluye TriPeaks con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevo `juegos/tripeaks.ts`, con sus tests y la suite genérica del contrato;
  - `pistaTriPeaks` en `ia/pistas.ts`.
- `packages/server`: ningún cambio (los solitarios no se juegan en red).
- `packages/client`:
  - nueva `MesaTriPeaks.svelte`;
  - las estadísticas guardan la mejor puntuación (el formato sigue siendo compatible con las estadísticas guardadas);
  - cambian el registro de juegos, los textos, la pantalla de fin, las estadísticas, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas son las del TriPeaks clásico y las ha elegido el usuario:
  - con vuelta;
  - puntos por racha;
  - se gana al despejar los tres picos.
