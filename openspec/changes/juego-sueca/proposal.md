## Why

La Sueca es el juego de bazas más popular de Portugal. Se juega entre cuatro, en parejas, con 40 cartas: los Ases y los sietes valen casi todo, y la pareja que pasa de 60 puntos gana la mano. Es sencilla y rápida, y completa la familia de juegos de bazas con puntos de la suite (Brisca, Tute, Butifarra) con una versión portuguesa de baraja francesa.

## What Changes

- Nuevo juego **Sueca** para 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** 40 cartas francesas sin ochos, nueves ni dieces. Orden de mayor a menor: A, 7, K, J, Q, 6, 5, 4, 3 y 2. Puntos: A 11, 7 10, K 4, J 3 y Q 2; en total, 120.
  - **Reparto:** 10 cartas a cada uno. La última carta del repartidor se enseña: su palo es el triunfo, y la carta es suya y se ve hasta que la juega. Sale el siguiente al repartidor.
  - **Bazas:** hay que seguir el palo de salida; si no se puede, cualquier carta. Gana el triunfo más alto o la carta más alta del palo de salida.
  - **Mano:** la pareja con 61 a 90 puntos gana 1 juego; con 91 a 119, 2 juegos; con los 120, 4 juegos. Con 60 a 60 nadie gana nada.
  - **Partida:** gana la pareja que llega antes a 4 juegos. El repartidor pasa al siguiente en cada mano.
- **IA de la Sueca en los tres niveles:**
  - **Normal:** sale con los Ases; carga puntos cuando la baza es de su compañero; gana con lo justo las bazas que valen y suelta lo que menos vale.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite la Sueca como un juego más en red.
- **Cliente:**
  - la Sueca en el menú;
  - una mesa de bazas para cuatro con el triunfo, la carta del triunfo, los puntos y los juegos;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:** el renuncio con penalización y las variantes con otras formas de elegir el triunfo.

## Capabilities

### New Capabilities
- `juego-sueca`: reglas de la Sueca:
  - baraja, reparto y triunfo;
  - bazas;
  - puntos y juegos de la mano;
  - partida a 4 juegos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Sueca.
- `niveles-ia`: la Sueca entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye la Sueca con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/sueca.ts`, `ia/sueca-basica.ts` e `ia/reconstruir/sueca.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaSueca.svelte` y `ResumenSueca.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - el triunfo con la última carta del repartidor;
  - la partida a 4 juegos;
  - sin renuncio.
