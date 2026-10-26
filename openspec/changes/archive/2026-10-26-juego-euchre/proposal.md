## Why

El Euchre es el juego de bazas por parejas más popular de Norteamérica: es rápido (5 cartas por mano), y su gracia está en las jotas, que se convierten en las cartas más altas del triunfo, y en decidir si se pide el triunfo o se juega solo. Reutiliza el motor de bazas, la mesa de bazas compartida y la muestra del Whist.

## What Changes

- Nuevo juego **Euchre** clásico, jugable contra la IA y en red: 4 jugadores en dos parejas (0 y 2 contra 1 y 3).
  - **Baraja:** francesa de 24 cartas, del 9 al As de cada palo.
  - **Reparto:** 5 cartas a cada uno. De las 4 que sobran, la de arriba se pone boca arriba (la *carta vuelta*).
  - **Elegir el triunfo:**
    - **primera vuelta:** desde la izquierda del repartidor, cada uno puede *pedir* el palo de la carta vuelta o pasar. Si alguien lo pide, el repartidor recoge la carta vuelta y se descarta de una;
    - **segunda vuelta:** si todos pasan, cada uno puede nombrar otro palo o pasar;
    - si todos vuelven a pasar, se reparte de nuevo con el siguiente repartidor.
  - **Jugar solo:** quien elige el triunfo puede jugar sin su compañero, que deja la mano.
  - **Orden de las cartas:**
    - la J del triunfo (*bower derecho*) es la más alta;
    - la J del otro palo del mismo color (*bower izquierdo*) es la segunda y cuenta como del palo del triunfo;
    - después vienen A, K, Q, 10 y 9 del triunfo. En los demás palos el orden es A, K, Q, J, 10 y 9.
  - **Jugar:** sale el de la izquierda del repartidor. Hay que seguir el palo de salida si se puede, y la baza la gana el triunfo más alto o, si no hay, la más alta del palo de salida.
  - **Puntos de la mano:**
    - si la pareja que eligió el triunfo hace 3 o 4 bazas, 1 punto; si hace las 5, 2 puntos (4 si quien eligió jugaba solo);
    - si hace menos de 3 (*euchre*), los rivales ganan 2.
  - **Partida:** a 10 puntos; el repartidor rota cada mano.
- **IA del Euchre en los tres niveles:**
  - la normal pide o nombra el triunfo según la fuerza de su mano en ese palo (bowers, As y triunfos), juega solo con una mano muy fuerte, descarta su carta más baja que no es triunfo y juega las bazas con las reglas comunes de bazas;
  - la fácil se equivoca a veces;
  - la difícil simula las bazas con las manos ocultas repartidas al azar, y elige el triunfo como la normal.
- El servidor de salas admite el Euchre como un juego más en red.
- **Cliente:**
  - el Euchre en el menú;
  - la mesa de bazas compartida con la carta vuelta, los botones para pedir, nombrar palo, jugar solo o pasar, y el descarte del repartidor;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - *stick the dealer* (obligar al repartidor a elegir);
  - jugar solo como defensor;
  - partidas a otros puntos.

## Capabilities

### New Capabilities
- `juego-euchre`: reglas del Euchre:
  - baraja y reparto;
  - elección del triunfo en dos vueltas;
  - jugar solo;
  - orden de las cartas con los bowers;
  - bazas;
  - puntos de la mano;
  - partida a 10;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Euchre.
- `niveles-ia`: el Euchre entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Euchre con su mesa, el resumen de la mano y el fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/euchre.ts`, `ia/euchre-basica.ts` y `ia/reconstruir/euchre.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaEuchre.svelte` y `ResumenEuchre.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - elección del triunfo clásica (sin obligar al repartidor);
  - se puede jugar solo;
  - partida a 10 puntos.
