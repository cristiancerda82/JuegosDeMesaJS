## Why

La Scopa es el juego de cartas más popular de Italia, y el Scopone su versión por parejas más estratégica. Es pariente de la Escoba que ya tiene la suite, pero sus reglas cambian el juego:
- se captura por valor igual y no sumando 15;
- capturar es obligatorio;
- se puntúa la «primiera» y el settebello.

Con la baraja española de 40 cartas y el motor de capturas de la Escoba, se añade con poco código nuevo.

## What Changes

- Nuevo juego **Scopa** para 2 jugadores o 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** la española de 40 cartas; el As vale 1, del 2 al 7 su número, la sota 8, el caballo 9 y el rey 10. Los oros hacen de «denari».
  - **Reparto con 2:** 3 cartas a cada uno y 4 boca arriba en la mesa; cuando los dos se quedan sin cartas, otras 3 a cada uno hasta acabar el mazo.
  - **Reparto con 4 (Scopone):** 10 cartas a cada uno y la mesa vacía.
  - **Captura:** se juega una carta.
    - Si en la mesa hay cartas de su mismo valor, hay que llevarse una de ellas.
    - Si no, hay que llevarse varias que sumen su valor, si las hay.
    - Si no puede capturar, la carta se queda en la mesa.
  - **Scopa:** dejar la mesa vacía al capturar vale 1 punto, salvo con la última jugada de la mano.
  - **Fin de la mano:** las cartas que quedan en la mesa son para el último que capturó.
  - **Puntos de la mano:**
    - 1 por tener más cartas (más de 20);
    - 1 por más oros (más de 5);
    - 1 por el siete de oros (settebello);
    - 1 por la primiera;
    - y 1 por cada scopa.
  - **Partida:** a 11 puntos; si las dos llegan a la vez, gana la que tiene más, y con empate se juega otra mano.
- **IA de la Scopa en los tres niveles:**
  - **Normal:** elige la captura que más vale (scopa, settebello, sietes, oros y cartas) y, si no puede capturar, suelta la carta que menos vale procurando no dejar una scopa a tiro.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus jugadas hasta el final de la mano, con las cartas ocultas repartidas al azar.
- El servidor de salas admite la Scopa como un juego más en red.
- **Cliente:**
  - la Scopa en el menú, con la opción de 2 o 4 jugadores;
  - una mesa de capturas con la elección de las cartas que se llevan, las scopas y las cartas recogidas de cada bando;
  - el resumen de cada mano con la primiera, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el «asso piglia tutto»;
  - la partida a 21;
  - la Scopa por rondas con 4 jugadores.

## Capabilities

### New Capabilities
- `juego-scopa`: reglas de la Scopa y el Scopone:
  - baraja y reparto con 2 y con 4;
  - captura obligatoria por valor igual o por suma;
  - scopas;
  - fin de la mano;
  - puntos con la primiera;
  - partida a 11;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Scopa.
- `niveles-ia`: la Scopa entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye la Scopa con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/scopa.ts`, `ia/scopa-basica.ts` e `ia/reconstruir/scopa.ts`, con sus tests y la suite genérica del contrato;
  - se reaprovechan `combinaciones` y `valorEscoba` de la Escoba;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaScopa.svelte` y `ResumenScopa.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 2 jugadores o 4 en parejas, a elegir;
  - el Scopone con 4;
  - la partida a 11;
  - sin variantes de captura.
