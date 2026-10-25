## Why

El Scorpion es un solitario clásico de una baraja, primo del Spider, pero con un giro que lo hace muy distinto: se puede mover cualquier carta descubierta, aunque tenga encima cartas desordenadas, siempre que vaya sobre la siguiente de su palo. Así cada movimiento reordena columnas enteras, y el reto es desenterrar las cartas tapadas a tiempo. Reutiliza casi todo del Spider: las columnas con cartas tapadas, deshacer, la pista y los récords.

## What Changes

- Nuevo solitario **Scorpion**, con la baraja francesa de 52 cartas:
  - **Reparto:** 7 columnas de 7 cartas. En las 4 primeras, las 3 de abajo van tapadas y las 4 de arriba descubiertas; en las otras 3, todas descubiertas. Las 3 cartas que sobran forman la **reserva**.
  - **Mover:** cualquier carta descubierta se puede mover, con todas las que tenga encima, sobre la carta de arriba de otra columna si esa carta es la siguiente de su mismo palo (el 6 de picas sobre el 7 de picas).
  - **Columnas vacías:** solo admiten una K, con lo que tenga encima.
  - **Cartas tapadas:** cuando una queda arriba de su columna, se descubre sola.
  - **Reserva:** el jugador puede repartirla cuando quiera, una sola vez: una carta a cada una de las 3 primeras columnas.
  - **Victoria:** cuando cada palo forma en la mesa una escalera de la K al As. Movimientos, tiempo, deshacer y abandonar, como en el resto de solitarios.
- **Pista:** prefiere descubrir cartas tapadas y unir escaleras del mismo palo; si no hay nada útil, sugiere repartir la reserva.
- **Récords:** el mejor tiempo y los menos movimientos, como en el resto de solitarios.
- **Cliente:**
  - el Scorpion en el menú;
  - una mesa con las 7 columnas y la reserva;
  - mover arrastrando o tocando, deshacer, pista, abandonar y el aviso de partida atascada;
  - el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - las variantes con todas las cartas descubiertas;
  - huecos para cualquier carta (Wasp);
  - retirar las escaleras completas como en el Spider.

## Capabilities

### New Capabilities
- `juego-scorpion`: reglas del Scorpion:
  - reparto y reserva;
  - mover cartas con las que tienen encima;
  - columnas vacías;
  - cartas tapadas;
  - deshacer, victoria y abandonar;
  - vista.

### Modified Capabilities
- `pistas-solitarios`: el Scorpion tiene su pista, y su partida atascada se detecta como en el resto de solitarios.
- `estadisticas`: el Scorpion entra en los récords de los solitarios.
- `mesa-cliente`: el menú incluye el Scorpion con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevo `juegos/scorpion.ts`, con sus tests y la suite genérica del contrato;
  - `pistaScorpion` en `ia/pistas.ts`.
- `packages/server`: ningún cambio (los solitarios no se juegan en red).
- `packages/client`:
  - nueva `MesaScorpion.svelte`, a partir de la del Spider;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - el reparto clásico con 3 cartas de reserva;
  - solo una K en las columnas vacías;
  - las escaleras completas se quedan en la mesa.
