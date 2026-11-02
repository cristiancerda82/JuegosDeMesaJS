## Why

El Tressette es, con la Scopa, el gran juego de cartas de Italia. Es un juego de bazas por parejas sin triunfo, con la baraja de 40 cartas: el 3 y el 2 son las cartas más altas, y los Ases y las figuras dan los puntos. Al no haber triunfo, todo depende de seguir el palo y de contar las cartas que han salido, así que completa la familia de bazas de la suite con un juego distinto de la Brisca, el Tute o la Sueca. Con la baraja española de la Scopa y el motor de bazas, se añade con poco código nuevo.

## What Changes

- Nuevo juego **Tressette** para 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** la española de 40 cartas. Orden de mayor a menor: 3, 2, As, rey, caballo, sota, 7, 6, 5 y 4.
  - **Reparto:** 10 cartas a cada uno, sin mazo. Sale el siguiente al repartidor.
  - **Bazas:** sin triunfo. Hay que seguir el palo de salida si se puede; si no, cualquier carta. Gana la carta más alta del palo de salida.
  - **Puntos de las cartas:** el As vale 1 punto; el 3, el 2, el rey, el caballo y la sota, un tercio de punto cada uno; las demás, nada. La última baza vale 1 punto más.
  - **Puntos de la mano:** cada pareja anota sus puntos enteros, sin los tercios sobrantes; entre las dos, siempre 11.
  - **Partida:** a 21 puntos. Si las dos parejas pasan de 21 en la misma mano, gana la que tiene más; con empate, se juega otra mano.
- **IA del Tressette en los tres niveles:**
  - **Normal:** sale con las cartas que ya son las más altas de su palo; carga puntos cuando la baza es segura para su compañero; gana con lo justo las bazas que valen y suelta lo que menos vale.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando los palos que cada uno no ha seguido.
- El servidor de salas admite el Tressette como un juego más en red.
- **Cliente:**
  - el Tressette en el menú;
  - una mesa de bazas para cuatro con los puntos de cada pareja en la mano (con los tercios) y en la partida;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - las acusas (napola y tres o cuatro cartas iguales de 3, 2 o As);
  - las señas habladas al compañero («busso», «striscio» y «volo»);
  - el Tressette de 2 jugadores con mazo;
  - el cappotto (llevarse todas las bazas) con premio.

## Capabilities

### New Capabilities
- `juego-tressette`: reglas del Tressette:
  - baraja, orden y reparto;
  - bazas sin triunfo;
  - puntos de las cartas, tercios y última baza;
  - puntos de la mano;
  - partida a 21;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Tressette.
- `niveles-ia`: el Tressette entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Tressette con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/tressette.ts`, `ia/tressette-basica.ts` e `ia/reconstruir/tressette.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaTressette.svelte` y `ResumenTressette.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 4 en parejas;
  - sin acusas;
  - la partida a 21.
