## Why

En la Brisca de cuatro, los libros cuentan que los compañeros se hacen señas: gestos acordados para avisarse de las cartas buenas de triunfo que tienen, o de que no tienen ninguno. Así cada uno sabe si puede cargar puntos en la baza porque su compañero la va a ganar.

La guía solo lo menciona como algo «de otros sitios». La revisión de los libros lo dejó apuntado como variante pendiente.

## What Changes

- **Opción «Con señas» en la Brisca**, desactivada por defecto, en local y en las salas en red. Solo cuenta con 4 jugadores; con 2 la casilla aparece desactivada y el motor la ignora. Con ella:
  - **Lo que se ve:** cada jugador ve las señas de su compañero, que son las cartas de triunfo con puntos que tiene en la mano (As, Tres, Rey, Caballo y Sota). Si no tiene ningún triunfo, se ve también.
  - **Cuándo se ven:** las señas están siempre al día, también después de robar y de cambiar la muestra.
  - **Quién no las ve:** los rivales y los espectadores. Las cartas sin puntos de triunfo (7, 6, 5, 4 y 2) y las de otros palos no tienen seña.
  - **Lo que no cambia:** las reglas de las bazas, el robo, el cambio de la muestra, el arrastre y la puntuación.
- **IA:**
  - la normal juega igual con o sin señas: las reglas sencillas que se probaron (cargar al compañero que tiene un triunfo imbatible, rematar la carga, no gastar triunfo) no le hacían ganar más;
  - el difícil reconstruye la mano del compañero de acuerdo con sus señas: con esas cartas, sin las otras cartas de triunfo con puntos y sin ningún triunfo si no tiene.
- **Cliente:**
  - la casilla en las opciones de la Brisca, en local y en red;
  - la mesa enseña las señas del compañero en la barra de información;
  - la guía explica la variante en lugar de mencionarla como algo de otros sitios.
- Las partidas guardadas y las salas sin la opción siguen como hasta ahora.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-brisca`: la variante con señas.
- `ia-jugadores`: la IA normal no cambia con señas.
- `niveles-ia`: la reconstrucción del difícil con señas.
- `mesa-cliente`: la opción, las señas en la mesa y la guía.

## Impact

- `packages/engine`: `juegos/brisca.ts` (la config, la vista con las señas), la reconstrucción del difícil y sus tests.
- `packages/server`: ningún cambio de código.
- `packages/client`: las opciones y la mesa de la Brisca, los textos, la guía y el E2E.
