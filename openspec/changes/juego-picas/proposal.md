## Why

La suite tiene muchos juegos de bazas con baraja española y uno con francesa (los Corazones), pero ninguno de bazas en parejas con apuesta del número de bazas. Picas (Spades) es el más jugado de esa familia: cada uno dice cuántas bazas hará, la pareja suma sus apuestas y tiene que cumplirlas sin pasarse demasiado. Además, el Nil (apostar a no hacer ninguna baza) obliga al compañero a jugar para protegerlo, y eso da mucho juego a la IA.

## What Changes

- Nuevo juego **Picas**, jugable contra la IA y en red, para 4 jugadores en dos parejas (los asientos 0 y 2 contra 1 y 3):
  - **Reparto:** baraja francesa de 52 cartas, 13 a cada jugador. El reparto pasa al siguiente en cada mano.
  - **Apuesta:** empezando por el de la izquierda del que reparte, cada jugador dice cuántas bazas hará, de 1 a 13, o **Nil** (ninguna). El contrato de la pareja es la suma de las apuestas de sus dos jugadores, sin contar los Nil.
  - **Bazas:** sale el de la izquierda del que reparte. Hay que seguir el palo de salida si se tiene; si no, se puede echar cualquier carta. Las picas son siempre triunfo. No se puede salir de picas hasta que alguien haya echado una pica en una baza en que no se salió de picas («picas rotas»), salvo que solo queden picas en la mano. Gana la baza la pica más alta o, si no hay picas, la más alta del palo de salida (el As es la carta más alta).
  - **Puntos de la pareja:**
    - si sus bazas llegan al contrato, 10 por cada baza del contrato, y 1 por cada baza de más (un **saco**);
    - si no llegan, pierde 10 por cada baza del contrato;
    - cada Nil cumplido (el jugador no hizo ninguna baza) suma 100, y cada Nil fallado resta 100. Las bazas del jugador que dijo Nil no cuentan para el contrato: son sacos de la pareja;
    - al juntar 10 sacos, la pareja pierde 100 puntos y descuenta esos 10 sacos.
  - **Partida:** gana la primera pareja que llega a 500 puntos al acabar una mano. Si llegan las dos, gana la que más tenga; si empatan, se juega otra mano.
- **IA de Picas en los tres niveles:**
  - la básica cuenta sus bazas seguras para apostar (ases, reyes con compañía, picas altas y picas largas) y dice Nil con una mano muy baja. Al jugar intenta cumplir el contrato de la pareja sin sumar sacos de más, protege al compañero que dijo Nil y, si ella dijo Nil, se deshace de sus cartas altas sin ganar bazas;
  - la fácil se equivoca a veces;
  - la difícil simula cada carta que juega repartiendo al azar las cartas que no ve, sabiendo qué palos le faltan a cada uno. La apuesta la decide como la normal, igual que en el resto de juegos con apuestas.
- El servidor de salas admite Picas como un juego más en red, con 4 asientos.
- **Cliente:**
  - Picas en el menú, con sus opciones (el nivel de la IA);
  - una mesa sobre la mesa de bazas compartida: la apuesta de cada jugador y las bazas que lleva, el contrato de cada pareja, si las picas están rotas, y la ventana para apostar (Nil o de 1 a 13);
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el Nil a ciegas;
  - perder la partida al bajar de −200;
  - variantes con comodines o con el 2 de picas como triunfo más alto;
  - jugar individual o con 3 jugadores.

## Capabilities

### New Capabilities
- `juego-picas`: reglas de Picas:
  - reparto;
  - apuesta y Nil;
  - bazas con picas de triunfo y picas rotas;
  - puntos, sacos y Nil;
  - partida a 500;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de Picas.
- `niveles-ia`: Picas entra en la lista de juegos con tres niveles; su difícil simula las cartas y apuesta como la normal, y su reconstrucción respeta los fallos conocidos.
- `mesa-cliente`: el menú incluye Picas con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/picas.ts`, `ia/picas-basica.ts` e `ia/reconstruir/picas.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaPicas.svelte` y `ResumenPicas.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas son las de Picas clásico y las ha elegido el usuario:
  - con Nil (±100);
  - −100 al juntar 10 sacos;
  - partida a 500.
