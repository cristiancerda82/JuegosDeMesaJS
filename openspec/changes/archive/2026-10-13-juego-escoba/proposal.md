## Why

La Escoba es, junto a la Brisca y el Tute, uno de los juegos más populares con la baraja española, y la suite aún no tiene ningún juego de capturas. Su mecánica (sumar 15 con cartas de la mesa) es distinta de las bazas: exige un modelo nuevo en el motor y una forma nueva de interactuar en la mesa, la elección de qué cartas recoger. Con eso, la base queda preparada para otros juegos de capturas.

## What Changes

- Nuevo juego **Escoba** (escoba del 15) con baraja española de 40 cartas, jugable de principio a fin contra la IA:
  - 2 jugadores, o 4 en parejas.
  - Reparto de 3 cartas por jugador y 4 a la mesa. Cuando se acaban las manos se reparten 3 más hasta agotar el mazo.
  - Al jugar una carta se pueden recoger de la mesa las cartas que, con ella, sumen 15. El As vale 1, del 2 al 7 su número, la Sota 8, el Caballo 9 y el Rey 10.
  - Escoba (+1 punto) al dejar la mesa vacía. Al final de la mano, el último que recogió se lleva las cartas que queden en la mesa.
  - Puntuación de la mano: escobas, más cartas, más oros, el 7 de oros (el «velo») y más sietes.
  - Partida a 15, 21 o 31 puntos.
  - Variantes como configuración: si recoger es obligatorio y si la mesa inicial que suma 15 cuenta como escoba del repartidor.
- IA básica de la Escoba: prioriza las escobas y las cartas valiosas, y evita dejar la mesa a tiro de escoba del rival.
- El cliente suma la Escoba al menú, sus opciones, su mesa con la elección de captura, el detalle de la puntuación al final de la mano y su guía "¿Cómo se juega?".
- Fuera de alcance: la «primera» italiana (Scopa) y sus variantes, los bonos por todos los oros o todos los sietes, y el modo en red.

## Capabilities

### New Capabilities
- `juego-escoba`: reglas de la Escoba del 15 con 2 jugadores y 4 en parejas: reparto, capturas, escobas, puntuación de la mano, partida a N puntos y variantes configurables.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Escoba, con su nivel mínimo de juego y sus escenarios.
- `mesa-cliente`: el menú incluye la Escoba, y la mesa permite elegir qué cartas recoger y muestra el detalle de la puntuación de cada mano.

## Impact

- `packages/engine`: nuevos `juegos/escoba.ts` e `ia/escoba-basica.ts`, con sus tests y la suite genérica del contrato. Se reutilizan la baraja, el azar, el reparto y `bandoDe`/`siguiente` del módulo de bazas, que no cambian.
- `packages/client`: nueva mesa de la Escoba, que reutiliza los asientos rivales y la mano propia de la mesa de bazas. También cambian las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas se redactan a partir del conocimiento del juego clásico y las valida el usuario, igual que en los otros juegos.
