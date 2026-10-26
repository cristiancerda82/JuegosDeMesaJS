## Why

El Durak es el juego de cartas más popular de Rusia y del este de Europa, y su mecánica no se parece a nada de la suite. No hay bazas ni puntos: se ataca y se defiende, y pierde el último que se queda con cartas, el «durak» (el tonto). Reutiliza la baraja francesa, el triunfo con carta de muestra y la mesa de varios rivales del Sevens y el Culo.

## What Changes

- Nuevo juego **Durak** en su variante clásica (*podkidnoy*), jugable contra la IA y en red, de 2 a 6 jugadores, cada uno por su cuenta (2 por defecto):
  - **Baraja:** francesa de 36 cartas, del 6 al As. Orden de menor a mayor: 6, 7, 8, 9, 10, J, Q, K y A.
  - **Reparto:** 6 cartas a cada uno. La última carta del mazo se pone boca arriba debajo de él y marca el **triunfo**; es la última que se roba.
  - **Primer ataque:** empieza quien tiene el triunfo más bajo, y ataca al jugador de su izquierda.
  - **Ataque:** el atacante pone una carta. El defensor tiene que **ganarla** (una más alta del mismo palo o, si no es triunfo, cualquier triunfo) o **llevarse** todas las cartas de la mesa.
  - **Echar cartas:** cuando el defensor ha ganado todo lo que hay en la mesa, cualquier jugador menos él puede echar otra carta de un número que ya esté en la mesa, empezando por el atacante. Como mucho hay 6 ataques por ronda, y nunca más de los que el defensor puede cubrir con su mano.
  - **Fin de la ronda:**
    - si nadie echa más y el defensor lo ha ganado todo, las cartas van al descarte y el defensor ataca en la siguiente ronda;
    - si el defensor se lleva las cartas, pierde su turno de atacar y ataca el siguiente.
  - **Robar:** tras cada ronda, todos roban del mazo hasta tener 6 cartas: primero el atacante, después los demás que echaron y el defensor al final.
  - **Salir:** con el mazo vacío, quien se queda sin cartas sale de la partida y ya está a salvo.
  - **Fin de la partida:** el último que se queda con cartas es el *durak* y pierde; los demás ganan. Si los últimos se quedan sin cartas a la vez, la partida es empate.
- **IA del Durak en los tres niveles:**
  - la normal ataca y echa sus cartas más bajas que no son triunfo, defiende con la carta más barata que gana y se lleva las cartas cuando defender le costaría un triunfo alto con mucho mazo por delante;
  - la fácil se equivoca a veces;
  - la difícil simula cada decisión con las manos ocultas y el mazo repartidos al azar.
- El servidor de salas admite el Durak como un juego más en red.
- **Cliente:**
  - el Durak en el menú y sus opciones (jugadores y nivel de la IA);
  - una mesa propia con los rivales y sus cartas, el mazo con la carta del triunfo, la mesa con los pares de ataque y defensa, el descarte y la mano propia;
  - los botones «Me las llevo» y «Paso»;
  - la pantalla de fin con quién es el durak, y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - la variante *perevodnoy* (pasar el ataque);
  - las parejas;
  - la partida de varias manos;
  - el límite de 5 cartas en el primer ataque;
  - echar cartas después de que el defensor decida llevárselas.

## Capabilities

### New Capabilities
- `juego-durak`: reglas del Durak:
  - baraja, reparto y triunfo;
  - ataque, defensa y llevarse las cartas;
  - echar cartas y sus límites;
  - fin de la ronda y robar;
  - salir y fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Durak.
- `niveles-ia`: el Durak entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Durak con su mesa y su pantalla de fin.

## Impact

- `packages/engine`:
  - nuevos `juegos/durak.ts`, `ia/durak-basica.ts` y `ia/reconstruir/durak.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nueva `MesaDurak.svelte`;
  - cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la variante clásica (*podkidnoy*);
  - de 2 a 6 jugadores, cada uno por su cuenta;
  - una mano por partida.
