## Why

El Conquián es el rummy mexicano, considerado el antepasado de todos los juegos de la familia del rummy:
- se juega mano a mano con la baraja española de 40 cartas;
- nunca se mete una carta en la mano: la carta descubierta solo se puede usar bajándola en una combinación;
- gana quien consigue tener 11 cartas bajadas.

Es el rummy que falta en la suite y su mecánica (tomar o dejar la carta descubierta, sin robar a la mano) es distinta a la del Chinchón, el Gin Rummy, el Rummy 500 y el Remigio. Se reaprovechan:
- la validación de combinaciones de los rummies de la suite, con el orden de la baraja española (el 7 y la sota son seguidos);
- la mesa de rummy del cliente, con la mano, las combinaciones de cada jugador y el mazo.

## What Changes

- Nuevo juego **Conquián** para 2 jugadores, jugable contra la IA y en red.
  - **Baraja:** la española de 40, con el orden As, 2, 3, 4, 5, 6, 7, sota, caballo y rey; el 7 y la sota van seguidos y el As solo va antes del 2.
  - **Reparto:** 10 cartas a cada jugador; las 20 restantes forman el mazo.
  - **Combinaciones:**
    - **grupo:** 3 o 4 cartas del mismo número;
    - **escalera:** 3 o más cartas seguidas del mismo palo.
  - **La carta descubierta:**
    - por turno se descubre la primera carta del mazo;
    - quien la descubre puede usarla o pasar, y si pasa, puede usarla el rival;
    - usarla es bajarla en una combinación nueva con cartas de la mano, o añadirla (con cartas de la mano, si hace falta) a una combinación propia;
    - tras usarla hay que descartar una carta de la mano, que el rival puede usar;
    - si nadie usa una carta, queda muerta y descubre la siguiente quien no la descubrió o descartó;
    - ninguna carta se mete en la mano.
  - **Fin de la mano:** gana quien tiene 11 cartas bajadas (sus 10 más la última que usa). Si se acaba el mazo, la mano es tablas.
  - **Partida:** al mejor de 5. Gana quien gana 3 manos; las tablas no cuentan. Si tras 9 manos nadie tiene 3, gana quien más manos ha ganado, o es empate.
- **IA del Conquián en los tres niveles:**
  - **Normal:**
    - usa la carta descubierta siempre que pueda, con la combinación que baja más cartas;
    - descarta la carta que menos le sirve, evitando las que el rival puede añadir a sus combinaciones.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula si usa la carta, cómo y qué descarta, hasta el final de la mano.
- El servidor de salas admite el Conquián como un juego más en red.
- **Cliente:**
  - el Conquián en el menú;
  - una mesa con la mano, las combinaciones de cada jugador, la carta descubierta y el mazo;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - obligar al rival a usar una carta que puede añadir a sus combinaciones;
  - reorganizar las combinaciones ya bajadas;
  - otros números de jugadores y la baraja de 48 cartas.

## Capabilities

### New Capabilities
- `juego-conquian`: reglas del Conquián:
  - baraja y orden;
  - reparto;
  - combinaciones;
  - la carta descubierta, usarla o pasar;
  - descarte;
  - fin de la mano y tablas;
  - partida al mejor de 5;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Conquián.
- `niveles-ia`: el Conquián entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Conquián con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/conquian.ts`, `ia/conquian-basica.ts` e `ia/reconstruir/conquian.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaConquian.svelte` y `ResumenConquian.svelte`;
  - cambian el registro de juegos, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la mano se gana con 11 cartas bajadas;
  - la partida es al mejor de 5 manos.
