## Why

La Pocha es el juego de bazas «de predicción» más popular con la baraja española. Antes de cada mano, cada jugador dice cuántas bazas va a hacer, y solo puntúa si acierta. Añade a la suite una decisión nueva, apostar el número de bazas, sobre un motor de bazas que ya está hecho y probado con la Brisca, el Tute y el Guiñote. Además, cada jugador juega por su cuenta y las manos van creciendo y menguando, así que es muy distinta de lo que ya hay.

## What Changes

- Nuevo juego **Pocha** con baraja española de 40 cartas, jugable de principio a fin contra la IA, con 3 o 4 jugadores, cada uno por su cuenta:
  - **Manos:** el número de cartas de cada mano sube de 1 en 1 hasta un máximo y vuelve a bajar. En la partida corta (por defecto) son 1, 2, 3, 4, 5, 4, 3, 2, 1. En la completa, de 1 hasta las cartas que dé la baraja (10 con 4 jugadores, 13 con 3) y de vuelta a 1. El reparto rota.
  - **Triunfo:** lo marca la carta siguiente al reparto, boca arriba. Si se reparte toda la baraja, lo marca la última carta del repartidor, que todos ven.
  - **Apuestas:** antes de jugar, cada jugador, empezando por el siguiente al repartidor, dice cuántas bazas hará (de 0 al número de cartas). Por defecto, el repartidor, que apuesta el último, no puede hacer que la suma de las apuestas sea igual al número de cartas.
  - **Bazas** con las obligaciones clásicas: seguir el palo y superar si se puede; si no, fallar con triunfo y superar si se puede. El orden de las cartas es el de la Brisca: As, 3, Rey, Caballo, Sota, 7…2.
  - **Puntuación de cada mano:** quien acierta sus bazas suma 10 más 5 por cada baza apostada. Quien falla resta 5 por cada baza de diferencia. Gana la partida quien más puntos tiene al final.
  - **Variantes como configuración:** la duración (corta o completa) y la restricción del repartidor.
- La mesa de bazas compartida pasa a aceptar 3 jugadores sin parejas, con nombres y detalle de cada asiento a cargo del juego. Con la Brisca, el Tute y el Guiñote se comporta igual que hasta ahora.
- IA básica de la Pocha:
  - **Al apostar:** estima sus bazas por sus triunfos y sus cartas altas.
  - **Al jugar:** intenta ganar bazas mientras le falten y perderlas cuando ya tiene las que dijo.
- El cliente suma la Pocha al menú, con sus opciones, su mesa (botones de apuesta, apuestas y bazas de cada uno a la vista, triunfo y número de cartas de la mano), el resultado de cada mano con su puntuación y su guía "¿Cómo se juega?".
- Fuera de alcance: 5 o 6 jugadores, las manos «a ciegas» y sin triunfo de algunas variantes, y el modo en red.

## Capabilities

### New Capabilities
- `juego-pocha`: reglas de la Pocha con 3 y 4 jugadores: secuencia de manos, triunfo, apuestas con la restricción del repartidor, bazas con obligaciones, puntuación por acierto y fin de la partida.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Pocha, para apostar y para jugar.
- `mesa-cliente`: el menú incluye la Pocha. Su mesa permite apostar y muestra las apuestas y las bazas de cada jugador, y la mesa de bazas admite 3 jugadores.

## Impact

- `packages/engine`: nuevos `juegos/pocha.ts` e `ia/pocha-basica.ts`, con sus tests y la suite genérica del contrato. Reutilizan `motor/bazas.ts` (quién gana, robo no, obligaciones) y `ia/bazas-heuristica.ts`.
- `packages/client`: nueva `MesaPocha.svelte` sobre `MesaBazas`. `MesaBazas`, `asientos.ts` y `Tapete` admiten 3 jugadores y reciben de cada juego el nombre y el detalle de cada asiento. También cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas se redactan a partir del conocimiento del juego clásico y las valida el usuario: la puntuación de 10 + 5 por baza, la restricción del repartidor y la secuencia de manos.
