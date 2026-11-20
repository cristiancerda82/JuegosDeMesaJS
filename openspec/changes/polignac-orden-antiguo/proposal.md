## Why

La guía del Polignac ya cuenta que «en otros sitios se juega con el orden antiguo, con el As por debajo de la Jota (Rey, Dama, Jota, As, 10, 9, 8 y 7), y quien no tiene el palo tiene que soltar una Jota, empezando por la de picas». Es la forma tradicional del juego. Además cambia mucho la partida: las Jotas ganan más bazas y ya no se pueden guardar cuando te falta un palo.

Es la cuarta de las variantes que las guías solo mencionaban, tras el Treinta y uno con viuda, la Siete y media con cartas tapadas y el Oh Hell empezando con 1 carta.

## What Changes

- **Opción «Orden antiguo» en el Polignac**, desactivada por defecto. Con ella activada:
  - el orden de cada palo es Rey, Dama, Jota, As, 10, 9, 8 y 7;
  - quien no tiene el palo de salida tiene que soltar la Jota de picas si la tiene; si no, otra Jota si tiene alguna; y solo sin Jotas puede echar cualquier carta.
- **Lo demás no cambia:** el reparto, los puntos de las Jotas, el fin de la mano y el general. Sin la opción, las partidas guardadas y las salas sin la opción siguen como siempre.
- **IA:**
  - **Normal:** usa el orden de la variante para elegir la carta. Para el general, las cartas más altas seguidas de cada palo empiezan por el Rey.
  - **Difícil:** en la reconstrucción, quien soltó otra carta sin tener el palo no tiene Jotas, y quien soltó una Jota que no era la de picas no tiene la de picas.
- **Cliente:**
  - la casilla en las opciones del Polignac, en local y al crear una sala en red;
  - la mesa ordena la mano con el orden de la variante y solo deja jugar las cartas legales, como siempre;
  - la línea «En otros sitios…» de la guía pasa a explicar la variante y en qué opción se activa.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-polignac`: el orden antiguo y la obligación de soltar las Jotas.
- `ia-jugadores`: la IA básica del Polignac con el orden antiguo.
- `niveles-ia`: la reconstrucción del Polignac con el orden antiguo.
- `mesa-cliente`: la opción, la mano ordenada y la guía.

## Impact

- `packages/engine`:
  - `juegos/polignac.ts`: la config, el orden, las cartas legales y qué Jotas se sabe que no tiene cada uno;
  - `ia/polignac-basica.ts` e `ia/reconstruir/polignac.ts`;
  - los tests.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - `MesaPolignac.svelte`;
  - las opciones;
  - los textos y la guía;
  - el E2E.
