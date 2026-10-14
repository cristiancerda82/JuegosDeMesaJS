## Why

Los Corazones son el juego de bazas con baraja francesa más conocido: venían con Windows durante años. Dan la vuelta a lo que ya hay en la suite, porque aquí se intenta **no** ganar bazas con puntos. Además añaden el pase de cartas antes de cada mano y la jugada arriesgada de «tirar la luna». Aprovechan la mesa de bazas compartida y suman un juego de baraja francesa que no es un solitario.

## What Changes

- Nuevo juego **Corazones** con baraja francesa de 52 cartas, jugable de principio a fin contra la IA, 4 jugadores cada uno por su cuenta, 13 cartas cada uno:
  - **Pase:** antes de jugar, cada jugador pasa 3 cartas, por turno de manos: al siguiente en el orden de juego, al anterior, al de enfrente y una mano sin pase. Se puede desactivar.
  - **Salida:** sale quien tiene el 2 de tréboles, y lo juega.
  - **Bazas:**
    - Hay que seguir el palo de salida si se tiene. Gana la carta más alta del palo de salida, del As al 2, y no hay triunfo.
    - En la primera baza no se pueden echar puntos (corazones ni la Q de picas), salvo que no quede otra.
    - No se puede salir con corazones hasta que se hayan «roto» (alguien echó uno) o si solo quedan corazones.
  - **Puntos:** cada corazón vale 1 y la Q de picas 13.
  - **Tirar la luna:** quien se lleva los 26 puntos de una mano no suma nada y los demás suman 26.
  - **Partida:** termina al acabar la mano en la que alguien llega a 100 puntos (opción: 50). Gana quien tiene menos.
- IA básica de los Corazones:
  - pasa sus cartas más peligrosas;
  - juega para no llevarse puntos;
  - se deshace de la Q de picas y de los corazones altos en cuanto le falta un palo.
- El cliente suma los Corazones al menú, con sus opciones (pase y puntos de la partida), y su mesa sobre la mesa de bazas compartida:
  - elección de las 3 cartas a pasar;
  - puntos de cada jugador a la vista;
  - aviso de los corazones rotos;
  - resumen de cada mano con la luna, si la hubo;
  - su guía «¿Cómo se juega?».
- Fuera de alcance:
  - las variantes con la J de diamantes (−10);
  - restar 26 al que tira la luna;
  - 3 o 5 jugadores;
  - el modo en red.

## Capabilities

### New Capabilities
- `juego-corazones`: reglas de los Corazones:
  - el pase de 3 cartas por turno de manos;
  - la salida con el 2 de tréboles;
  - las bazas con sus restricciones (primera baza, corazones rotos);
  - la puntuación con la luna;
  - el fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de los Corazones, para pasar y para jugar.
- `mesa-cliente`: el menú incluye los Corazones, con su mesa, el pase de cartas, el resumen de cada mano y su guía.

## Impact

- **`packages/engine`:** nuevos `juegos/corazones.ts` e `ia/corazones-basica.ts`, con sus tests y la suite genérica del contrato. No usan `motor/bazas.ts`, porque es para la baraja española con triunfo; la baza sin triunfo de la baraja francesa es sencilla y va en el propio juego.
- **`packages/client`:**
  - Nueva `MesaCorazones.svelte` sobre `MesaBazas`, con las props `nombre` y `detalle` de la Pocha.
  - Un panel para elegir las cartas del pase.
  - Cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas son las de los Corazones clásicos (como los de Windows) y las valida el usuario, en particular:
  - los 100 puntos;
  - que tirar la luna sume 26 a los demás;
  - que no se puedan echar puntos en la primera baza.
