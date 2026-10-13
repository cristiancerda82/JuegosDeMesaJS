## Why

El Cinquillo es uno de los juegos de baraja española más fáciles de aprender y más jugados en familia: no hay triunfos ni puntos que contar, solo colocar cartas en escalera. Para la suite es un juego de mesa compartida, distinto de las bazas y de las capturas. Además reutiliza casi todo lo que ya existe en el cliente: la mano propia y los asientos rivales.

## What Changes

- Nuevo juego **Cinquillo** con baraja española de 40 cartas, jugable de principio a fin contra la IA, de 2 a 4 jugadores:
  - **Reparto:** se reparte toda la baraja (20 cartas cada uno con 2 jugadores, 14-13-13 con 3, y 10 con 4).
  - **Salida:** sale quien tiene el 5 de oros, y es la primera carta que se juega.
  - **Turno:** cada jugador pone un 5 de un palo que aún no esté en la mesa, o alarga por un extremo la escalera de un palo que ya esté: la carta siguiente por arriba (6, 7, Sota, Caballo, Rey) o por abajo (4, 3, 2, As). Si puede jugar, tiene que hacerlo. Si no puede, pasa.
  - **Fin de la mano:** gana quien se queda antes sin cartas. Los demás suman como penalización tantos puntos como cartas les quedan.
  - **Partida:** a 1, 3 o 5 manos (3 por defecto), con el reparto rotando. Gana quien acaba con menos puntos.
- IA básica del Cinquillo: elige la jugada que le deja más cartas propias por jugar y abre menos camino a los rivales.
- El cliente suma el Cinquillo al menú, con sus opciones (jugadores y manos), su mesa (las cuatro escaleras por palo en el centro, la mano propia con las cartas jugables resaltadas, el botón «Paso» y lo que hace cada rival), el resultado de cada mano y su guía "¿Cómo se juega?".
- Fuera de alcance: las fichas y el bote de algunas casas, y el modo en red.

## Capabilities

### New Capabilities
- `juego-cinquillo`: reglas del Cinquillo de 2 a 4 jugadores: reparto, salida con el 5 de oros, escaleras por palo, obligación de jugar, pasar, fin de la mano, penalización y partida a N manos.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Cinquillo, con su nivel mínimo de juego.
- `mesa-cliente`: el menú incluye el Cinquillo, y su mesa muestra las escaleras de cada palo y permite jugar o pasar.

## Impact

- `packages/engine`: nuevos `juegos/cinquillo.ts` e `ia/cinquillo-basica.ts`, con sus tests y la suite genérica del contrato.
- `packages/client`: nueva `MesaCinquillo.svelte`, que reutiliza `ManoPropia`, `AsientoRival` y la interacción. También cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas se redactan a partir del conocimiento del juego clásico y las valida el usuario, en particular la penalización por cartas y que jugar sea obligatorio.
