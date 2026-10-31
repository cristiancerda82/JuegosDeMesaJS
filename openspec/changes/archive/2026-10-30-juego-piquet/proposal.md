## Why

El Piquet es el gran clásico francés para dos: cada mano tiene un cambio de cartas con el montón, una ronda de declaraciones (el punto, las secuencias y los conjuntos) y doce bazas sin triunfo. Es un juego de cálculo, muy distinto de los juegos para dos de la suite (Brisca, Schnapsen, Bezique), y completa la serie de clásicos europeos.

## What Changes

- Nuevo juego **Piquet** para 2, jugable contra la IA y en red.
  - **Baraja:** 32 cartas francesas, del 7 al As. Orden de mayor a menor: A, K, Q, J, 10, 9, 8 y 7.
  - **Reparto:** 12 cartas a cada uno y 8 al montón (el *talon*). Uno es el mayor (el que no reparte) y el otro el menor; se alternan en cada mano.
  - **Cambio:**
    - el mayor descarta de 1 a 5 cartas y roba otras tantas del montón;
    - después, el menor descarta como mucho las que quedan en el montón y roba otras tantas.
  - **Declaraciones**, comparadas solas, y anota cada una solo quien gana:
    - **el punto:** el palo más largo; con empate, el de más valor de cartas. Vale tantos puntos como cartas;
    - **la secuencia:** la escalera más larga del mismo palo, de 3 o más; con empate, la más alta. Vale 3 o 4 con 3 o 4 cartas, y 10 más que su largo con 5 o más. Quien gana anota todas sus secuencias;
    - **el conjunto:** tres o cuatro cartas iguales del 10 al As; gana el de cuatro, y si no, el más alto. Vale 14 con cuatro y 3 con tres. Quien gana anota todos sus conjuntos.
  - **Bazas:** sale el mayor. Hay que seguir el palo; no hay triunfo. Se anota 1 por cada baza en que se sale y 1 por ganar una baza en que salió el otro; la última baza vale 1 más. Quien gana más bazas anota 10 (*las cartas*); quien las gana todas, 40 (*capote*).
  - **Primas:**
    - **repique:** 60 a quien llega a 30 con las declaraciones sin que el otro haya anotado nada;
    - **pique:** 30 al mayor si llega a 30 con las declaraciones y las bazas antes de que el menor anote nada.
  - **Partida:** un *rubber* de 6 manos, en el que cada uno es mayor tres veces. Gana quien más suma. La partida vale 100 más la diferencia, o 100 más la suma de los dos si el que pierde no llega a 100.
- **IA del Piquet en los tres niveles:**
  - **Normal:** cambia las cartas que no le sirven para el punto, las secuencias ni los conjuntos; en las bazas sale de su palo más largo y gana con lo justo.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Piquet como un juego más en red.
- **Cliente:**
  - el Piquet en el menú;
  - una mesa de bazas para dos con el montón, el cambio de cartas y las declaraciones;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - la *carte blanche*;
  - callarse una combinación;
  - mirar las cartas del montón que no se roban.

## Capabilities

### New Capabilities
- `juego-piquet`: reglas del Piquet:
  - baraja y reparto;
  - cambio de cartas;
  - declaraciones;
  - bazas y sus puntos;
  - repique, pique y capote;
  - el *rubber* de 6 manos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Piquet.
- `niveles-ia`: el Piquet entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Piquet con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/piquet.ts`, `ia/piquet-basica.ts` e `ia/reconstruir/piquet.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaPiquet.svelte` y `ResumenPiquet.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - el *rubber* de 6 manos;
  - con repique, pique y capote;
  - las declaraciones se comparan solas.
