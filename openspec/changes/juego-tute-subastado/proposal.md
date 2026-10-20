## Why

El Tute subastado es la variante de 4 jugadores más jugada del Tute. No hay parejas fijas: en cada mano se subasta cuántos puntos se van a hacer, y quien gana la subasta elige el triunfo y juega solo contra los otros tres. Añade a la suite algo que no tiene:
- una subasta de puntos con un compromiso que se cumple o se falla;
- bandos que cambian en cada mano (uno contra tres).

Reutiliza casi todo lo que ya hay: el orden y los puntos del Tute, los cantes, el motor de bazas con obligaciones, la mesa de bazas de 4 y la IA por simulación.

## What Changes

- Nuevo juego **Tute subastado**, jugable contra la IA y en red, con 4 jugadores, cada uno por su cuenta:
  - **Reparto:** baraja española de 40 cartas, 10 a cada jugador, sin muestra. El reparto rota y es mano el siguiente al repartidor.
  - **Subasta:** desde la mano, cada jugador puja o pasa, y quien pasa ya no vuelve a pujar. La primera puja es de 60 como mínimo y cada puja sube la anterior de 10 en 10, hasta 230. La subasta acaba cuando todos los demás han pasado tras la última puja. Si pasan los cuatro sin pujar, se reparte otra vez con el siguiente repartidor y la mano no cuenta.
  - **Triunfo:** quien gana la subasta (el **pujador**) mira su mano y elige el palo de triunfo. Luego sale él en la primera baza.
  - **Bazas:** se juegan las 10 bazas con el orden y los puntos del Tute (As 11, 3 10, Rey 4, Caballo 3, Sota 2) y 10 de últimas. Hay que seguir el palo y superar si se puede; sin el palo, fallar con triunfo y superar el triunfo más alto si se puede. Se supera siempre, también la carta de un compañero, porque los bandos solo duran una mano.
  - **Cantes:** como en el Tute, quien acaba de ganar una baza puede cantar las 20 o las 40 con rey y caballo, y el tute con los 4 reyes o los 4 caballos. Cantan el pujador y los defensores, y cada cante suma a su bando.
  - **Cobro:** el pujador **cumple** si sus bazas, sus cantes y las 10 de últimas suman al menos lo que pujó. Si cumple, cobra de cada rival una ficha por cada 10 puntos pujados; si falla, paga lo mismo a cada uno. Si canta el tute, cumple en el acto; si lo canta un defensor, el pujador falla en el acto.
  - **Partida:** todos empiezan con 0 fichas y el saldo puede ser negativo. Se juegan 8 manos (4 o 12 en Opciones). Gana quien más fichas tiene; si hay empate, ganan todos los empatados.
- **IA del Tute subastado en los tres niveles:**
  - la básica estima los puntos que haría con cada palo de triunfo, puja hasta esa estimación, elige el palo que más le da y juega las bazas como en el Tute, ayudando a sus compañeros de bando;
  - la fácil se equivoca a veces;
  - la difícil simula la elección del triunfo, los cantes y cada carta. Las pujas las decide como la normal.
- El servidor de salas admite el Tute subastado como un juego más en red, con 4 asientos.
- **Cliente:**
  - el Tute subastado en el menú y sus opciones (manos y nivel de la IA);
  - una mesa propia sobre la mesa de bazas de 4, con el panel de la subasta («Paso» y las pujas posibles), la elección del triunfo, la puja vigente con el pujador, los puntos que lleva el pujador frente a lo que pujó y las fichas de cada jugador;
  - el resumen de cada mano, la clasificación por fichas en la pantalla de fin y la guía «¿Cómo se juega?».
- **Fuera de alcance:** el capote (pujar todas las bazas), la subasta con muestra, el «arrastre» de 2 o 3 jugadores, las pujas de 5 en 5 y acabar la mano antes de tiempo cuando el resultado ya está decidido.

## Capabilities

### New Capabilities
- `juego-tute-subastado`: reglas del Tute subastado:
  - reparto;
  - subasta;
  - elección del triunfo;
  - bazas con obligaciones;
  - cantes y tute;
  - cobro en fichas;
  - fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Tute subastado (puja, triunfo, cantes y juego de cartas).
- `niveles-ia`: el Tute subastado entra en la lista de juegos con tres niveles y en la reconstrucción de las cartas ocultas. Su difícil simula el triunfo, los cantes y las cartas, no las pujas.
- `mesa-cliente`: el menú incluye el Tute subastado con su mesa, su resumen y su clasificación.

## Impact

- `packages/engine`:
  - nuevos `juegos/tute-subastado.ts`, `ia/tute-subastado-basica.ts` e `ia/reconstruir/tute-subastado.ts`, con sus tests y la suite genérica del contrato;
  - del Tute se exportan, sin cambiarlos, las ayudas de cantes (`palosCantables`, `tieneTute`) para no duplicarlas;
  - usa `cartasObligadas`/`cartaGanadora` de `motor/bazas.ts` y `repartirConFallos` de la reconstrucción de la Butifarra sin cambiarlos;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaTuteSubastado.svelte` y `ResumenTuteSubastado.svelte`, sobre `MesaBazas`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen del Tute subastado clásico y las valida el usuario:
  - el triunfo que elige el pujador;
  - la subasta de 60 a 230 de 10 en 10;
  - que salga el pujador;
  - superar siempre, también al compañero;
  - el cobro de una ficha por cada 10 puntos pujados a cada rival;
  - las 8 manos.
