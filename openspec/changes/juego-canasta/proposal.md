## Why

La Canasta es el gran clásico de los juegos de combinaciones por parejas y el que más se echa en falta en la suite junto al Pinacle y el Rummy 500. Su gracia está en el pozo: llevarse el montón de descartes da muchas cartas de golpe, y congelarlo con un comodín o taparlo con un 3 negro es la defensa. Reutiliza las 108 cartas del Pinacle (dos barajas francesas y cuatro comodines), las combinaciones compartidas por la pareja y su mesa de juego.

## What Changes

- Nuevo juego **Canasta**, jugable contra la IA y en red, de 4 jugadores en dos parejas (0 y 2 contra 1 y 3), con dos barajas francesas y 4 comodines (108 cartas):
  - **Reparto:** 11 cartas a cada uno. Se descubre una carta para empezar el pozo; si es un comodín, un 2 o un 3 rojo, se tapa con otra y el pozo queda congelado.
  - **Comodines:** los jokers y los doses. **Treses rojos:** se bajan solos en cuanto se tienen y se roba otra; valen 100 cada uno (800 los cuatro), a favor si la pareja ha bajado algo y en contra si no. **Treses negros:** al descartarlos tapan el pozo para el siguiente, y solo se bajan al cerrar.
  - **Turno:** robar una carta del mazo o llevarse el pozo entero; bajar o añadir combinaciones; y descartar una carta.
  - **Combinaciones:** 3 o más cartas del mismo valor, con al menos dos naturales y como mucho tres comodines. Cada pareja tiene como mucho una combinación de cada valor. Con 7 cartas es una **canasta**: limpia (sin comodines) 500 y sucia 300.
  - **Primera bajada:** la de cada pareja en cada mano tiene que sumar un mínimo según su marcador: 15 si va en negativo, 50 hasta 1.495, 90 hasta 2.995 y 120 desde 3.000.
  - **El pozo:** no se puede coger si arriba hay un 3 negro o un comodín. Está congelado para una pareja que aún no ha bajado, y para todos si contiene un comodín. Congelado, solo se coge con dos naturales de la mano del valor de la carta de arriba. Si no, también con un natural y un comodín, o si la carta de arriba va en una combinación de la pareja. La carta de arriba se baja en el momento; el resto del pozo pasa a la mano.
  - **Cerrar:** quien se queda sin cartas cierra la mano (con descarte o sin él) si su pareja tiene al menos una canasta; cerrar vale 100. Si se acaba el mazo, la mano termina cuando el que tiene que robar no puede o no quiere llevarse el pozo.
  - **Puntos:** el valor de las cartas bajadas (joker 50, 2 y As 20, del 8 al rey 10, del 4 al 7 y el 3 negro 5) más las canastas, los treses rojos y el cierre, menos el valor de las cartas que se quedan en la mano de los dos. La partida acaba cuando una pareja llega a 5.000 y gana la que más tiene.
- **IA de la Canasta en los tres niveles:**
  - la normal se lleva el pozo siempre que puede, baja en cuanto llega al mínimo, completa canastas con los comodines, cierra en cuanto puede y descarta lo que menos sirve a los rivales, con los treses negros primero;
  - la fácil se equivoca a veces;
  - la difícil simula, como en el Pinacle, si roba o se lleva el pozo y qué descarta.
- El servidor de salas admite la Canasta como un juego más en red, de 4 asientos.
- **Cliente:**
  - la Canasta en el menú y sus opciones (nivel de la IA);
  - una mesa propia:
    - las combinaciones de cada pareja, con las canastas marcadas;
    - el pozo, con su carta de arriba, cuántas cartas tiene y si está congelado;
    - los treses rojos, y el mínimo de la primera bajada;
    - la mano para elegir cartas, y los botones de robar, coger el pozo, bajar, añadir, deshacer y descartar;
  - el resumen de cada mano con el desglose de puntos; el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - pedir permiso al compañero para cerrar;
  - el cierre «a la mano» (escondido) con premio doble;
  - la Canasta de 2, 3 o 6 jugadores;
  - la obligación de llevarse el pozo al acabarse el mazo.

## Capabilities

### New Capabilities
- `juego-canasta`: reglas de la Canasta:
  - reparto y pozo inicial;
  - comodines y treses;
  - turno y combinaciones;
  - primera bajada;
  - el pozo y su congelación;
  - cierre y fin de la mano;
  - puntuación y fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Canasta.
- `niveles-ia`: la Canasta entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye la Canasta con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/canasta.ts` (y `juegos/canasta-combinaciones.ts` si hace falta separar), `ia/canasta-basica.ts` y `ia/reconstruir/canasta.ts`, con sus tests y la suite genérica del contrato;
  - reutiliza las cartas del Pinacle;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaCanasta.svelte` y `ResumenCanasta.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 4 jugadores en parejas;
  - el pozo clásico;
  - partida a 5.000 puntos.
