## Why

El Belote es el juego de cartas más popular de Francia: bazas por parejas con 32 cartas, en las que la J y el 9 del triunfo son las cartas más altas y valen más que el As. El triunfo se elige tomando la carta vuelta, como en el Euchre, pero las cartas cuentan puntos y hay que hacer más que los rivales. Reutiliza el motor de bazas, la mesa de bazas compartida y la elección del triunfo del Euchre.

## What Changes

- Nuevo juego **Belote** clásico, jugable contra la IA y en red: 4 jugadores en dos parejas (0 y 2 contra 1 y 3).
  - **Baraja:** francesa de 32 cartas, del 7 al As de cada palo.
  - **Reparto:** 5 cartas a cada uno, y la siguiente se pone boca arriba (la *carta vuelta*).
  - **Elegir el triunfo:**
    - **primera vuelta:** desde la izquierda del repartidor, cada uno puede *tomar* el palo de la carta vuelta o pasar;
    - **segunda vuelta:** si todos pasan, cada uno puede nombrar otro palo o pasar;
    - si todos vuelven a pasar, se reparte de nuevo con el siguiente repartidor.
  - **Completar las manos:** quien toma se lleva la carta vuelta y 2 cartas más, y los demás 3 cada uno. Todos acaban con 8.
  - **Orden y valor de las cartas:**
    - en el triunfo: J (20), 9 (14), A (11), 10 (10), K (4), Q (3), 8 y 7 (0);
    - en los demás palos: A (11), 10 (10), K (4), Q (3), J (2), 9, 8 y 7 (0).
  - **Jugar:** sale el de la izquierda del repartidor.
    - hay que seguir el palo de salida;
    - si se sale de triunfo, hay que montar (jugar uno más alto) si se puede;
    - si no se tiene el palo, hay que fallar con triunfo, salvo que la baza vaya ya para el compañero; si un rival ya ha fallado, hay que montar si se puede, y si no, echar triunfo igualmente.
  - **Belote-rebelote:** quien tiene el rey y la dama del triunfo los anuncia al jugarlos y suma 20 puntos a su pareja.
  - **Puntos de la mano:** las cartas suman 152, y la última baza vale 10 más (*diez de últimas*).
    - la pareja que tomó tiene que hacer más puntos que la otra (con el belote);
    - si lo consigue, cada pareja se apunta sus puntos;
    - si no (*dentro*), los rivales se apuntan los 162 y el belote se lo queda quien lo tenía;
    - si una pareja hace todas las bazas (*capot*), se apunta 252 en lugar de 162.
  - **Partida:** a 501 puntos; el repartidor rota cada mano.
- **IA del Belote en los tres niveles:**
  - la normal toma o nombra el triunfo según la fuerza de su mano en ese palo (J, 9, As y número de triunfos) y juega las bazas con las reglas comunes de bazas;
  - la fácil se equivoca a veces;
  - la difícil simula las bazas con las manos ocultas repartidas al azar, y elige el triunfo como la normal.
- El servidor de salas admite el Belote como un juego más en red.
- **Cliente:**
  - el Belote en el menú;
  - la mesa de bazas compartida con la carta vuelta, los botones para tomar, nombrar palo o pasar, y el aviso del belote y el rebelote;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - los anuncios de tercera, cincuenta, cien y cuadrados;
  - el *litigio*: con empate a puntos, cada pareja se apunta los suyos;
  - el Coinche y partidas a otros puntos.

## Capabilities

### New Capabilities
- `juego-belote`: reglas del Belote:
  - baraja y reparto;
  - elección del triunfo en dos vueltas y el reparto del resto;
  - orden y valor de las cartas;
  - bazas con la obligación de montar y de fallar;
  - belote-rebelote;
  - puntos de la mano, dentro y capot;
  - partida a 501;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Belote.
- `niveles-ia`: el Belote entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Belote con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/belote.ts`, `ia/belote-basica.ts` y `ia/reconstruir/belote.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaBelote.svelte` y `ResumenBelote.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - elección del triunfo clásica con la carta vuelta;
  - solo el anuncio de belote-rebelote;
  - partida a 501 puntos.
