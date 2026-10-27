## Why

El Cribbage es el clásico inglés para dos jugadores, y su mecánica no se parece a nada de la suite. No hay bazas: se suman puntos al jugar las cartas (quinces, parejas, escaleras y llegar a 31) y al contar la mano y el *crib*, y se avanza en un tablero de clavijas hasta 121. Reutiliza la baraja francesa y la selección de cartas del Culo y el Big Two.

## What Changes

- Nuevo juego **Cribbage** clásico para 2 jugadores, jugable contra la IA y en red:
  - **Reparto:** 6 cartas a cada uno; el repartidor se alterna cada mano.
  - **Crib:** cada jugador echa 2 cartas al *crib*, una mano extra que cuenta para el repartidor.
  - **Corte:** se descubre la carta de arriba del mazo (*starter*), que cuenta para todas las manos. Si es una J, el repartidor suma 2.
  - **Juego de las cartas (*pegging*):** empieza el que no reparte. Se juegan cartas por turnos sumando su valor (el As 1, las figuras 10) sin pasar de 31.
    - Puntúa quien lleva la cuenta a 15 (2) o a 31 (2), quien forma pareja (2), trío (6) o póker (12) con las últimas cartas, y quien forma una escalera de 3 o más con las últimas cartas (1 por carta).
    - Quien no puede jugar dice «go»; el otro sigue mientras pueda, y el último en jugar suma 1 (si no llegó a 31).
    - La cuenta vuelve a 0, y la última carta de la mano también suma 1.
  - **Recuento:** el que no reparte cuenta su mano con el *starter*, después el repartidor la suya y después su *crib*. Suman:
    - cada combinación que da 15: 2;
    - cada pareja: 2;
    - cada escalera: 1 por carta;
    - el color: 4 si son las 4 de la mano (5 con el *starter*); en el *crib*, solo 5;
    - la J del palo del *starter* (*nobs*): 1.
  - **Fin:** la partida termina en cuanto alguien llega a 121, aunque sea a mitad de mano.
- **Recuento automático:** el juego cuenta los puntos y los muestra desglosados.
- **IA del Cribbage en los tres niveles:**
  - la normal echa al *crib* las 2 cartas que dejan la mano con más puntos esperados, teniendo en cuenta de quién es el *crib*; al jugar, busca puntos inmediatos y evita dejar la cuenta en 5 o 21;
  - la fácil se equivoca a veces;
  - la difícil simula las cartas que juega hasta el final de la mano, y echa al *crib* como la normal.
- El servidor de salas admite el Cribbage como un juego más en red.
- **Cliente:**
  - el Cribbage en el menú;
  - una mesa con un tablero de puntos hasta 121, el *starter*, el *crib*, la cuenta y las cartas jugadas, y la mano propia;
  - elegir las 2 cartas del *crib*, jugar cartas y decir «Go»;
  - el recuento de cada mano desglosado, la pantalla de fin y la guía «¿Cómo se juega?».
- **Fuera de alcance:** 3 jugadores, *muggins* (reclamar los puntos olvidados del rival), partida a 61 y la penalización de *skunk*.

## Capabilities

### New Capabilities
- `juego-cribbage`: reglas del Cribbage:
  - reparto, *crib* y corte;
  - juego de las cartas con sus puntos y el «go»;
  - recuento de las manos y del *crib*;
  - partida a 121;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Cribbage.
- `niveles-ia`: el Cribbage entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Cribbage con su mesa, el recuento de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/cribbage.ts`, `ia/cribbage-basica.ts` y `ia/reconstruir/cribbage.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaCribbage.svelte` y `ResumenCribbage.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - solo 2 jugadores;
  - recuento automático;
  - partida a 121.
