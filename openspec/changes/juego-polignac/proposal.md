## Why

El Polignac es el clásico francés de bazas para evitar: con 32 cartas y sin triunfo, cada sota que te llevas resta, y la de picas, el «Polignac», resta el doble. Es más corto y sencillo que el Barbu y el Rentz, y admite de 3 a 6 jugadores, así que llena un hueco: «Bazas para evitar» es la familia con menos juegos (solo 3) y ninguno de ellos se juega con 5 o 6.

La suite ya tiene casi todo lo que necesita, en el Rentz:
- la baraja de 32;
- las bazas sin triunfo con fin anticipado;
- la IA de evitar bazas;
- la mesa de bazas para 3 a 6 jugadores.

## What Changes

- Nuevo juego **Polignac** para 3 a 6 jugadores, jugable contra la IA y en red.
  - **Baraja:** 32 cartas francesas, con el orden As, K, Q, J, 10, 9, 8, 7. Con 3, 5 o 6 jugadores se quitan el 7 de picas y el de tréboles, y quedan 30.
  - **Reparto:** todas las cartas: 10 a cada uno con 3, 8 con 4, 6 con 5 y 5 con 6. El que reparte pasa al siguiente en cada mano.
  - **Bazas:** sale el que está a la izquierda del que reparte; hay que seguir el palo y, si no se tiene, se puede echar cualquier carta. No hay triunfo.
  - **Puntos:** cada J ganada resta 1, y la J de picas resta 2. La mano se acaba en cuanto se han ganado las cuatro J.
  - **General (opcional):** antes de la primera baza, cada jugador, empezando por el que sale, puede anunciar que se llevará todas las bazas. El primero que lo anuncia sale él. Si se las lleva todas, cada uno de los demás resta 5; en cuanto pierde una, la mano se acaba y resta 5 él. En la mano del general, las J no cuentan.
  - **Partida:** termina al acabar la mano en la que alguien llega al límite (−10, −20 o −30; −10 por defecto). Gana quien tiene más puntos; puede haber varios ganadores empatados.
- **IA del Polignac en los tres niveles:**
  - **Normal:** anuncia el general solo si sus cartas son, en cada palo, las más altas seguidas desde el As; en las bazas, se escapa y se descarta primero de la J de picas.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** anuncia como la normal y simula cada carta hasta el final de la mano.
- El servidor de salas admite el Polignac como un juego más en red.
- **Cliente:**
  - el Polignac en el menú (familia «Bazas para evitar»), con sus opciones: jugadores, límite y general;
  - una mesa de bazas para 3 a 6 con:
    - el anuncio del general;
    - los puntos de la mano y el marcador;
  - el resumen de cada mano, el fin de partida, la guía «¿Cómo se juega?» con sus ejemplos y el consejo del modo asistido.
- **Fuera de alcance:**
  - 2 o 7 jugadores;
  - variantes con otras penalizaciones (la Q de picas, las bazas).

## Capabilities

### New Capabilities
- `juego-polignac`: reglas del Polignac:
  - baraja, orden y reparto según los jugadores;
  - bazas;
  - puntos de las J y fin anticipado;
  - general;
  - fin por límite;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Polignac.
- `niveles-ia`: el Polignac entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Polignac con su mesa y su fin de partida.
- `menu-juegos`: el Polignac entra en la familia «Bazas para evitar».

## Impact

- `packages/engine`:
  - nuevos `juegos/polignac.ts`, `ia/polignac-basica.ts` e `ia/reconstruir/polignac.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaPolignac.svelte` y `ResumenPolignac.svelte`;
  - cambian:
    - el registro de juegos y las opciones;
    - el catálogo del menú y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - de 3 a 6 jugadores;
  - el general opcional;
  - el fin al llegar a −10.
