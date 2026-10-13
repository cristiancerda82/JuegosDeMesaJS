## Why

El Tute es el siguiente juego previsto en la suite y el más jugado con la baraja española junto a la Brisca. Comparte con ella el modelo de bazas (orden de cartas, puntos, triunfo, robo), así que es la ocasión de convertir ese modelo en una pieza común del motor en lugar de duplicarlo, como se anticipó en el diseño de la Brisca.

## What Changes

- Nuevo juego **Tute** con baraja española de 40 cartas, jugable de principio a fin contra la IA:
  - 2 jugadores con robo (como la Brisca: muestra al fondo del mazo) y 4 jugadores en parejas con todas las cartas repartidas.
  - Cantes de 20 (rey y caballo de un palo) y de 40 (de triunfo), solo tras ganar una baza.
  - Cantar el tute (los 4 reyes o los 4 caballos) gana la mano en el acto.
  - Obligaciones de asistir, montar y fallar: siempre con 4 jugadores, y al agotarse el mazo con 2.
  - Cambio del 7 de triunfo por la muestra con 2 jugadores.
  - 10 de últimas para quien gana la última baza.
  - Partida a una mano o al mejor de N.
  - Variantes regionales como configuración (por ejemplo, si hay que montar cuando la baza ya es del compañero).
- El modelo de bazas de la Brisca (orden, puntos, quién gana la baza, robo, obligaciones de arrastre) pasa a ser un módulo común del motor que usan la Brisca y el Tute. Las reglas de la Brisca no cambian.
- IA básica del Tute, con la misma interfaz y garantías que la de la Brisca: canta cuando puede, guarda las parejas de rey y caballo y respeta las obligaciones.
- El cliente suma el Tute al menú, sus opciones y su mesa (con manos de hasta 10 cartas que caben en 360 px), la acción de cantar y su guía "¿Cómo se juega?".
- Fuera de alcance: el Tute de 3 jugadores, el "tute cabrón" o "subastado", el capote como regla de puntuación, y el modo en red.

## Capabilities

### New Capabilities
- `juego-tute`: reglas del Tute español (2 jugadores con robo y 4 en parejas), cantes, tute, obligaciones de juego, puntuación con 10 de últimas, partidas a varias manos y variantes configurables.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Tute, con su nivel mínimo de juego y sus escenarios.
- `mesa-cliente`: el menú incluye el Tute, la mesa permite cantar y muestra los cantes, las manos de 10 cartas caben en pantallas pequeñas, y cada juego tiene su guía "¿Cómo se juega?".

## Impact

- `packages/engine`: nuevo módulo común de bazas, refactor de `juegos/brisca.ts` para usarlo (sin cambios de reglas, con los tests actuales como red), nuevo `juegos/tute.ts` e `ia/tute-basica.ts`, con sus tests y la suite genérica del contrato.
- `packages/client`: nueva mesa del Tute. Las piezas comunes de la mesa de la Brisca (asientos, tapete, mano propia) se separan para compartirlas. También cambian las opciones, los textos, la guía y los tests E2E.
- Sin dependencias nuevas.
- Este change suma requisitos a capacidades que crea `fundaciones-motor-cartas`. Ese change tiene que archivarse antes que este para que las specs principales existan.
- Las reglas se redactan a partir del conocimiento del juego clásico y las valida el usuario, igual que las de la Brisca.
