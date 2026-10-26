## Why

El Casino es el gran juego de recoger cartas de la baraja francesa, primo de la Escoba: se recogen cartas de la mesa por igualdad o por suma, pero además se pueden **construir** jugadas para recogerlas más tarde, y eso lo hace más táctico. Reutiliza la idea de la Escoba (mesa abierta, recoger por suma, barridas) y su mesa en el cliente.

## What Changes

- Nuevo juego **Casino**, jugable contra la IA y en red, de 2 a 4 jugadores con la baraja francesa de 52 cartas:
  - **Jugadores:** 2 (por defecto), 3 o 4, cada uno por su cuenta; con 4, también en parejas (0 y 2 contra 1 y 3).
  - **Reparto:** 4 cartas a cada jugador y, al empezar la mano, 4 boca arriba en la mesa. Cuando todos se quedan sin cartas, se reparten otras 4 a cada uno (sin más cartas a la mesa) hasta acabar el mazo.
  - **Valores:** el As vale 1 y del 2 al 10 su número. Las figuras (J, Q y K) solo se recogen por pareja y no entran en construcciones.
  - **Turno:** se juega una carta de la mano para:
    - **recoger** de la mesa las cartas de su mismo número, las combinaciones de cartas que suman su valor y las construcciones de ese valor;
    - **construir**: juntarla con cartas de la mesa para formar una suma que el jugador tenga en la mano (por ejemplo, un 3 sobre un 5 si tiene un 8), o subir una construcción que no sea múltiple, o hacerla múltiple añadiendo otra combinación del mismo valor;
    - **dejarla** en la mesa, salvo que tenga una construcción suya en la mesa.
  - **Barrida:** recoger todas las cartas de la mesa vale 1 punto, salvo en la última jugada de la mano.
  - **Fin de la mano:** las cartas que quedan en la mesa se las lleva el último que recogió.
  - **Puntos de la mano:** más cartas 3, más picas 1, el 10 de diamantes (Big Casino) 2, el 2 de picas (Little Casino) 1, cada As 1 y cada barrida 1. Con empate en cartas o en picas, nadie se lleva esos puntos.
  - **Partida:** a 21 puntos; al terminar una mano en que alguien llega, gana quien más tiene (con empate se juega otra mano).
- **IA del Casino en los tres niveles:**
  - la normal recoge siempre que puede (lo que más vale), construye cuando tiene la carta para recoger después y deja la carta que menos sirve;
  - la fácil se equivoca a veces;
  - la difícil simula, como en la Escoba, la jugada con las manos ocultas y el mazo repartidos al azar.
- El servidor de salas admite el Casino como un juego más en red.
- **Cliente:**
  - el Casino en el menú y sus opciones (jugadores, parejas y nivel de la IA);
  - una mesa propia con la mesa abierta (cartas sueltas y construcciones con su valor y su dueño), los rivales y sus recogidas, y la mano propia;
  - elegir carta y después, si hay varias jugadas, la jugada (recoger, construir o dejar);
  - el resumen de cada mano con los puntos, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - las variantes en que las figuras forman construcciones (Royal Casino) o los Ases valen 14;
  - el Draw Casino (robar tras cada jugada);
  - elegir qué combinaciones recoger: al recoger se lleva todo lo que puede con esa carta.

## Capabilities

### New Capabilities
- `juego-casino`: reglas del Casino:
  - jugadores y reparto;
  - valores;
  - recoger, construir y dejar;
  - barridas;
  - fin de la mano y puntos;
  - partida a 21;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Casino.
- `niveles-ia`: el Casino entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Casino con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/casino.ts`, `ia/casino-basica.ts` y `ia/reconstruir/casino.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaCasino.svelte` y `ResumenCasino.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - de 2 a 4 jugadores, con parejas a 4;
  - construcciones clásicas;
  - partida a 21 puntos.
