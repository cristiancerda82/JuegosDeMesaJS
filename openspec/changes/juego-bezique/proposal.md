## Why

El Bezique es el clásico francés para dos que inspiró el Pinochle. Mezcla bazas con combinaciones cantadas a lo largo de la mano: matrimonios, cuartetos, la escalera de triunfo y el famoso bézique de la dama de picas y la sota de diamantes. Se juega con dos barajas de piquet y aporta a la suite un juego de bazas con cantes distinto del Tute y del Schnapsen.

## What Changes

- Nuevo juego **Bezique** para 2, jugable contra la IA y en red.
  - **Baraja:** dos barajas de piquet, 64 cartas (del 7 al As de cada palo, dos copias de cada una). Orden de mayor a menor: A, 10, K, Q, J, 9, 8 y 7.
  - **Reparto:**
    - 8 cartas a cada uno, y la siguiente se vuelve para marcar el triunfo;
    - si es un 7, el repartidor suma 10;
    - el resto forma el mazo.
  - **Mientras quede mazo:**
    - no hay obligación de seguir el palo;
    - gana la baza el triunfo más alto o la carta más alta del palo de salida; con dos cartas iguales, gana la primera;
    - el ganador de la baza puede hacer una declaración:
      - cantar una combinación, poniendo sus cartas boca arriba en la mesa, aunque siguen siendo de su mano;
      - o cambiar el 7 de triunfo por la carta vuelta (10 puntos);
    - después roba primero el ganador y luego el otro; la última carta que se roba es la vuelta.
  - **Combinaciones:**
    - matrimonio (K y Q del mismo palo): 20; de triunfo: 40;
    - bézique (Q de picas y J de diamantes): 40; doble bézique: 500;
    - cuatro J: 40; cuatro Q: 60; cuatro K: 80; cuatro A: 100;
    - escalera de triunfo (A, 10, K, Q y J): 250;
    - declarar el 7 de triunfo: 10.

    Cada combinación necesita al menos una carta nueva de la mano. Una carta no puede volver a usarse en otra combinación del mismo tipo.
  - **Al acabarse el mazo:** se juegan las 8 últimas bazas sin cantes. Hay que seguir el palo y superar si se puede; si no se tiene el palo, hay que fallar con triunfo si se puede.
  - **Puntos de la mano:** los cantes, 10 por la última baza y 10 por cada As y cada 10 ganados en bazas (*brisques*).
  - **Partida:** a 1.000 puntos. Al acabar una mano, si alguno llega, gana el que más tiene. El repartidor se alterna.
- **IA del Bezique en los tres niveles:**
  - **Normal:**
    - canta siempre la combinación que más puntos da (o cambia el 7);
    - mientras hay mazo, juega las cartas que menos valen y gana las bazas con brisques con la carta justa;
    - en las 8 últimas bazas, gana con lo mínimo si puede.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar.
- El servidor de salas admite el Bezique como un juego más en red.
- **Cliente:**
  - el Bezique en el menú;
  - una mesa de bazas para dos con el triunfo, la carta vuelta, el mazo y las cartas cantadas de cada jugador;
  - los botones de cantar y cambiar el 7;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - el Bezique de más barajas (Rubicon, chino) y de tres o cuatro jugadores;
  - las reglas de cantar varias combinaciones a la vez.

## Capabilities

### New Capabilities
- `juego-bezique`: reglas del Bezique:
  - baraja, reparto y triunfo;
  - bazas mientras hay mazo, declaraciones y robo;
  - combinaciones y su reutilización;
  - las 8 últimas bazas;
  - puntos de la mano;
  - partida a 1.000;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Bezique.
- `niveles-ia`: el Bezique entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Bezique con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/bezique.ts`, `ia/bezique-basica.ts` y `ia/reconstruir/bezique.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBezique.svelte` y `ResumenBezique.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - partida a 1.000;
  - las combinaciones clásicas con el doble bézique;
  - en las 8 últimas bazas, seguir el palo y superar si se puede.
