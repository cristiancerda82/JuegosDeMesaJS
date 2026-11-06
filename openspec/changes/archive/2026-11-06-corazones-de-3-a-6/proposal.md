## Why

Los Corazones de la suite solo se juegan con 4. Su variante más extendida, el Black Lady, se juega igual con 3, 5 o 6 jugadores quitando algunos doses para que el reparto salga igual. Con esa opción, los Corazones sirven también para mesas que no son de cuatro, sin un juego nuevo en el menú.

## What Changes

- **Opción de jugadores:** los Corazones ganan la opción de jugadores, de 3 a 6 (4 por defecto). Con 4, todo sigue igual.
- **Cartas que se quitan para que el reparto salga igual:**

  | Jugadores | Se quitan | Cartas por jugador |
  |---|---|---|
  | 3 | el 2 de diamantes | 17 |
  | 4 | — | 13 |
  | 5 | el 2 de diamantes y el 2 de picas | 10 |
  | 6 | el 2 y el 3 de diamantes y de picas | 8 |

  Siguen los 13 corazones y la Q de picas, así que la mano sigue valiendo 26 puntos y la luna funciona igual.
- **Sin pase:** con 3, 5 o 6 no hay pase. El pase sigue siendo una opción solo con 4.
- **IA:** los tres niveles de la IA sirven con cualquier número de jugadores.
- **En red:** la sala de los Corazones tiene tantos asientos como jugadores.
- **Cliente:**
  - las opciones de los Corazones tienen la de jugadores;
  - la opción de pase solo se ve con 4;
  - la mesa, el resumen y la pantalla de fin se adaptan al número de jugadores;
  - la guía explica el Black Lady.
- **Partidas guardadas:** las de antes, sin la opción, siguen siendo de 4.

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
- `juego-corazones`: el reparto admite de 3 a 6 jugadores; el pase solo con 4; la luna suma 26 a cada uno de los demás.
- `ia-jugadores`: la IA de los Corazones juega con cualquier número de jugadores.
- `mesa-cliente`: las opciones y la mesa de los Corazones admiten de 3 a 6 jugadores.

## Impact

- `packages/engine`:
  - cambian `juegos/corazones.ts`, la IA básica y la reconstrucción de los Corazones, y sus tests;
  - la tabla de niveles y las pruebas de reconstrucción añaden configuraciones con 3, 5 y 6.
- `packages/server`: ningún cambio de código; la sala toma los asientos del juego.
- `packages/client`: cambian:
  - las opciones;
  - `MesaCorazones` y su resumen;
  - la pantalla de fin;
  - los textos y la guía;
  - los E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - opción dentro de los Corazones;
  - sin pase con 3, 5 o 6.
