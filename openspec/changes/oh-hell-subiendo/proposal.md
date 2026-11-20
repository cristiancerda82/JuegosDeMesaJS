## Why

La guía del Oh Hell ya cuenta que «en otros sitios se empieza con 1 carta y se sube de una en una hasta el máximo». Es la forma más corta de jugarlo: con 4 jugadores son 12 manos en lugar de 23. Además, la tensión va creciendo, porque las manos grandes, las que más puntos dan, quedan para el final.

Es la tercera de las variantes que las guías solo mencionaban, tras el Treinta y uno con viuda y la Siete y media con cartas tapadas.

## What Changes

- **Opción «Empezar con 1 carta» en el Oh Hell**, desactivada por defecto. Con ella activada, la partida se juega de 1 carta subiendo de una en una hasta el máximo, y ahí termina. Con 3, 4, 5, 6 y 7 jugadores son 17, 12, 10, 8 y 7 manos.
- **Sin la opción, todo sigue igual:** del máximo bajando hasta 1 y subiendo otra vez hasta el máximo. Las partidas guardadas y las salas en red sin la opción tampoco cambian.
- **IA:** no cambia. Los tres niveles ya deciden con las cartas de la mano en curso, sea cual sea el orden.
- **Cliente:**
  - la casilla en las opciones del Oh Hell, en local y al crear una sala en red;
  - la mesa ya muestra «Mano X de N», así que con la opción N es el número de manos de la variante;
  - la línea «En otros sitios…» de la guía pasa a explicar la variante y en qué opción se activa.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-oh-hell`: el orden de manos que sube desde 1.
- `mesa-cliente`: la opción en las opciones y la guía.

## Impact

- `packages/engine`:
  - `juegos/oh-hell.ts`: la config y la secuencia de manos;
  - los tests del juego, de la IA y de la reconstrucción con la opción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - las opciones;
  - los textos y la guía;
  - el E2E.
