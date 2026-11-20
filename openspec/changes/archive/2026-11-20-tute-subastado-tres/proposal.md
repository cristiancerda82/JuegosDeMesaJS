## Why

La guía del Tute subastado ya cuenta que «en otros sitios se juega entre 3, con 12 cartas cada uno (se quitan los doses), y la subasta empieza en 70 puntos». Es la versión que describe Núñez Elvira en *El gran libro de los juegos de cartas*, donde el de 3 es el juego normal y con 4 el que reparte descansa. Con 3, cada mano dura más y la subasta pesa más, porque el pujador solo tiene dos rivales.

De las variantes de los libros que quedaban, la Escoba a 31 ya era una opción (los puntos de la partida: 15, 21 o 31), así que solo se corrige su línea de la guía. Esta es la siguiente.

## What Changes

- **Opción de jugadores en el Tute subastado:** 4 (por defecto) o 3. Con 3, siguiendo a Núñez:
  - se quitan los cuatro doses: 36 cartas, 12 a cada uno, sin muestra;
  - la primera puja es de 70 como mínimo, y sigue de 10 en 10 hasta 230;
  - no se canta el tute, que con 12 cartas no tiene objeto; las 20 y las 40 siguen igual;
  - el pujador juega solo contra los otros dos y cobra de cada uno, o les paga, una ficha por cada 10 puntos pujados.
- **Lo demás no cambia:** el orden y los puntos de las cartas (las bazas suman 120 y las últimas 10), la subasta, el triunfo a elección del pujador, las obligaciones, los cantes, las manos de la partida y el fin. Las partidas guardadas y las salas sin la opción siguen con 4.
- **IA:**
  - **Normal:** estima lo que hace con 12 cartas contando que cada baza trae las cartas de dos rivales, no de tres, y juega con 3.
  - **Difícil:** la reconstrucción reparte las cartas sin los doses, entre tres.
- **Cliente:**
  - la opción de jugadores en el Tute subastado, en local y al crear una sala en red;
  - la mesa, la subasta y el resumen de la mano con 3 jugadores y 12 cartas;
  - la línea «En otros sitios…» de la guía pasa a explicar la variante y su opción, y la de la Escoba dice que la partida a 31 está en las opciones.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-tute-subastado`: la partida de 3 jugadores.
- `ia-jugadores`: la IA básica del Tute subastado con 3.
- `mesa-cliente`: la opción, la mesa con 3 y la guía.

## Impact

- `packages/engine`:
  - `juegos/tute-subastado.ts`: la config, el reparto sin doses, la puja mínima, el tute y el cobro con 3;
  - `ia/tute-subastado-basica.ts` e `ia/reconstruir/tute-subastado.ts`;
  - los tests.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - `MesaTuteSubastado.svelte`, `ResumenTuteSubastado.svelte` y la clasificación de `Fin.svelte`;
  - las opciones;
  - los textos y la guía;
  - el E2E.
