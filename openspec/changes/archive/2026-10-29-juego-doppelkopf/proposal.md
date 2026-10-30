## Why

El Doppelkopf es el gran juego de bazas de Alemania. Se juega entre cuatro con dos barajas de 24 cartas, y las parejas son secretas: forman equipo los dos que tienen las Damas de tréboles, y nadie lo sabe hasta que se juegan o se anuncian. Aporta a la suite un juego de bazas con parejas ocultas, solos y anuncios, distinto del Bridge, del Whist y de las Picas.

## What Changes

- Nuevo juego **Doppelkopf** para 4, jugable contra la IA y en red.
  - **Baraja:** dos barajas de 24 cartas, 48 cartas (A, 10, K, Q, J y 9 de cada palo francés, dos copias de cada una). Valores: A 11, 10 10, K 4, Q 3, J 2 y 9 0; en total, 240 puntos.
  - **Reparto:** 12 cartas a cada uno. Sale el jugador a la izquierda del repartidor.
  - **Triunfos del juego normal**, de mayor a menor: 10 de corazones, las Damas (tréboles, picas, corazones, diamantes), las Jotas (en el mismo orden), y el A, 10, K y 9 de diamantes. Los otros palos (tréboles, picas y corazones sin su 10) son palos normales.
  - **Bazas:** hay que seguir el palo de salida (los triunfos son un palo); si no se puede, cualquier carta. Gana el triunfo más alto o la carta más alta del palo de salida; con dos cartas iguales, gana la primera.
  - **Parejas:** en el juego normal, los dos que tienen las Damas de tréboles son el bando «Re» y los otros dos el bando «Contra».
  - **Reservas:** antes de la primera baza, cada jugador dice «sano» o pide un juego especial:
    - **boda**, si tiene las dos Damas de tréboles: su pareja es el primero que gane una de las tres primeras bazas; si las gana todas, juega solo;
    - **solo de Damas** (solo las Damas son triunfo), **solo de Jotas** (solo las Jotas) o **solo de triunfo** (los triunfos normales): juega solo contra los otros tres.
  - **Anuncios:** «Re» o «Contra» y las bajadas «no 90», «no 60», «no 30» y «negro», cada uno mientras al jugador le queden cartas suficientes.
  - **Puntos de la mano:** el bando Re gana con 121 o más. Se suman puntos de partida por ganar, por las bajadas conseguidas y anunciadas, por los anuncios, «contra los viejos» y por los puntos especiales (zorro, doppelkopf y Carlitos).
  - **Partida:** una ronda de 8 manos, en la que cada jugador reparte dos veces. Gana quien más puntos sume.
- **IA del Doppelkopf en los tres niveles:**
  - **Normal:**
    - pide un solo solo con una mano muy fuerte para él;
    - anuncia Re o Contra con muchos triunfos altos;
    - en el carteo, carga puntos a su pareja cuando la baza es suya y gana con lo justo las bazas con puntos.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Doppelkopf como un juego más en red.
- **Cliente:**
  - el Doppelkopf en el menú;
  - una mesa de bazas para cuatro con el tipo de juego, los anuncios de cada uno y las parejas que ya se conocen;
  - los botones de las reservas y de los anuncios;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - los solos de palo y el solo sin triunfos;
  - los solos obligatorios, la boda silenciosa y las reglas de la casa (Schweinchen, segundo 10 de corazones que gana al primero…);
  - las réplicas a los anuncios fuera de plazo.

## Capabilities

### New Capabilities
- `juego-doppelkopf`: reglas del Doppelkopf:
  - baraja, reparto y triunfos;
  - bazas y parejas;
  - reservas, boda y solos;
  - anuncios y sus plazos;
  - puntos de la mano y puntos especiales;
  - ronda de 8 manos;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Doppelkopf.
- `niveles-ia`: el Doppelkopf entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Doppelkopf con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/doppelkopf.ts`, `ia/doppelkopf-basica.ts` y `ia/reconstruir/doppelkopf.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaDoppelkopf.svelte` y `ResumenDoppelkopf.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la boda y los solos de Damas, de Jotas y de triunfo;
  - con los Nueves (48 cartas);
  - Re/Contra y sus bajadas;
  - una ronda de 8 manos.
