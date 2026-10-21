## Why

La suite tiene juegos de bazas, de combinaciones, de apuestas y solitarios, pero ninguno en el que mentir sea la jugada. El Mentiroso (también llamado «Duda» o «Cheat») es el juego de faroles por excelencia: se bajan cartas boca abajo diciendo qué son, y los demás deciden si creerlo. Es corto, de 3 a 6 jugadores, y muy jugable en red. También añade algo que ninguna IA de la suite hace: farolear y detectar faroles llevando la cuenta de las cartas.

## What Changes

- Nuevo juego **Mentiroso**, jugable contra la IA y en red, de 3 a 6 jugadores (4 por defecto), cada uno por su cuenta:
  - **Reparto:** baraja francesa de 52 cartas, todas repartidas una a una. Unos jugadores pueden tener una carta más que otros.
  - **Turno:** el valor que se declara va en orden, del As a la K y vuelta a empezar, avanzando uno en cada turno. Empieza el asiento 0 con los Ases. En su turno, cada jugador baja boca abajo al montón de 1 a 4 cartas y dice «N de ese valor». Puede decir la verdad o mentir.
  - **¡Mentiroso!:** tras cada bajada, el siguiente jugador decide antes de jugar si la cree o dice «¡Mentiroso!». Al desconfiar, se descubren las cartas de esa bajada:
    - si alguna no es del valor declarado, el que mintió se lleva el montón entero a su mano;
    - si todas lo son, el montón se lo lleva quien desconfió.

    Después sigue el turno el que desconfió.
  - **Victoria:** gana el primero que se queda sin cartas, siempre que su última bajada no sea desmentida. Cuando un jugador baja sus últimas cartas, el siguiente solo puede creerle (y la partida acaba) o desconfiar.
  - **Lo que se ve:** las bajadas (quién, cuántas cartas y qué valor dijo), el tamaño del montón, las cartas de cada uno y las cartas descubiertas en cada «¡Mentiroso!».
- **IA del Mentiroso en los tres niveles:**
  - la básica baja las cartas del valor si las tiene, o una para mentir, y con el montón pequeño rellena con falsas hasta 3. Desconfía cuando es imposible que digan la verdad (las que declaran más las suyas de ese valor pasan de 4), cuando el que baja se queda sin cartas, o con una probabilidad que crece cuanto menos probable es la bajada;
  - la fácil se equivoca a veces;
  - la difícil lleva la cuenta de las cartas (las que bajó ella, las descubiertas y quién se las llevó) para saber mejor cuándo mienten, y baja con prudencia: la verdad, o una sola carta falsa. No simula partidas: contra quien rellena con falsas, ganan desconfiar bien y no arriesgar.
- El servidor de salas admite el Mentiroso como un juego más en red, de 3 a 6 asientos.
- **Cliente:**
  - el Mentiroso en el menú y sus opciones (jugadores y nivel de la IA);
  - una mesa propia: rivales con su número de cartas, el montón con el valor que toca, las bajadas recientes, la mano propia para elegir de 1 a 4 cartas, los botones «Bajar» y «¡Mentiroso!», y el descubrimiento de las cartas al desconfiar;
  - el fin de partida con el ganador y las cartas que le quedaron a cada uno, y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - declarar un valor libre o el anterior/siguiente;
  - que cualquiera pueda desconfiar;
  - descartar los cuatro iguales;
  - la puntuación a varias manos;
  - la baraja española.

## Capabilities

### New Capabilities
- `juego-mentiroso`: reglas del Mentiroso:
  - reparto;
  - turnos y valor declarado;
  - bajar;
  - desconfiar y quién se lleva el montón;
  - victoria;
  - vista con lo descubierto.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Mentiroso (bajar, farolear y desconfiar).
- `niveles-ia`: el Mentiroso entra en la lista de juegos con tres niveles. Su difícil es una IA con memoria de cartas, sin simulación ni reconstrucción, que tiene que ganar a la normal.
- `mesa-cliente`: el menú incluye el Mentiroso con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/mentiroso.ts` e `ia/mentiroso-basica.ts` (con la básica y la difícil con memoria), con sus tests y la suite genérica del contrato;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nueva `MesaMentiroso.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen del Mentiroso clásico y las valida el usuario:
  - la baraja francesa con valor en orden;
  - que solo desconfíe el siguiente;
  - que gane el primero sin cartas;
  - que tras desconfiar siga el que desconfió.
