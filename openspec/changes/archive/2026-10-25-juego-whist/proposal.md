## Why

El Whist es el abuelo de los juegos de bazas con baraja francesa y la base del Bridge: cuatro jugadores en parejas, sin subasta, con el triunfo decidido por la última carta que recibe el repartidor. Es el juego de bazas más puro de la suite: sin cantes ni puntos por carta, solo cuenta cuántas bazas hace cada pareja. Reutiliza casi todo de Picas: la baraja francesa, las parejas, las bazas con fallos conocidos y la mesa de 4.

## What Changes

- Nuevo juego **Whist** (clásico inglés), jugable contra la IA y en red, de 4 jugadores en dos parejas (0 y 2 contra 1 y 3), con la baraja francesa de 52 cartas:
  - **Reparto:** 13 cartas a cada uno. La última carta que recibe el repartidor se descubre: su palo es el triunfo de la mano. Todos la ven hasta que el repartidor la juega.
  - **Bazas:** sale el jugador a la izquierda del repartidor. Hay que seguir el palo de salida si se puede; si no, se juega cualquier carta. Gana la baza el triunfo más alto o, sin triunfos, la carta más alta del palo de salida (el As es la más alta). Quien gana la baza sale en la siguiente.
  - **Puntos:** al acabar la mano, la pareja que ha hecho más de 6 bazas suma 1 punto por cada baza por encima de 6.
  - **Juegos y partida:** un juego lo gana la primera pareja que llega a 5 puntos; los puntos que sobran se pierden y el siguiente juego empieza de 0. La partida (el *rubber*) la gana la primera pareja que gana dos juegos.
  - El repartidor rota cada mano.
- **IA del Whist en los tres niveles:**
  - la normal sale de su palo más largo, gana la baza con la carta justa si su compañero no la lleva ya, falla con el triunfo más bajo y descarta su carta más baja;
  - la fácil se equivoca a veces;
  - la difícil simula, como en Picas, la carta que juega con las manos ocultas repartidas al azar, respetando los fallos conocidos y la carta del triunfo del repartidor.
- El servidor de salas admite el Whist como un juego más en red, de 4 asientos.
- **Cliente:**
  - el Whist en el menú (con el nivel de la IA);
  - una mesa de bazas con el triunfo a la vista, las bazas de cada pareja y los puntos y juegos;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - los honores;
  - el Whist a 7 o a 9 puntos;
  - el Whist de 2 o 3 jugadores;
  - las variantes con subasta.

## Capabilities

### New Capabilities
- `juego-whist`: reglas del Whist:
  - reparto y triunfo;
  - bazas;
  - puntos de la mano;
  - juegos y partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Whist.
- `niveles-ia`: el Whist entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Whist con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/whist.ts`, `ia/whist-basica.ts` y `ia/reconstruir/whist.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaWhist.svelte` y `ResumenWhist.svelte`, a partir de las de Picas;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - el Whist clásico inglés;
  - al mejor de tres juegos;
  - la difícil por simulación.
