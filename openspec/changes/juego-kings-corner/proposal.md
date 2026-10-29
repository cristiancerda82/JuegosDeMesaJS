## Why

Kings in the Corner es un juego familiar de 2 a 4 jugadores, a medio camino entre un solitario y un juego de descarte. Se van formando escaleras descendentes de colores alternos sobre una cruz de cartas, con los reyes en las esquinas. Gana quien se queda antes sin cartas. Es rápido, fácil de aprender y aporta otro tipo de partida a la suite.

## What Changes

- Nuevo juego **Kings in the Corner** para 2 a 4 jugadores, cada uno por su cuenta, jugable contra la IA y en red.
  - **Reparto:**
    - baraja francesa de 52; 7 cartas a cada uno;
    - con el resto se forma el *mazo* en el centro y se ponen 4 cartas boca arriba en cruz (arriba, derecha, abajo e izquierda);
    - las 4 esquinas quedan vacías.
  - **Pilas:**
    - sobre una pila se pone una carta un punto más baja y del color contrario (un 7 rojo sobre un 8 negro);
    - las esquinas solo se empiezan con un K;
    - un hueco de la cruz admite cualquier carta.
  - **El turno:**
    - el jugador roba una carta del mazo, si quedan;
    - después juega las cartas que quiera de su mano;
    - puede mover una pila entera de la cruz sobre otra pila si su primera carta encaja en ella, y el hueco que deja se puede rellenar con cualquier carta;
    - termina cuando pasa.
  - **Fin:** gana quien se queda antes sin cartas. Si el mazo se acaba y todos pasan seguidos sin jugar, gana quien tenga menos cartas, y si empatan varios, es empate.
  - Se juega una sola mano.
- **IA de Kings in the Corner en los tres niveles:**
  - **Normal:** sigue este orden:
    1. mueve pilas para abrir huecos;
    2. pone los K en las esquinas;
    3. juega sus cartas empezando por las más altas;
    4. llena los huecos con la carta que le deje encadenar más jugadas.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada jugada unos turnos por delante, con las cartas ocultas repartidas al azar.
- El servidor de salas admite Kings in the Corner como un juego más en red.
- **Cliente:**
  - el juego en el menú, con la opción de jugadores (2 a 4);
  - una mesa propia con la cruz, las esquinas y el mazo en el centro, los rivales con sus cartas y la mano;
  - se juega tocando una carta de la mano (o una pila de la cruz) y después la pila de destino;
  - un botón para pasar, los avisos de las jugadas, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:** la puntuación por varias manos con penalización y las variantes sin robo.

## Capabilities

### New Capabilities
- `juego-kings-corner`: reglas de Kings in the Corner:
  - reparto y cruz;
  - pilas descendentes de colores alternos, con los K en las esquinas;
  - el turno: robar, jugar, mover pilas y pasar;
  - fin, bloqueo y empate;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de Kings in the Corner.
- `niveles-ia`: Kings in the Corner entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye Kings in the Corner con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/kings-corner.ts`, `ia/kings-corner-basica.ts` y `ia/reconstruir/kings-corner.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nueva `MesaKingsCorner.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - una sola mano;
  - se pueden mover pilas enteras;
  - se roba una carta al empezar el turno.
