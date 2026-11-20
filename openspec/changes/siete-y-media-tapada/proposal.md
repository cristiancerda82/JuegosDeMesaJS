## Why

La guía de la Siete y media ya cuenta que «en otros sitios cada jugador elige si pide la carta tapada o destapada, y así los demás no saben cuánto suma». Es una regla muy jugada en casa. Le da al juego lo que más le falta en la app: el farol. Con cartas tapadas, la banca ya no sabe si un punto plantado con un 2 a la vista tiene 2,5 o 7.

Es la segunda de las variantes que las guías solo mencionaban, tras el Treinta y uno con viuda.

## What Changes

- **Opción «Pedir tapada» en la Siete y media**, desactivada por defecto. Con ella activada:
  - al pedir carta, el jugador elige si la quiere boca arriba (como siempre) o boca abajo;
  - las cartas tapadas solo las ve su dueño hasta que se destapan al final de la mano, como la primera;
  - si con una carta tapada se pasa, se pasa igual: pierde su apuesta en el acto y todos ven que se ha pasado, pero no sus cartas tapadas.
- **Ninguna carta pedida se ve en la vista ajena mientras está tapada**: tampoco en el aviso de la última jugada.
- **IA:**
  - **Normal:**
    - como punto, pide siempre tapada;
    - como banca, cuenta cada carta tapada de un punto como medio punto, lo mínimo que puede valer, y pide destapada.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula también pedir tapada o destapada, con las tapadas ajenas al azar.
- **Cliente:**
  - la casilla en las opciones de la Siete y media, en local y al crear una sala en red;
  - en la mesa, con la opción, dos botones: «Pedir destapada» y «Pedir tapada»;
  - las cartas tapadas propias se ven con una marca de «tapada», y las ajenas boca abajo;
  - el aviso dice si pidió tapada o destapada;
  - la línea «En otros sitios…» de la guía pasa a explicar la variante y en qué opción se activa.
- Las partidas guardadas y las salas sin esta opción siguen como hasta ahora.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-siete-y-media`: la variante de pedir tapada.
- `ia-jugadores`: la IA básica de la Siete y media con cartas tapadas.
- `mesa-cliente`: la opción, la mesa con los dos botones y la guía.

## Impact

- `packages/engine`:
  - `juegos/siete-y-media.ts`: la config, la acción `pedirTapada`, el estado de qué cartas van tapadas y la vista;
  - `ia/siete-y-media-basica.ts` e `ia/reconstruir/siete-y-media.ts`;
  - los tests.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - `MesaSieteYMedia.svelte` y el resumen de la mano;
  - las opciones;
  - los textos y la guía;
  - el E2E.
