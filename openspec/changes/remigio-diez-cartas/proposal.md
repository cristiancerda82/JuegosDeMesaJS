## Why

Núñez Elvira describe el Remigio de otra manera que la suite. Se juega con dos barajas de 52 cartas y comodines, y se reparten 10 cartas. Nadie baja durante la mano: se cierra de golpe, cuando las diez cartas quedan ligadas. Los cierres difíciles multiplican lo que pagan los demás:
- sin comodines;
- de «color», las diez del mismo palo o del mismo color;
- escalera de diez;
- escalera de color.

La guía solo lo menciona como algo «de otros sitios». La revisión de los libros lo dejó apuntado como variante pendiente.

## What Changes

- **Opción «Diez cartas» en el Remigio**, desactivada por defecto, en local y en las salas en red. Con ella:
  - **Baraja y reparto:** dos barajas francesas de 52 cartas y 4 comodines (108 cartas), y 10 cartas a cada uno.
  - **Turno:** se roba del mazo o del montón y se descarta. No se baja, no se añade y no se cambian comodines.
  - **Cerrar:** el jugador cierra en lugar de descartar si, al soltar una carta, las otras diez quedan ligadas.
  - **Combinaciones:**
    - grupos de 3 o más cartas del mismo número, sin importar el palo;
    - escaleras de 3 o más cartas seguidas, sin importar el palo. El As va abajo (A-2-3) o arriba (Q-K-A), pero no da la vuelta.
    - El comodín sustituye a cualquier carta, y cada combinación lleva al menos 2 cartas naturales.
    - Las diez cartas también quedan ligadas si son todas del mismo palo o del mismo color (rojo o negro), aunque no combinen.
  - **Puntos:** cada jugador que no cierra suma las cartas que no puede ligar. Cada número vale lo suyo, la J 10, la Q 11, la K 12 y el comodín 25.
  - **Premios del cierre:** lo que suman los demás se multiplica según cómo cierra quien cierra:
    - ×2 sin comodines;
    - ×3 o ×4 con color (con o sin comodines);
    - ×5 o ×6 con escalera de diez;
    - ×8 o ×10 con escalera de color.
  - **Lo que no cambia:** la eliminación al pasar de 100, la mano anulada si el mazo se agota por tercera vez y el final de la partida.
- **IA:**
  - la normal cierra en cuanto puede, roba del montón si la carta le baja los puntos sin ligar y descarta la carta que menos puntos sin ligar le deja;
  - el difícil simula el robo y el descarte, y cierra como la normal.
- **Cliente:**
  - la casilla en las opciones del Remigio, en local y en red;
  - la mesa con el botón «Cerrar», sin la zona de combinaciones y con los puntos sin ligar de la mano;
  - el resumen con el premio del cierre y las cartas sin ligar de cada uno;
  - el Remigio aparece también con el filtro de baraja francesa;
  - la guía explica la variante en lugar de mencionarla como algo de otros sitios.
- Las partidas guardadas y las salas sin la opción siguen como hasta ahora.

## Capabilities

### New Capabilities
Ninguna.

### Modified Capabilities
- `juego-remigio`: la variante de diez cartas.
- `ia-jugadores`: la IA normal con diez cartas.
- `niveles-ia`: lo que simula el difícil con diez cartas.
- `mesa-cliente`: la opción, la mesa, el resumen y la guía.
- `menu-juegos`: el Remigio con las dos barajas en el filtro.

## Impact

- `packages/engine`:
  - `juegos/remigio-combinaciones.ts`: las cartas francesas y los puntos;
  - un módulo nuevo para ligar las diez cartas y para los premios;
  - `juegos/remigio.ts`, la IA normal, la reconstrucción y sus tests.
- `packages/server`: ningún cambio de código.
- `packages/client`: las opciones, la mesa y el resumen del Remigio, el catálogo, los textos, la guía y el E2E.
