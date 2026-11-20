## Why

Núñez Elvira cuenta la Siete y media de otra manera: cobra el doble cualquier jugador que gana a la banca con siete y media, con las cartas que sea (un 7 y una figura, pero también un 4, un 3 y una figura, o un 5, un 2 y una figura). La suite solo paga doble la siete y media natural, de dos cartas. La revisión de los libros lo dejó apuntado como variante pendiente. Es la última de las variantes de la Siete y media que da Núñez: pedir la carta tapada y que la banca pase a quien gana con siete y media ya son opciones.

## What Changes

- **Opción «Con cualquier siete y media» en la Siete y media**, desactivada por defecto, dentro del pago doble:
  - con ella, cobra el doble todo punto que gana con siete y media, tenga las cartas que tenga;
  - solo cuenta si el pago doble está activado; sin pago doble, nadie cobra el doble.
- **IA:** sin cambios. La normal ya se planta con siete y media, y el difícil simula con el motor, así que ya cuenta el pago nuevo.
- **Cliente:**
  - la casilla en las opciones de la Siete y media, en local y al crear una sala en red, desactivada si no hay pago doble;
  - la guía explica la variante y en qué opción se activa.
- Las partidas guardadas y las salas sin esta opción siguen como hasta ahora: solo cobra el doble la natural.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-siete-y-media`: el pago doble con cualquier siete y media.
- `mesa-cliente`: la opción y la guía.

## Impact

- `packages/engine`: `juegos/siete-y-media.ts` (la config y la liquidación) y sus tests.
- `packages/server`: ningún cambio de código.
- `packages/client`: las opciones, los textos, la guía y el E2E.
