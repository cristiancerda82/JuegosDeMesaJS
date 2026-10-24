## Why

La suite tiene juegos de combinaciones con baraja española (Chinchón, Remigio) y el Pinacle, pero no el Gin Rummy, el más jugado de la familia con baraja francesa. Es un duelo de 2 jugadores con mucha decisión en cada turno: qué carta robar, cuál soltar y cuándo cerrar, sabiendo que si el rival tiene menos puntos sueltos te gana la mano (el undercut). Aprovecha la búsqueda de la mejor agrupación del Chinchón y su mesa de mazo y descarte.

## What Changes

- Nuevo juego **Gin Rummy**, jugable contra la IA y en red, para 2 jugadores con la baraja francesa de 52 cartas:
  - **Reparto:** 10 cartas a cada jugador; la siguiente se pone boca arriba como primera carta del descarte y el resto es el mazo. El reparto se alterna entre los dos jugadores; tras una mano nula reparte el mismo.
  - **Primera carta:** el que no reparte puede quedarse la carta descubierta o pasar; si pasa, puede hacerlo el que reparte; si los dos pasan, el que no reparte roba del mazo y sigue el juego normal.
  - **Turno:** robar una carta (del mazo o la de arriba del descarte) y descartar una. No se puede descartar en el mismo turno la carta que se acaba de coger del descarte.
  - **Combinaciones:** grupos de 3 o 4 cartas del mismo número y escaleras de 3 o más cartas seguidas del mismo palo, con el As siempre bajo (A-2-3 sí, Q-K-A no). Cada carta va en una sola combinación.
  - **Puntos sueltos:** el As vale 1, del 2 al 10 su número, la J, la Q y la K 10.
  - **Cerrar:** en lugar de descartar normalmente, un jugador puede cerrar descartando una carta si las 10 que le quedan dejan **10 puntos sueltos o menos**. Con 0 es **Gin**.
  - **Colocar:** si el cierre no es Gin, el rival puede colocar sus cartas sueltas en las combinaciones de quien cierra. Lo hace el motor solo, de la forma que deja menos puntos al rival.
  - **Puntuación:**
    - quien cierra con menos puntos sueltos que el rival gana la diferencia;
    - si el rival tiene los mismos o menos, es un **undercut**: el rival gana la diferencia más 25;
    - con Gin, quien cierra gana los puntos sueltos del rival más 25.
  - **Mano nula:** si quedan solo 2 cartas en el mazo y el jugador que acaba de robar descarta sin cerrar, la mano termina sin puntos.
  - **Partida a 100:** gana quien llega a 100 puntos al acabar una mano. El marcador final suma 100 por ganar la partida y 25 por cada mano ganada; si el perdedor no ganó ninguna mano, el total del ganador se dobla.
- **IA del Gin Rummy en los tres niveles:**
  - la básica coge el descarte si le forma o le acerca a una combinación y si no roba del mazo, suelta la carta suelta de más puntos que menos le sirve y cierra en cuanto puede;
  - la fácil se equivoca a veces;
  - la difícil simula qué carta robar y cuál descartar, repartiendo al azar las cartas que no ve.
- El servidor de salas admite el Gin Rummy como un juego más en red, de 2 asientos.
- **Cliente:**
  - el Gin Rummy en el menú y sus opciones (nivel de la IA);
  - una mesa propia, con la mano propia ordenada en combinaciones, el mazo, el descarte y el botón «Cerrar» cuando se puede;
  - el resumen de cada mano con las dos manos destapadas, lo colocado y los puntos, el fin de partida con el marcador de bonos y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el Big Gin (cerrar con las 11 cartas ligadas sin descartar);
  - la variante Oklahoma (límite para cerrar según la carta descubierta);
  - más de 2 jugadores;
  - que el jugador elija a mano qué colocar.

## Capabilities

### New Capabilities
- `juego-gin-rummy`: reglas del Gin Rummy:
  - reparto y primera carta;
  - turno, combinaciones y puntos sueltos;
  - cerrar, Gin y colocar;
  - puntuación, undercut y mano nula;
  - partida a 100 con bonos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Gin Rummy.
- `niveles-ia`: el Gin Rummy entra en la lista de juegos con tres niveles; su difícil simula solo el robo y el descarte, y su reconstrucción mantiene en la mano del rival las cartas que cogió del descarte.
- `mesa-cliente`: el menú incluye el Gin Rummy con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/gin-rummy.ts`, `ia/gin-rummy-basica.ts` e `ia/reconstruir/gin-rummy.ts`, con sus tests y la suite genérica del contrato;
  - la búsqueda de la mejor agrupación se generaliza para la baraja francesa sin comodines;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaGinRummy.svelte` y `ResumenGinRummy.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - cerrar con 10 puntos sueltos o menos;
  - Gin y undercut de 25 y colocar en las combinaciones de quien cierra;
  - partida a 100 con bonos de partida, de mano y doble si el rival no gana ninguna.
