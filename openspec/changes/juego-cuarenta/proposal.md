## Why

El Cuarenta es el juego de cartas nacional de Ecuador, un juego de capturas con jugadas propias:
- la caída (llevarse la carta que acaba de echar el rival);
- la limpia (dejar la mesa vacía);
- la escalera (seguir llevándose las cartas siguientes);
- la ronda (tres cartas iguales en la mano).

Es pariente de la Escoba, la Scopa y el Casino que ya tiene la suite: con el motor de capturas y la mesa de la Scopa, se añade con poco código nuevo y trae un juego de habla hispana más.

## What Changes

- Nuevo juego **Cuarenta** para 2 jugadores o 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** la francesa sin los 8, 9 y 10 (40 cartas). El As vale 1 y del 2 al 7 su número; la J, la Q y la K no tienen valor para sumar. Para la escalera, el orden es As, 2… 7, J, Q, K.
  - **Reparto:** 5 cartas a cada uno, con la mesa vacía; cuando todos se quedan sin cartas, otras 5 hasta acabar el mazo (4 repartos con 2 jugadores y 2 con 4).
  - **Ronda:** quien recibe tres o cuatro cartas del mismo número en un reparto anota 4 puntos, y los demás ven de qué número es.
  - **Captura:** se juega una carta. Se puede llevar:
    - una carta de la mesa de su mismo número;
    - o, si es del As al 7, dos o más cartas del As al 7 que sumen su valor.

    Tras capturar, se lleva además, en escalera, la carta siguiente a la jugada si está en la mesa, y la siguiente, y así mientras haya. Capturar no es obligatorio: la carta se puede dejar en la mesa.
  - **Caída:** llevarse por número la carta que acaba de echar el jugador anterior vale 2 puntos.
  - **Limpia:** dejar la mesa vacía al capturar vale 2 puntos; con caída y limpia a la vez, 4.
  - **Fin de la mano:** las cartas que quedan en la mesa son para el último que capturó.
  - **Cartones:** el bando con 20 cartas recogidas anota 6 puntos, y 1 más por cada carta pasada de 20, redondeando el total al número par de arriba (21 o 22 cartas, 8; 23 o 24, 10). El bando que no llega a 20 no anota; con 20 y 20, ninguno.
  - **Partida:** a 40 puntos. Gana el primero que llega, en cuanto llega, aunque sea a mitad de la mano.
- **IA del Cuarenta en los tres niveles:**
  - **Normal:** elige la jugada que más vale (caída, limpia y cartas que se lleva) y, si no captura, suelta la carta con la que menos se arriesga a una caída o a dejar una limpia a tiro.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus jugadas hasta el final de la mano, con las cartas ocultas repartidas al azar.
- El servidor de salas admite el Cuarenta como un juego más en red.
- **Cliente:**
  - el Cuarenta en el menú, con la opción de 2 o 4 jugadores;
  - una mesa de capturas con:
    - la elección de lo que se lleva;
    - las caídas, limpias y rondas anunciadas;
    - las cartas recogidas de cada bando;
  - el resumen de cada mano con los cartones, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - «38 no juega»;
  - la doble ronda que gana la partida: cuatro iguales cuentan como una ronda;
  - el «dos por darlas»;
  - la mesa a dos chicas.

## Capabilities

### New Capabilities
- `juego-cuarenta`: reglas del Cuarenta:
  - baraja y repartos;
  - ronda;
  - capturas por número, por suma y en escalera;
  - caída y limpia;
  - fin de la mano y cartones;
  - partida a 40;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Cuarenta.
- `niveles-ia`: el Cuarenta entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Cuarenta con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/cuarenta.ts`, `ia/cuarenta-basica.ts` e `ia/reconstruir/cuarenta.ts`, con sus tests y la suite genérica del contrato;
  - se reaprovecha `combinaciones` de la Escoba;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaCuarenta.svelte` y `ResumenCuarenta.svelte`;
  - cambian:
    - el registro de juegos y las opciones;
    - los textos y la guía;
    - la pantalla de fin y la lista de parejas de la sala de espera;
    - los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 2 jugadores o 4 en parejas;
  - caída, limpia, escalera y ronda (4 puntos), sin «38 no juega»;
  - los cartones clásicos.

  Hay fuentes que dan 2 puntos a la ronda; se usan los 4 elegidos.
