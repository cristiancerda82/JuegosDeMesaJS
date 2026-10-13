## Why

La Siete y media es el juego de azar más conocido con la baraja española: se juega en familia en Navidad y se aprende en un minuto. Todos los juegos de la suite son de bazas, capturas o combinaciones; este añade una mecánica nueva: pedir cartas contra la banca sin pasarse, apostando fichas. Además es corto y muy apropiado para jugar en el móvil.

## What Changes

- Nuevo juego **Siete y media** con baraja española de 40 cartas, jugable de principio a fin contra la IA:
  - De 2 a 4 jugadores (el humano y de 1 a 3 rivales de la IA). Uno es la banca y los demás son puntos.
  - Valores: del As al 7 valen su número. La Sota, el Caballo y el Rey valen medio punto.
  - Cada mano empieza con las apuestas de los puntos (de 1 a un máximo de fichas). Cada jugador recibe una carta boca abajo, que solo ve él.
  - Por turnos, cada punto pide cartas, que llegan boca arriba, o se planta. Si pasa de 7,5 se pasa y pierde su apuesta al momento. La banca juega la última.
  - Al final se destapan las cartas. La banca gana los empates. Si la banca se pasa, paga a todos los puntos que no se pasaron.
  - La siete y media con dos cartas (un 7 y una figura) cobra el doble, si está activada esa opción.
  - La banca rota entre los jugadores cada mano.
  - Cada jugador empieza con 50 fichas. La partida dura un número de manos (10 por defecto) o hasta que algún jugador se queda sin fichas. Gana quien acaba con más fichas.
  - Variantes como configuración: número de manos, fichas iniciales, apuesta máxima, pago doble de la siete y media natural, y si la banca pasa a quien saca siete y media.
- IA básica de la Siete y media. Como punto, pide hasta un umbral y apuesta según sus fichas. Como banca, pide hasta superar o igualar la mejor jugada visible que le pueda costar.
- El cliente suma la Siete y media al menú, con sus opciones, su mesa (apuesta, pedir y plantarse, cartas tapadas y destapadas, fichas de cada jugador), el resultado de cada mano y su guía "¿Cómo se juega?".
- Fuera de alcance: el comodín (rey de oros como carta libre), las apuestas a mitad de mano o «doblar», jugar varias manos a la vez, y el modo en red.

## Capabilities

### New Capabilities
- `juego-siete-y-media`: reglas de la Siete y media: banca y puntos, apuestas, pedir y plantarse, pasarse, liquidación de la mano, rotación de la banca, partida a N manos y variantes configurables.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Siete y media, como punto y como banca, con su nivel mínimo de juego.
- `mesa-cliente`: el menú incluye la Siete y media, y su mesa permite apostar, pedir y plantarse y muestra la liquidación de cada mano.

## Impact

- `packages/engine`: nuevos `juegos/siete-y-media.ts` e `ia/siete-y-media-basica.ts`, con sus tests y la suite genérica del contrato. Se reutilizan la baraja, el azar y el barajado.
- `packages/client`: nueva `MesaSieteYMedia.svelte`, que reutiliza los asientos rivales y la mano propia de la mesa de bazas. También cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas se redactan a partir del conocimiento del juego clásico y las valida el usuario: que la banca gane los empates, el pago doble de la siete y media natural y la rotación de la banca.
