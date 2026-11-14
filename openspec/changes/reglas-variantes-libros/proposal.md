## Why

Al revisar los libros de reglas de `JuegosDeMesaJS_Docs` (Núñez, *El gran libro de los juegos de cartas*, y *Juegos de cartas*), salen cuatro reglas clásicas que nuestros juegos no tienen. Los jugadores que las conocen echan en falta poder jugar «como en casa». El usuario ha elegido las cuatro, todas como opción y desactivadas por defecto, para que las partidas de ahora no cambien.

## What Changes

- **Sobrefallo libre** (Tute, Guiñote y Butifarra): una opción nueva. Con ella activada, quien no tiene el palo de salida, tiene triunfos y no puede superar el triunfo que ya va ganando la baza puede jugar cualquier carta, en lugar de estar obligado a echar un triunfo más bajo. Es la regla de Núñez, que da la obligación de echar triunfo inferior como propia solo del Julepe.
- **Premios de la Escoba**: una opción nueva. Quien recoge los 10 oros se apunta 2 puntos por los oros en lugar de 1, y quien recoge los 4 sietes se apunta 3 por los sietes en lugar de 1. El desglose de la mano lo enseña.
- **Chinchón ampliado**, con dos opciones nuevas:
  - **Colocar las sueltas**: al cerrar, los demás jugadores, en orden de turno, colocan sus cartas sin ligar en las combinaciones de quien cierra y de los que ya han enseñado su mano, y esas cartas no les suman puntos. No vale si quien cierra lo hace con todo ligado (−10) o con chinchón.
  - **Reenganche**: quien pasa del límite vuelve a entrar una vez, con los puntos del jugador que más tenga entre los que siguen en la partida.
- **Cartas especiales del Ocho loco**: una opción nueva, tomada del «Ocho americano»:
  - el 10 cambia el sentido del juego;
  - el As obliga al siguiente a echar otro As o a robar 2;
  - el 6 obliga al siguiente a echar otro 6 o a robar 1;
  - el 7 hace que el siguiente pierda el turno;
  - tras un 9, quien no puede echar carta roba una y pierde el turno, sin poder jugar la que roba.
- **Opciones y guía**: cada regla nueva tiene su casilla en las opciones del juego, en local y al crear una sala en red. La guía del juego añade una línea que explica la variante y en qué opción se activa.
- La mesa enseña lo que pide cada regla:
  - en el Ocho loco, el sentido del juego y lo que obliga la última carta especial;
  - en el Chinchón, las cartas colocadas y quién se reengancha;
  - en la Escoba, los premios en el desglose.
- Las partidas guardadas y las configuraciones sin estas opciones siguen jugándose como hasta ahora: si falta una opción, cuenta como desactivada.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `juego-tute`: la opción de sobrefallo libre en las obligaciones de juego.
- `juego-guinote`: la opción de sobrefallo libre en el arrastre.
- `juego-butifarra`: la opción de sobrefallo libre en las obligaciones de la baza.
- `juego-escoba`: la opción de premios por todos los oros y por los cuatro sietes.
- `juego-chinchon`: las opciones de colocar las sueltas y de reenganche.
- `juego-ocho-loco`: la opción de cartas especiales.
- `mesa-cliente`: las casillas de las opciones nuevas, la línea de variante en la guía y lo que enseñan las mesas.

## Impact

- **Motor** (`packages/engine`):
  - `motor/bazas.ts`: una opción `sobrefalloLibre` en `cartasObligadas`;
  - `juegos/tute.ts`, `guinote.ts`, `butifarra.ts`, `escoba.ts`, `chinchon.ts` y `ocho-loco.ts`: un campo opcional nuevo en cada `Config`;
  - `chinchon.ts` y `ocho-loco.ts` guardan estado nuevo: los reenganches, el sentido y el castigo pendiente.
- **IA**: los agentes juegan con `accionesLegales`, así que siguen valiendo. La simulación de la IA difícil del Ocho loco tiene que reconstruir el estado nuevo.
- **Cliente** (`packages/client`):
  - `pantallas/Opciones.svelte` y `textos.ts`: opciones y textos de la guía;
  - las mesas y los resúmenes del Ocho loco, el Chinchón y la Escoba;
  - los ejemplos de la guía y E2E de las opciones nuevas.
- **Red**: el servidor valida la configuración con `crear`, igual que ahora. No hay cambios en el protocolo.
