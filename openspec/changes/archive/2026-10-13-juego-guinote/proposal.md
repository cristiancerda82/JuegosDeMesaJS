## Why

El Guiñote es el juego de bazas más popular de Aragón y de buena parte del norte de España. Es pariente cercano del Tute, pero se juega con 6 cartas y a 101 puntos, con «vueltas» si nadie llega en la primera mano. La suite ya tiene el módulo de bazas y la mesa de bazas compartidos, así que el Guiñote se puede añadir reutilizándolos casi por completo. Además sirve para comprobar que ese modelo admite otro orden y otro valor de las cartas sin duplicar código.

## What Changes

- Nuevo juego **Guiñote** con baraja española de 40 cartas, jugable de principio a fin contra la IA:
  - 2 jugadores, o 4 en parejas, con 6 cartas cada uno. La carta siguiente queda boca arriba bajo el mazo y marca el triunfo (la muestra).
  - Orden y valor propios: as (11), tres (10), rey (4), sota (3), caballo (2), 7, 6, 5, 4 y 2 (0). A diferencia del Tute, la sota está por encima del caballo.
  - Mientras queda mazo, se puede jugar cualquier carta. Tras cada baza, el ganador roba primero.
  - **Arrastre**: al agotarse el mazo es obligatorio seguir el palo de salida y montar. Sin ese palo, hay que fallar con triunfo y montar si se puede.
  - Cantes de 20 y 40 con **rey y sota** del mismo palo (40 si es de triunfo), justo después de ganar una baza y solo mientras queda mazo.
  - El que tiene el 7 de triunfo puede cambiarlo por la muestra después de ganar una baza, mientras queda mazo.
  - La última baza suma 10 puntos (10 de últimas). Sin cantes, cada mano reparte 130 puntos.
  - **Partida a 101**: si al acabar la primera mano ningún bando llega, se juega otra mano «de vueltas» y los puntos se acumulan hasta que un bando llega a 101.
  - Variantes como configuración: el cambio del 7 (no, libre o tras ganar baza), montar sobre el compañero con 4 jugadores, y los puntos de la partida (101 por defecto).
- El módulo de bazas pasa a aceptar el orden y el valor de las cartas como parámetro. Por defecto se mantienen los de la Brisca y el Tute, que no cambian.
- IA básica del Guiñote, basada en la heurística de bazas del Tute: canta y cambia el 7 siempre que puede y guarda las parejas que aún puede cantar.
- El cliente suma el Guiñote al menú, con sus opciones, su mesa (sobre la mesa de bazas compartida, con cantes, cambio del 7 y marcador a 101), el resumen de cada mano y su guía "¿Cómo se juega?".
- Fuera de alcance: «cerrar» o contar los puntos a mitad de una mano de vueltas, el «tute» y los cantes en arrastre de algunas variantes, el Guiñote de 3 jugadores y el modo en red.

## Capabilities

### New Capabilities
- `juego-guinote`: reglas del Guiñote con 2 jugadores y 4 en parejas: reparto, triunfo, robo, arrastre, cantes, cambio del 7, puntuación, partida a 101 con vueltas y variantes configurables.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Guiñote, con su nivel mínimo de juego y sus escenarios.
- `mesa-cliente`: el menú incluye el Guiñote, y su mesa muestra los cantes, el cambio del 7, el marcador de la partida y el resumen de cada mano.

## Impact

- `packages/engine`: nuevos `juegos/guinote.ts` e `ia/guinote-basica.ts`, con sus tests y la suite genérica del contrato. `motor/bazas.ts` y `ia/bazas-heuristica.ts` reciben el orden y el valor de las cartas como parámetro opcional, y la Brisca y el Tute siguen pasando sus tests sin cambios.
- `packages/client`: nueva `MesaGuinote.svelte` sobre `MesaBazas`. También cambian el registro de juegos, las opciones, los textos, la pantalla de fin, la guía y los tests E2E.
- Sin dependencias nuevas.
- Las reglas se redactan a partir del conocimiento del juego clásico y las valida el usuario. En particular: los cantes con rey y sota, la sota por encima del caballo, el cambio con el 2 si la muestra es baja y que no se cante en el arrastre.
