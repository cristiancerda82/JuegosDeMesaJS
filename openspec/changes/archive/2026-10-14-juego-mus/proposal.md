## Why

El Mus es el juego de cartas más característico de España. Es un juego de parejas que se decide en las apuestas, no en las bazas: hay que leer la propia mano en cuatro lances distintos y decidir cuánto arriesgar en cada uno. Es el juego que más falta en la suite. Su mecánica no se parece a nada de lo que ya hay: sin bazas ni triunfo, con descartes, envites, órdagos y un conteo al final de cada mano.

## What Changes

- Nuevo juego **Mus** con baraja española de 40 cartas, jugable de principio a fin contra la IA, con 4 jugadores en parejas (tú y el de enfrente contra los otros dos), 4 cartas cada uno:
  - **Ocho reyes:** por defecto, los treses cuentan como reyes y los doses como ases. Con la opción de cuatro reyes, cada carta es lo que es.
  - **Mus:** empezando por la mano (el siguiente al que reparte), cada jugador pide mus o lo corta. Si los cuatro piden mus, cada uno descarta de 1 a 4 cartas y roba otras tantas, y se vuelve a preguntar. En cuanto alguien corta, empiezan los lances.
  - **Lances, en este orden:** Grande (gana la jugada más alta), Chica (la más baja), Pares (parejas, medias o duples) y Juego (31 o más, con la escala 31, 32, 40, 37, 36, 35, 34, 33). Si nadie tiene juego, se juega al Punto (la suma más alta por debajo de 31). En Pares y Juego, cada uno declara primero si tiene, y solo apuestan los que tienen.
  - **Apuestas de cada lance:** se puede pasar, envidar (2 piedras o más), subir el envite, aceptarlo («quiero»), rechazarlo («no quiero») o echar un órdago, que se juega la partida entera en ese lance.
    - Un envite rechazado da al que envidó lo que ya estaba aceptado, o 1 piedra si no había nada.
    - Grande y Chica en paso valen 1 piedra al final.
    - Un órdago aceptado se resuelve en el acto y decide el juego.
  - **Conteo al final de la mano:** se enseñan las cartas y se apuntan, en el orden de los lances, las piedras apostadas y las de las jugadas.
    - **Pares:** 1 por pareja, 2 por medias y 3 por duples, de cada jugador de la pareja ganadora.
    - **Juego:** 3 por la 31 y 2 por cualquier otro juego.
    - **Punto:** 1.
    - **Empates:** los gana el más cercano a la mano.
    - La pareja que llega a los puntos del juego gana en cuanto llega, aunque queden lances por contar.
  - **Partida:** cada juego se gana al llegar a 40 piedras (opción: 30). Gana la partida la pareja que gana antes 1 juego, 2 de 3 (por defecto) o 3 de 5.
- IA básica del Mus:
  - Corta el mus con buenas manos y descarta lo que no le sirve.
  - Envida, acepta y sube según la fuerza de su jugada en cada lance, teniendo en cuenta si es mano.
  - Solo echa o acepta órdagos con jugadas muy fuertes.
- El cliente suma el Mus al menú, con sus opciones, y una mesa propia:
  - Botones de mus y de corte, y elección de las cartas a descartar.
  - Botones de apuesta.
  - Marcador de piedras y juegos.
  - Lance en curso y envites a la vista.
  - Panel de conteo al final de cada mano con las cartas de todos.
  - Su guía «¿Cómo se juega?».
- Fuera de alcance: las señas entre compañeros, el Mus de 2 o de 6 jugadores, la «real» y otras variantes regionales (31 real, juego de 31 con 3 sotas…), y el modo en red.

## Capabilities

### New Capabilities
- `juego-mus`: reglas del Mus en parejas:
  - el mus y los descartes;
  - los cuatro lances con sus jugadas y declaraciones;
  - las apuestas (envite, subida, quiero, no quiero, órdago);
  - el conteo;
  - el fin del juego y de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Mus.
- `mesa-cliente`: el menú incluye el Mus, con su mesa, sus opciones, el conteo de cada mano y su guía.

## Impact

- **`packages/engine`:** nuevos `juegos/mus.ts`, con la evaluación de jugadas en un módulo propio (`juegos/mus-jugadas.ts`), e `ia/mus-basica.ts`, con sus tests y la suite genérica del contrato. No usan `motor/bazas.ts`.
- **`packages/client`:**
  - Nueva `MesaMus.svelte`, que reutiliza `AsientoRival`, `ManoPropia` y la selección múltiple de cartas para el descarte.
  - Cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas se redactan a partir del conocimiento del juego clásico y las valida el usuario, en particular:
  - los ocho reyes por defecto;
  - la escala del juego;
  - las piedras de cada jugada;
  - la simplificación de que, ante un envite, contesta primero el rival siguiente y, si no lo quiere, su compañero.
