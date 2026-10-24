## Why

El Culo (también llamado Presidente) es uno de los juegos de cartas más jugados en España entre amigos, y la suite no tiene ningún juego de descartes por escalada: aquí no se ganan bazas ni se bajan combinaciones, sino que hay que deshacerse antes que nadie de las cartas jugando cada vez más alto. Además, cada mano deja una jerarquía (del presidente al culo) que cambia la siguiente con el intercambio de cartas, y eso da a la partida de 5 manos un hilo propio. Reutiliza la baraja española de 40 y el registro de juegos de varias manos.

## What Changes

- Nuevo juego **Culo**, jugable contra la IA y en red, de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta, con la baraja española de 40 cartas:
  - **Orden de las cartas**, de menor a mayor: 3, 4, 5, 6, 7, sota, caballo, rey, As y 2. Los palos no cuentan.
  - **Reparto:** se reparten todas las cartas una a una, así que algunos jugadores pueden tener una más.
  - **Rondas:** quien abre juega de 1 a 4 cartas del mismo valor. Los siguientes, por turno, MUST jugar el mismo número de cartas de un valor más alto, o pasar. Pasar no te saca de la ronda: si vuelve a tocarte, puedes jugar. Cuando todos los demás pasan seguidos, la ronda se limpia y abre de nuevo quien jugó el último.
  - **Cortar:** jugar doses (la carta más alta) limpia la ronda al instante y vuelve a abrir quien los jugó.
  - **Salir:** quien se queda sin cartas sale de la mano con el siguiente puesto. Si quien jugó el último ya ha salido, abre el siguiente que sigue en la mano. Cuando solo queda uno, la mano termina.
  - **Puestos:** el primero es el presidente y el último el culo. Con 4 jugadores o más, el segundo es el vicepresidente y el penúltimo el viceculo; con 5 o 6, los del medio son neutrales. Cada puesto da puntos: el último 0, el penúltimo 1, y así hasta el primero, que gana N − 1.
  - **Intercambio:** desde la segunda mano, al repartir, el culo da sus 2 mejores cartas al presidente y este le devuelve 2 a su elección. Con 4 jugadores o más, el viceculo da su mejor carta al vicepresidente y este le devuelve 1. Las mejores cartas se dan solas; las que se devuelven las elige quien las da.
  - **Salida:** en la primera mano abre quien tiene el 3 de oros; en las siguientes, el culo de la mano anterior.
  - **Final:** la partida dura 5 manos y gana quien más puntos suma. Los empates se deshacen por el mejor puesto en la última mano.
- **IA del Culo en los tres niveles:**
  - la normal abre con su valor más bajo jugando todas las cartas de ese valor, responde con el valor más bajo que supera sin romper grupos si puede, guarda los doses para el final y devuelve en el intercambio sus cartas más bajas;
  - la fácil se equivoca a veces;
  - la difícil simula el resto de la mano con las cartas ocultas repartidas al azar, como en el resto de juegos de cartas ocultas.
- El servidor de salas admite el Culo como un juego más en red, de 3 a 6 asientos.
- **Cliente:**
  - el Culo en el menú y sus opciones (jugadores y nivel de la IA);
  - una mesa propia:
    - los rivales con sus cartas y su cargo de la mano anterior;
    - en el centro, la jugada que hay que superar y quién la hizo, y quién ha pasado;
    - abajo, la mano ordenada para elegir las cartas, y los botones «Jugar» y «Pasar»;
    - en el intercambio, elegir las cartas que se devuelven;
  - el resumen de cada mano con el orden de salida, los cargos, los puntos y el marcador;
  - el fin de partida con la clasificación y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - saltar al siguiente jugador al repetir valor;
  - revolución con cuatro iguales;
  - comodines;
  - la baraja francesa;
  - número de manos configurable.

## Capabilities

### New Capabilities
- `juego-culo`: reglas del Culo:
  - reparto y orden de las cartas;
  - rondas, pasar y cortar con doses;
  - salida y puestos;
  - intercambio de cartas;
  - puntos y fin de partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Culo.
- `niveles-ia`: el Culo entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Culo con su mesa, el intercambio, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/culo.ts`, `ia/culo-basica.ts` y `ia/reconstruir/culo.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaCulo.svelte` y `ResumenCulo.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - baraja española de 40, de 3 a 6;
  - las reglas básicas con cortar con los doses;
  - intercambio y partida de 5 manos.
