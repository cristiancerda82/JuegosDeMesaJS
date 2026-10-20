## Why

La Cuatrola es el Tresillo para 4 jugadores, uno de los juegos de bazas más antiguos de la baraja española. Añade a la suite dos cosas que no tiene:
- **matadores:** cartas que son triunfo sea cual sea el palo elegido, con un orden propio que invierte oros y copas;
- **compañero secreto:** quien entra puede llamar a un rey, y quien lo tiene juega con él sin que se sepa hasta que lo echa.

Reutiliza la mesa de bazas de 4, la subasta por turnos del Tute subastado, el cobro en fichas y la IA por simulación.

## What Changes

- Nuevo juego **Cuatrola**, jugable contra la IA y en red, con 4 jugadores:
  - **Reparto:** baraja española de 40 cartas, 10 a cada jugador. El reparto rota y es mano el siguiente al repartidor.
  - **Subasta:** desde la mano, cada uno pasa o puja jugar **con rey** o jugar **solo**, que vale más. Se puede subir de «con rey» a «solo», y quien pasa ya no vuelve a hablar. Si pasan los cuatro, se reparte otra vez.
  - **Triunfo y rey:** quien gana la subasta (el **jugador**) elige el triunfo. Si juega con rey, nombra un rey que no tiene, o un caballo si tiene los cuatro reyes. Quien tenga esa carta es su compañero en secreto, hasta que la juega.
  - **Orden de las cartas (el del Tresillo):**
    - **Matadores**, siempre triunfo: espadilla (As de espadas), malilla (el 7 del triunfo si es oros o copas, el 2 si es espadas o bastos), basto (As de bastos) y, con triunfo de oros o copas, el «punto» (su As).
    - **Triunfo:** tras los matadores, Rey, Caballo y Sota, y después, si es rojo, 2, 3, 4, 5 y 6, y si es negro, 7, 6, 5, 4 y 3.
    - **Palos que no son triunfo:** en oros y copas, Rey, Caballo, Sota, As, 2, 3, 4, 5, 6 y 7; en espadas y bastos (sin su As, que es matador), Rey, Caballo, Sota, 7, 6, 5, 4, 3 y 2.
  - **Bazas:** sale la mano. Hay que seguir el palo de salida si se puede; si no, se juega cualquier carta, sin obligación de fallar ni de superar. Un matador no está obligado a salir ante un triunfo menor: si se sale de triunfo, quien solo tiene matadores más altos que la carta de salida puede jugar otra.
  - **Cobro:** el jugador (con su compañero, si lo hay) gana si hace 6 bazas o más.
    - Con rey: si ganan, cada defensor paga 1 ficha a cada uno de la pareja; si pierden, el jugador paga 2 a cada defensor y el compañero no paga.
    - Solo: si gana, cobra 2 de cada rival; si pierde, paga 2 a cada uno.
    - Con las 10 bazas (**bola**), el cobro se dobla.
  - **Partida:** todos empiezan con 0 fichas. Se juegan 8 manos (4 o 12 en Opciones), sin contar las que se reparten de nuevo. Gana quien más fichas tiene; si hay empate, ganan todos los empatados.
- **IA de la Cuatrola en los tres niveles:**
  - la básica estima las bazas que haría con cada palo de triunfo, puja con rey o solo según esa estimación, llama el rey del palo en que es más corta y juega las bazas sabiendo quién es su compañero cuando lo sabe;
  - la fácil se equivoca a veces;
  - la difícil simula la elección del triunfo y del rey, y cada carta. Las pujas las decide como la normal.
- El servidor de salas admite la Cuatrola como un juego más en red, con 4 asientos.
- **Cliente:**
  - la Cuatrola en el menú y sus opciones (manos y nivel de la IA);
  - una mesa propia sobre la mesa de bazas de 4, con el panel de la subasta («Paso», «Con rey» y «Solo»), la elección del triunfo y del rey, el jugador y su modalidad, el rey llamado, el compañero cuando se descubre, las bazas de cada bando y las fichas;
  - el resumen de cada mano, la clasificación por fichas en la pantalla de fin y la guía «¿Cómo se juega?» con el orden de los matadores.
- **Fuera de alcance:** el codillo (cobro especial si un defensor hace más bazas que el jugador), la «vuelta» de la carta del mazo, las pujas de «bola» anunciada, los cobros por matadores y las variantes de 3 jugadores (Tresillo).

## Capabilities

### New Capabilities
- `juego-cuatrola`: reglas de la Cuatrola:
  - reparto;
  - subasta con rey o solo;
  - triunfo y rey llamado;
  - orden con matadores;
  - bazas con obligación de seguir el palo y privilegio de los matadores;
  - cobro en fichas y bola;
  - fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Cuatrola (puja, triunfo, rey y juego de cartas).
- `niveles-ia`: la Cuatrola entra en la lista de juegos con tres niveles y en la reconstrucción de las cartas ocultas. Su difícil simula el triunfo, el rey y las cartas, no las pujas.
- `mesa-cliente`: el menú incluye la Cuatrola con su mesa, su resumen y su clasificación.

## Impact

- `packages/engine`:
  - nuevos `juegos/cuatrola.ts` (con su orden de cartas propio, que no cabe en `ValoresBazas`), `ia/cuatrola-basica.ts` e `ia/reconstruir/cuatrola.ts`, con sus tests y la suite genérica del contrato;
  - usa `repartirConFallos` de la reconstrucción de la Butifarra sin cambiarlo;
  - se registra en `IAS` y en `red.ts`.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaCuatrola.svelte` y `ResumenCuatrola.svelte`, sobre `MesaBazas`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas salen de la Cuatrola clásica y las valida el usuario:
  - el orden del Tresillo con los matadores;
  - la subasta con rey o solo;
  - el privilegio de los matadores;
  - el cobro: 1 con rey, 2 solo, doble con bola, y que solo pague el jugador si pierde con rey;
  - las 8 manos.
