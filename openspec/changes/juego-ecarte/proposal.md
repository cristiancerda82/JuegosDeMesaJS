## Why

El Écarté es el clásico francés de bazas para dos del siglo XIX: manos de solo 5 cartas, un triunfo vuelto y una negociación propia, la de proponer cambiar cartas o jugar «de autoridad» con la mano que se tiene. Es rápido, ideal para el móvil, y aporta a la suite un tipo de decisión que no tiene ningún otro juego: arriesgarse a jugar sin cambiar.

Se reaprovechan el modelo del Piquet (dos jugadores, cambio de cartas con el montón y bazas con 32 cartas) y la mesa de bazas compartida.

## What Changes

- Nuevo juego **Écarté** para 2 jugadores, jugable contra la IA y en red.
  - **Baraja:** la francesa de 32 cartas (del 7 al As), con el orden K, Q, J, As, 10, 9, 8, 7 en cada palo.
  - **Reparto:** 5 cartas a cada uno y la siguiente boca arriba: su palo es el triunfo. Si es un rey, el que reparte anota 1 punto.
  - **Cambio:**
    - el que no reparte (el mano) puede proponer cambiar cartas o jugar;
    - si propone, el que reparte acepta o rehúsa;
    - si acepta, el mano se descarta de 1 a 5 cartas y roba otras tantas del montón, y luego el que reparte se descarta de las que quiera y roba;
    - después el mano puede volver a proponer, mientras quede montón.
  - **Jugar de autoridad:** si el mano juega sin proponer la primera vez, o el que reparte rehúsa la primera propuesta, y ese jugador no hace al menos 3 bazas, el otro anota 2 puntos en lugar de 1.
  - **Rey de triunfo:** quien tiene el rey de triunfo al jugar su primera carta lo anuncia y anota 1 punto.
  - **Bazas:**
    - sale el mano;
    - hay que seguir el palo y ganar la baza si se puede;
    - sin el palo, hay que fallar con triunfo si se tiene.
  - **Puntos de la mano:** quien hace 3 o 4 bazas anota 1 punto (2 si el otro jugó de autoridad); con las 5 bazas (vole), 2.
  - **Partida:** a 5 puntos, en cuanto se llega. El que reparte cambia en cada mano.
- **IA del Écarté en los tres niveles:**
  - **Normal:**
    - juega de autoridad o rehúsa con una mano que hará 3 bazas;
    - se descarta de lo que no es triunfo ni rey;
    - juega las bazas con reglas sencillas.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada decisión (el cambio, el descarte y cada carta) hasta el final de la mano.
- El servidor de salas admite el Écarté como un juego más en red.
- **Cliente:**
  - el Écarté en el menú;
  - una mesa de bazas con:
    - la carta vuelta y el montón;
    - los botones de proponer, jugar, aceptar y rehusar;
    - el descarte;
    - el rey anunciado;
    - las bazas de cada uno;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - las apuestas de los mirones;
  - la partida a más de 5;
  - anunciar el rey de forma opcional: se anuncia siempre que se tiene.

## Capabilities

### New Capabilities
- `juego-ecarte`: reglas del Écarté:
  - baraja, reparto y carta vuelta;
  - cambio con propuestas y jugar de autoridad;
  - rey de triunfo;
  - bazas con la obligación de ganar y de fallar;
  - puntos de la mano;
  - partida a 5;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Écarté.
- `niveles-ia`: el Écarté entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Écarté con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/ecarte.ts`, `ia/ecarte-basica.ts` e `ia/reconstruir/ecarte.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaEcarte.svelte` y `ResumenEcarte.svelte`;
  - cambian el registro de juegos, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - partida a 5;
  - el cambio clásico con el castigo de jugar de autoridad;
  - 1 punto por el rey vuelto y por el anunciado.
