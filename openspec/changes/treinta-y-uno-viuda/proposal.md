## Why

La guía del Treinta y uno ya cuenta que «en otros sitios no se roba del mazo: hay tres cartas boca arriba en la mesa, la viuda». Es la forma más jugada en Alemania y Centroeuropa (Schwimmen), y cambia mucho el juego. Todo está a la vista, cada turno es una sola decisión y se ve qué buscan los demás por lo que cogen y dejan.

Es la primera de las variantes que las guías solo mencionan y que ahora se pueden jugar, como ya se hizo con las reglas de los libros.

## What Changes

- **Opción «Con viuda» en el Treinta y uno**, desactivada por defecto. Con ella activada:
  - **Reparto:** 3 cartas a cada jugador y 3 boca arriba en la mesa, la viuda. No hay descarte.
  - **Turno:** el jugador hace una de estas cosas:
    - **cambiar una** de sus cartas por una de la viuda;
    - **cambiar las tres** por las tres de la viuda;
    - **pasar**;
    - **plantarse**, si nadie se ha plantado aún.
  - **Todos pasan:** si pasan todos los jugadores con vidas seguidos, la viuda se aparta y se ponen tres cartas nuevas del mazo. Si el mazo no tiene bastantes, se barajan las apartadas.
  - **Igual que sin viuda:** plantarse, el último turno de los demás, las 8 vueltas como máximo, el valor de las manos, las vidas y el 31.
- **IA:**
  - **Normal:** con 27 o más se planta. Si no, hace el cambio que más sube su mano (una carta o las tres) y, si ninguno la sube, pasa.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula también estas jugadas, con la viuda a la vista.
- **Cliente:**
  - la casilla en las opciones del Treinta y uno, en local y al crear una sala en red;
  - en la mesa, la viuda en el centro;
  - para jugar: tocar una carta propia y una de la viuda para cambiarlas, y botones «Cambiar las tres», «Pasar» y «Plantarse»;
  - el aviso de lo que hizo el último y de cuándo se renueva la viuda;
  - la línea «En otros sitios…» de la guía pasa a explicar la variante y en qué opción se activa, con un ejemplo.
- Las partidas guardadas y las salas sin esta opción siguen como hasta ahora: si falta, cuenta como desactivada.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-treinta-y-uno`: la variante con viuda.
- `ia-jugadores`: la IA básica del Treinta y uno con viuda.
- `niveles-ia`: la reconstrucción del Treinta y uno con la viuda a la vista.
- `mesa-cliente`: la opción, la mesa con la viuda y la guía.

## Impact

- `packages/engine`:
  - `juegos/treinta-y-uno.ts`: la config, el estado, las acciones y la vista;
  - `ia/treinta-y-uno-basica.ts` e `ia/reconstruir/treinta-y-uno.ts`;
  - los tests.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - `MesaTreintaYUno.svelte`;
  - las opciones;
  - los textos y la guía, con su ejemplo;
  - el E2E.
- Las reglas las ha elegido el usuario:
  - se puede pasar, y si pasan todos, hay viuda nueva;
  - el 31 no cambia.
