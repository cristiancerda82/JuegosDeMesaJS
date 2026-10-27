## Why

El Skat es el gran juego de cartas alemán: tres jugadores, una subasta para decidir quién juega solo contra los otros dos, y tres clases de juego muy distintas (de palo, Grand y Nulo). Es el juego de bazas más profundo que aún falta en la suite. Reutiliza la mesa de bazas compartida y la subasta y el reconstruir de los juegos de bazas con solista.

## What Changes

- Nuevo juego **Skat** para 3, jugable contra la IA y en red.
  - **Baraja:** francesa de 32 cartas, del 7 al As. Las cartas valen As 11, 10 10, K 4, Q 3 y J 2 (120 en total).
  - **Reparto:** 10 cartas a cada uno y 2 boca abajo: el *Skat*. Habla primero *Vorhand* (a la izquierda del repartidor), después *Mittelhand* y por último *Hinterhand* (el repartidor).
  - **Subasta:**
    - Mittelhand puja a Vorhand con los valores del Skat (18, 20, 22, 23, 24, 27…), y Vorhand acepta o pasa.
    - El que queda se enfrenta a Hinterhand de la misma forma.
    - Quien gana es el *solista* y juega contra los otros dos.
    - Si nadie puja, Vorhand puede jugar con 18 o pasar. Si pasa, se reparte de nuevo con el siguiente repartidor.
  - **El Skat:** el solista puede cogerlo y descartarse de 2 cartas, o jugar *de mano* sin mirarlo. Los puntos del Skat son del solista.
  - **Juegos:**
    - **de palo:** triunfo ♣, ♠, ♥ o ♦; las cuatro J son los triunfos más altos (J♣, J♠, J♥, J♦) y después A, 10, K, Q, 9, 8 y 7 del palo;
    - **Grand:** solo las cuatro J son triunfo;
    - **Nulo:** sin triunfo, con el orden A, K, Q, J, 10, 9, 8 y 7, y el solista no tiene que hacer ninguna baza.
  - **Anuncios de mano:** jugando de mano, el solista puede anunciar *schneider*, *schwarz* u *ouvert*. Ouvert significa jugar con las cartas a la vista; en palo y Grand obliga a hacer todas las bazas. El Nulo puede ser ouvert aunque coja el Skat.
  - **Jugar:** sale Vorhand. Hay que seguir el palo de salida, y las J son del palo del triunfo. Gana el triunfo más alto o la más alta del palo de salida.
  - **Resultado:**
    - en palo y Grand, el solista gana con 61 puntos o más;
    - *schneider*: el perdedor hace 30 o menos;
    - *schwarz*: el perdedor no hace ninguna baza.
  - **Valor del juego:**
    - en palo y Grand, el valor base (♦ 9, ♥ 10, ♠ 11, ♣ 12, Grand 24) por un multiplicador: los *matadores* (con o sin J seguidas), 1 por el juego, y 1 más por cada mano, schneider, schneider anunciado, schwarz, schwarz anunciado y ouvert;
    - en Nulo, valores fijos: 23, 35 de mano, 46 ouvert y 59 ouvert de mano.
    - Si el valor no llega a lo pujado, el solista pierde, y el juego vale el menor múltiplo del valor base que llega a lo pujado.
  - **Puntuación:** el solista suma el valor si gana y resta el doble si pierde.
  - **Partida:** se juegan las rondas elegidas (1, 2 o 3, de 3 manos cada una, una por repartidor). Gana quien tenga más puntos.
- **IA del Skat en los tres niveles:**
  - la normal valora su mano para cada juego posible, puja hasta el valor de su mejor juego, coge el Skat, se descarta de lo que menos le sirve y juega las bazas con reglas sencillas (el solista arrastra triunfos y los defensores se cargan las bazas del compañero);
  - la fácil se equivoca a veces;
  - la difícil simula las bazas con las manos ocultas repartidas al azar, y decide la subasta, el Skat y el juego como la normal.
- El servidor de salas admite el Skat como un juego más en red.
- **Cliente:**
  - el Skat en el menú con la opción de rondas;
  - la mesa de bazas compartida con los botones de la subasta, coger el Skat o jugar de mano, el descarte, la elección del juego y los anuncios;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - saltar valores en la subasta: cada puja es el siguiente valor;
  - Kontra y Re, Ramsch y Bock;
  - los puntos extra de la lista Seeger-Fabian.

## Capabilities

### New Capabilities
- `juego-skat`: reglas del Skat:
  - baraja, reparto y posiciones;
  - subasta;
  - el Skat y jugar de mano;
  - juegos de palo, Grand y Nulo;
  - anuncios;
  - bazas;
  - resultado y valor del juego;
  - puntuación y partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Skat.
- `niveles-ia`: el Skat entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Skat con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/skat.ts`, `ia/skat-basica.ts` y `ia/reconstruir/skat.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaSkat.svelte` y `ResumenSkat.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - juegos de palo, Grand y Nulo, con mano, schneider, schwarz y ouvert;
  - varias manos a puntos;
  - si todos pasan, se reparte de nuevo.
