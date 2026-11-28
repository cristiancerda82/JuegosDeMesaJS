## Why

El último juego de envite recomendado en la revisión de los libros es el **Rams**, que Núñez Elvira describe como un juego de Francia y Bélgica «muy apropiado para distraerse en familia». No se juega a puntos, sino a quitarse fichas:
- cada jugador empieza con 5 fichas y se quita una por cada baza que hace;
- en cada mano, cada uno decide si juega («¡Rams!») o pasa, y puede cambiar su mano por la «niña», cinco cartas que se dejan aparte;
- quien juega y no hace ninguna baza queda «ramsé» y toma 5 fichas de la canasta;
- quien se queda sin fichas se retira, y pierde el último que conserva alguna.

Las bazas se juegan casi como en el Tute: asistir montando y fallar, pero sin sobrefallo libre (sin poder superar el fallo, hay que echar triunfo igualmente). La suite ya tiene esas obligaciones (`cartasObligadas`), la mesa de bazas para 3 a 6 y los juegos de pasar o jugar cada mano (el Julepe, el Bourré).

## What Changes

- Nuevo juego **Rams** para 3 a 6 jugadores, cada uno contra los demás, contra la IA y en red.
  - **Baraja:** la francesa de 32 cartas (del As al 7). Orden de cada palo: As, Rey, Dama, Jota, 10, 9, 8 y 7.
  - **Reparto:** con 2 a 5 jugadores en juego, 5 cartas a cada uno; con 6, 4. Se dejan aparte otras tantas boca abajo, la niña, y la siguiente se vuelve: el pinte, que marca el triunfo. Solo reciben cartas los que aún tienen fichas.
  - **Hablar:** desde el siguiente al que reparte, cada uno dice si juega o pasa. Mientras nadie la haya cogido, cualquiera menos el que reparte puede cambiar su mano por la niña, y entonces juega. El que reparte siempre juega: si todos pasan, gana la mano sin jugarla y se quita tantas fichas como bazas tiene la mano.
  - **El pinte:** después de hablar, el que reparte descarta una carta y se queda el pinte, que todos ven hasta que lo juega.
  - **Bazas:** solo entre los que juegan. Sale el primero que juega tras el que reparte; después, quien gana la baza. Hay que seguir el palo superando la carta más alta si se puede; sin el palo, fallar, y si ya han fallado, superar el triunfo más alto; si no se puede, echar triunfo igualmente; sin triunfos, cualquiera.
  - **Fichas:** al acabar la mano, cada uno que jugó se quita una ficha por baza; quien jugó y no hizo ninguna toma 5 de la canasta, que empieza con 5 por jugador, mientras queden. Quien se queda sin fichas se retira.
  - **Partida:** acaba cuando solo uno conserva fichas, que pierde. Ganan los que se quedaron antes sin fichas.
- **IA del Rams en los tres niveles:**
  - **Normal:** calcula las bazas que espera hacer con sus Ases, sus triunfos altos y sus palos largos; juega si espera al menos una (o si nadie ha jugado y es el último en hablar), coge la niña con una mano sin bazas y gana las bazas con la carta más barata que pueda.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada decisión hasta el final de la mano.
- El servidor de salas admite el Rams como un juego más en red.
- **Cliente:**
  - el Rams en el menú (familia «Envite y apuestas»), con la opción de jugadores;
  - una mesa de bazas con el pinte, las fichas de cada uno, quién juega y quién pasa, los botones para jugar, pasar o coger la niña y el descarte del que reparte;
  - el resumen de cada mano con las bazas y las fichas de cada uno;
  - el fin de partida con el orden en que se quedó cada uno sin fichas;
  - la guía con sus ejemplos comprobados con el motor y su historia;
  - el consejo del modo asistido.
- **Fuera de alcance:** 7 y 8 jugadores, el «Rams general» (ir a por todas las bazas), el «triunfo de auxilio», el valor en dinero de las fichas y las fórmulas de reparto de las apuestas.

## Capabilities

### New Capabilities
- `juego-rams`: reglas del Rams:
  - baraja, reparto, niña y pinte;
  - hablar: jugar, pasar o coger la niña;
  - bazas y obligaciones;
  - fichas, ramsé y retirada;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Rams.
- `niveles-ia`: el Rams entra en la lista de juegos con tres niveles, con su reconstrucción.
- `mesa-cliente`: el menú incluye el Rams con su mesa y su fin de partida.
- `menu-juegos`: el Rams entra en la familia «Envite y apuestas».

## Impact

- `packages/engine`:
  - **Nuevos:** `juegos/rams.ts`, `ia/rams-basica.ts` e `ia/reconstruir/rams.ts`, con sus tests y la suite genérica del contrato.
  - **Deducción común de las obligaciones (`topesPorObligaciones`):** prepara también los palos franceses, sin cambiar lo que deduce para los juegos con baraja española.
  - **Registro:** en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - **Nuevos:** `MesaRams.svelte` y `ResumenRams.svelte`.
  - **Cambian:** el registro de juegos y las opciones, el catálogo y el modo asistido, los textos y la guía con sus ejemplos, la pantalla de fin y los E2E.
- No hay dependencias nuevas.
- Las reglas son las de Núñez Elvira; la canasta y las apuestas en dinero se sustituyen por la clasificación de la partida.
