## Why

El Sixty-six es el antepasado alemán del Schnapsen y el más jugado fuera de Austria. Los dos juegos solo se distinguen en tres cosas:
- la baraja de 24 cartas, con los 9;
- las manos de 6 cartas;
- las 10 de últimas.

El proyecto pide que las variantes regionales sean configuración y no código. Por eso el Sixty-six entra como una variante del Schnapsen, con su propia entrada en el menú, y reaprovecha el motor, las IAs, la reconstrucción y la mesa.

## What Changes

- **Variante Sixty-six del Schnapsen** (`variante: 'sixtySix'` en la configuración; sin ella, el Schnapsen de siempre):
  - **Baraja:** la francesa de 24 cartas: As, 10, K, Q, J y 9 de cada palo. El 9 es la carta más baja y no vale puntos.
  - **Reparto:** 6 cartas a cada uno y la carta vuelta; quedan 11 en el mazo.
  - **Cambio:** el que tiene el 9 del triunfo lo puede cambiar por la carta vuelta, en lugar de la J.
  - **Diez de últimas:** con el mazo agotado sin cerrar, quien gana la última baza suma 10 puntos a su mano.
  - **Igual que el Schnapsen:** cantes de 20 y 40, cerrar el mazo, la obligación de seguir y fallar con el mazo cerrado o agotado, los puntos de partida (1, 2 o 3) y la partida a 7.
- **IA:** las tres IAs del Schnapsen sirven para la variante tal cual: la normal, la fácil y la difícil, con su reconstrucción sobre la baraja de 24.
- El servidor de salas admite el Sixty-six como un juego más en red, con la configuración de la variante.
- **Cliente:**
  - el Sixty-six en el menú como una entrada propia;
  - la mesa, el resumen y la pantalla de fin del Schnapsen, con «Cambiar el 9» en lugar de «Cambiar la J»;
  - su guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - anunciar el 66 a mano (la mano se cierra sola al llegar, como en el Schnapsen);
  - la partida a 11.

## Capabilities

### New Capabilities
<!-- Ninguna: el Sixty-six es una variante del Schnapsen. -->

### Modified Capabilities
- `juego-schnapsen`: se agrega la variante Sixty-six.
- `niveles-ia`: el Sixty-six entra en la lista de juegos con tres niveles, con las IAs del Schnapsen.
- `mesa-cliente`: el menú incluye el Sixty-six con la mesa del Schnapsen.

## Impact

- `packages/engine`:
  - `juegos/schnapsen.ts`:
    - `ConfigSchnapsen` gana `variante` opcional;
    - la baraja, el tamaño de la mano, la carta del cambio y las 10 de últimas dependen de ella;
  - la reconstrucción usa la baraja de la variante;
  - se registra el Sixty-six en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`: la definición `sixtySix` en `juegos.ts` y `partida.ts`, el menú, los textos, la guía, la pantalla de fin y los E2E.
- Las partidas guardadas del Schnapsen siguen valiendo: sin `variante`, todo es como antes.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario: variante del Schnapsen, partida a 7.
