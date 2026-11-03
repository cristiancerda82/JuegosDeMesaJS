## Why

El Truco argentino es el juego de cartas más popular de Argentina y Uruguay. Es un juego de engaño: se apuesta al envido (la suma de las cartas del mismo palo) y al truco (ganar dos de tres bazas), y se gana tanto con buenas cartas como con faroles. La suite ya tiene el Truc valenciano, con la misma baraja, la misma jerarquía de cartas y las mismas bazas y pardas; el Truco cambia las apuestas (envido, real envido y falta envido; truco, retruco y vale cuatro) y la cuenta (una partida a 30, en malas y buenas). Se añade reaprovechando el motor, la IA y la mesa del Truc.

## What Changes

- Nuevo juego **Truco** para 2 jugadores o 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja y bazas:** como el Truc: la española de 40 cartas, 3 cartas a cada uno, la misma jerarquía (As de espadas, As de bastos, 7 de espadas, 7 de oros, treses…), sin palo obligatorio, y las mismas reglas de las pardas.
  - **Envido:** con los mismos puntos que el envit del Truc, solo en la primera baza y mientras no se haya aceptado un truco.
    - Se canta envido (2), real envido (3) o falta envido; quien responde quiere, no quiere o sube: el envido se puede cantar dos veces, después el real envido y al final la falta envido.
    - Querido, vale la suma de lo cantado; la falta envido vale lo que le falta al bando que va ganando para llegar a 30.
    - No querido, vale lo querido antes de la última subida, o 1.
    - «El envido está primero»: quien responde a un truco en la primera baza puede cantar envido antes.
  - **Truco:** truco (2), retruco (3) y vale cuatro (4). Solo sube el bando que aceptó; no querido vale lo anterior.
  - **Irse al mazo:** en su turno o al responder; el rival cobra lo que valga la mano.
  - **Partida:** a 30 puntos, las 15 primeras «malas» y las 15 siguientes «buenas». Al final de la mano se suma primero el envido y después el truco; gana el primer bando que llega a 30.
- **IA del Truco en los tres niveles:**
  - **Normal:** como la del Truc: canta el envido según sus puntos, truca y responde por la fuerza de su mano, a veces farolea y juega la carta más barata que gana.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** apuesta como la normal y simula la carta que juega hasta el final de la mano.
- El servidor de salas admite el Truco como un juego más en red.
- **Cliente:**
  - el Truco en el menú, con la opción de 2 o 4 jugadores;
  - una mesa de bazas con los botones de cada apuesta, lo que vale la mano, el envido y los puntos en malas y buenas;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - la flor;
  - la partida a 15;
  - las señas entre compañeros;
  - el punto extra por irse al mazo sin cantar el envido.

## Capabilities

### New Capabilities
- `juego-truco`: reglas del Truco argentino:
  - baraja, jugadores, reparto y bazas;
  - envido, real envido y falta envido;
  - truco, retruco y vale cuatro;
  - irse al mazo;
  - puntuación y partida a 30;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Truco.
- `niveles-ia`: el Truco entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Truco con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/truco.ts`, `ia/truco-basica.ts` e `ia/reconstruir/truco.ts`, con sus tests y la suite genérica del contrato;
  - se reaprovechan `rangoTruc`, `puntosEnvit` y `ganadorDeLaMano` del Truc;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaTruco.svelte` y `ResumenTruco.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 2 jugadores o 4 en parejas, a elegir;
  - sin flor;
  - la partida a 30, en malas y buenas.
