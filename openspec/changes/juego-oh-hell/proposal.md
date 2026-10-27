## Why

El Oh Hell es el juego de apuestas de bazas más jugado en el mundo anglosajón: de 3 a 7 jugadores, cada uno por su cuenta, tienen que acertar exactamente cuántas bazas harán en manos que van menguando y vuelven a crecer. Es pariente de la Pocha, pero con baraja francesa de 52, más jugadores, manos mucho más largas y sin obligación de fallar. Reutiliza la mesa de bazas compartida y las apuestas de la Pocha.

## What Changes

- Nuevo juego **Oh Hell** clásico, jugable contra la IA y en red: de 3 a 7 jugadores, cada uno por su cuenta.
  - **Baraja:** francesa de 52. En cada palo, el orden es A, K, Q, J, 10… 2.
  - **Manos:** la primera mano reparte el máximo de cartas posible dejando al menos una para el triunfo (17 con 3 jugadores, 12 con 4, 10 con 5, 8 con 6 y 7 con 7). Cada mano siguiente reparte una carta menos hasta llegar a 1, y después una más cada vez hasta volver al máximo.
  - **Triunfo:** tras repartir, la siguiente carta del mazo se pone boca arriba y su palo es el triunfo.
  - **Apuestas:** desde la izquierda del repartidor, cada uno dice cuántas bazas hará, de 0 a las cartas de la mano. El repartidor apuesta el último y no puede elegir el número que haría que la suma de las apuestas fuera igual a las cartas repartidas.
  - **Jugar:** sale el de la izquierda del repartidor. Hay que seguir el palo de salida si se puede; si no, se juega cualquier carta. Gana el triunfo más alto o la carta más alta del palo de salida.
  - **Puntos:** quien hace exactamente las bazas que apostó suma 10 más su apuesta; quien no, nada.
  - **Partida:** termina tras la última mano de la secuencia; gana quien más puntos tenga, y si hay empate, ganan todos los empatados.
- **IA del Oh Hell en los tres niveles:**
  - la normal apuesta contando sus cartas ganadoras (Ases, triunfos altos y reyes acompañados) y juega para hacer las bazas que le faltan, o para no ganar ninguna más si ya las tiene;
  - la fácil se equivoca a veces;
  - la difícil simula la apuesta y cada carta con las manos ocultas repartidas al azar.
- El servidor de salas admite el Oh Hell como un juego más en red.
- **Cliente:**
  - el Oh Hell en el menú, con la opción de jugadores;
  - la mesa de bazas compartida con la carta del triunfo, los botones de apuesta (sin el prohibido al repartidor), la apuesta y las bazas de cada uno y los puntos;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - otras secuencias de manos y otras puntuaciones;
  - apostar sin restricción para el repartidor.

## Capabilities

### New Capabilities
- `juego-oh-hell`: reglas del Oh Hell:
  - baraja, jugadores y secuencia de manos;
  - triunfo;
  - apuestas con la restricción del repartidor;
  - bazas;
  - puntos y partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Oh Hell.
- `niveles-ia`: el Oh Hell entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Oh Hell con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/oh-hell.ts`, `ia/oh-hell-basica.ts` y `ia/reconstruir/oh-hell.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaOhHell.svelte` y `ResumenOhHell.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - de 3 a 7 jugadores, elegible;
  - manos del máximo a 1 y vuelta al máximo;
  - 10 más lo apostado si se acierta;
  - el repartidor no puede hacer que la suma cuadre.
