## Why

El Hand and Foot es la canasta por parejas que más se juega en Estados Unidos:
- cada jugador recibe dos montones de 11 cartas: la mano, que juega primero, y el pie, que coge cuando se queda sin mano;
- se roban dos cartas por turno y se forman libros de 7 cartas;
- la partida tiene cuatro rondas, con un mínimo para la primera bajada que sube en cada una.

Da a la familia de combinaciones una canasta más larga y con un objetivo claro para cerrar (dos libros limpios y dos sucios). Se reaprovechan:
- las cartas, los puntos y las combinaciones de la Canasta (y sus cartas con copia del Pinacle);
- la primera bajada con mínimo y «deshacer» de la Canasta;
- la mesa de la Canasta en el cliente;
- la reconstrucción y el difícil de la Canasta, que simula solo unas decisiones y deja el resto a la normal.

## What Changes

- Nuevo juego **Hand and Foot** para 4 jugadores en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** 5 barajas francesas con sus comodines (270 cartas).
  - **Valor de las cartas:** el comodín 50; el 2 y el As 20; del 8 al K 10; del 4 al 7 y el 3 negro 5. Los doses y los comodines son comodines.
  - **Reparto:** 11 cartas de mano y 11 de pie a cada uno; una carta boca arriba empieza el descarte.
  - **Treses rojos:** se ponen en la mesa en cuanto se tienen (también los del pie) y se roba otra carta por cada uno. Valen 100 puntos.
  - **Turno:** se roban 2 cartas del mazo, o se coge el descarte; después se baja lo que se quiera y se descarta una carta.
  - **Coger el descarte:** solo una pareja que ya ha bajado, con dos naturales del valor de la carta de arriba. Esa carta y las dos forman una combinación nueva, y las 6 cartas siguientes del descarte van a la mano. No se puede si arriba hay un comodín o un 3 negro.
  - **Combinaciones:** de 3 a 7 cartas del mismo valor (del 4 al As), con al menos 2 naturales y como mucho 3 comodines; o de 3 a 7 comodines solos. Con 7 cartas son un libro y ya no admiten más. Una pareja no puede tener dos combinaciones sin terminar del mismo valor.
  - **Libros:** limpio (sin comodines) 500 puntos, sucio 300 y de comodines 1500.
  - **Primera bajada:** en cada ronda, la primera bajada de la pareja tiene que sumar, con los puntos de sus cartas, al menos 50, 90, 120 o 150 (rondas 1 a 4).
  - **El pie:** quien se queda sin cartas en la mano coge su pie. Si se quedó sin cartas bajando, sigue jugando con el pie; si fue al descartar, lo juega en su turno siguiente.
  - **Cerrar:** quien juega su pie puede quedarse sin cartas (bajándolas todas o descartando la última) solo si su pareja tiene al menos 2 libros limpios y 2 sucios (uno de comodines cuenta como limpio). Si no, tiene que quedarse con al menos 2 cartas antes de descartar.
  - **Fin de la ronda:** cuando alguien cierra (100 puntos para su pareja) o cuando hay que robar y el mazo no tiene dos cartas.
  - **Puntuación de la ronda:** los puntos de las cartas bajadas, los libros, los treses rojos y el cierre, menos los puntos de las cartas que quedan en las manos y en los pies sin coger.
  - **Partida:** 4 rondas; gana la pareja con más puntos, o empatan.
- **IA del Hand and Foot en los tres niveles:**
  - **Normal:**
    - coge el descarte cuando puede;
    - baja lo justo para la primera bajada, y después todos sus naturales;
    - usa los comodines para terminar libros, hacer el libro de comodines o cerrar;
    - descarta primero los treses negros y después la carta que menos le sirve.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula qué carta descarta, unas jugadas por delante; lo demás lo decide como la normal.
- El servidor de salas admite el Hand and Foot como un juego más en red.
- **Cliente:**
  - el Hand and Foot en el menú, en la familia «Combinaciones», y su consejo en el modo asistido;
  - una mesa a partir de la de la Canasta con:
    - la mano o el pie que se está jugando y cuántas cartas tiene el pie de cada uno;
    - las combinaciones y los libros de cada pareja, con lo que falta para cerrar;
    - el mínimo de la primera bajada de la ronda;
  - el resumen de cada ronda, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - pedir permiso al compañero para cerrar;
  - las variantes para 2, 3 o 6 jugadores;
  - coger el descarte entero.

## Capabilities

### New Capabilities
- `juego-hand-and-foot`: reglas del Hand and Foot:
  - baraja, valores y reparto de mano y pie;
  - treses rojos;
  - turno, robo y coger el descarte;
  - combinaciones, libros y primera bajada;
  - el pie y cerrar;
  - puntuación, rondas y partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Hand and Foot.
- `niveles-ia`: el Hand and Foot entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Hand and Foot con su mesa y su fin de partida.
- `menu-juegos`: el Hand and Foot entra en la familia «Combinaciones».

## Impact

- `packages/engine`:
  - nuevos `juegos/hand-and-foot.ts`, `ia/hand-and-foot-basica.ts` e `ia/reconstruir/hand-and-foot.ts`, con sus tests y la suite genérica del contrato;
  - se exportan de la Canasta los ayudantes que hagan falta en lugar de copiarlos;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaHandAndFoot.svelte` y `ResumenHandAndFoot.svelte`;
  - cambian el registro de juegos, el catálogo del menú, el consejo del modo asistido (y su cuenta de juegos con IA), los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 4 jugadores en parejas;
  - 4 rondas con mínimos de 50, 90, 120 y 150;
  - para cerrar, 2 libros limpios y 2 sucios;
  - libro de comodines.
