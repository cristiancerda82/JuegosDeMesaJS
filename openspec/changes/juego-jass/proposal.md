## Why

El Jass es el juego de cartas nacional de Suiza, y el Schieber es su forma más jugada: cuatro en parejas, con 36 cartas, donde quien elige el triunfo puede «schieben» y pasar la elección a su compañero. Su Buur (la Jota del triunfo) y su Nell (el 9) como cartas más altas, los modos sin triunfo hacia arriba o hacia abajo y las declaraciones lo hacen distinto de la Belote y la Sueca, y completa la familia de juegos de bazas por parejas de la suite.

## What Changes

- Nuevo juego **Jass (Schieber)** para 4 en parejas (0 y 2 contra 1 y 3), jugable contra la IA y en red.
  - **Baraja:** 36 cartas francesas, del 6 al As de cada palo; 9 cartas a cada uno.
  - **Elección del modo:** quien elige escoge un palo de triunfo, Obenabe (sin triunfo, el As es la más alta) o Undenufe (sin triunfo, el 6 es la más alta), o pasa la elección a su compañero, que debe elegir. Quien tenía la elección sale en la primera baza.
  - **Órdenes y puntos:**
    - en el triunfo, la Jota (Buur, 20) y el 9 (Nell, 14) son las más altas;
    - en Obenabe y Undenufe el 8 vale 8 puntos;
    - en Undenufe el 6 vale 11 y el As nada.
    - Cada mano reparte 157 puntos con los 5 de la última baza; quien se lleva las 9 bazas suma 257 (Match).
  - **Bazas:**
    - hay que seguir el palo, pero siempre se puede fallar;
    - la Jota del triunfo nunca es obligatoria;
    - no se puede echar un triunfo más bajo que el que ya hay en la baza, salvo con solo triunfos en la mano.
  - **Declaraciones (Weis):**
    - las escaleras de 3 o más y los cuatro iguales se comparan solos al acabar la primera baza;
    - solo la pareja con la mejor declaración anota las suyas;
    - el Stöck (Rey y Dama del triunfo en la misma mano) suma 20.
  - **Multiplicadores:** diamantes y tréboles ×1, corazones y picas ×2, Obenabe y Undenufe ×3; multiplican todos los puntos de la mano.
  - **Partida:** gana la primera pareja que llega a 1.000 puntos, en el momento en que llega, aunque sea en mitad de una mano.
- **IA del Jass en los tres niveles:**
  - **Normal:** elige el modo valorando su mano o pasa si es floja; sale con las cartas más altas que quedan; carga puntos cuando la baza es de su compañero; gana con lo justo las bazas que valen.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** elige como la normal y simula sus bazas hasta el final de la mano, con las cartas ocultas repartidas al azar respetando lo que se sabe.
- El servidor de salas admite el Jass como un juego más en red.
- **Cliente:**
  - el Jass en el menú;
  - una mesa de bazas para cuatro con la elección del modo, el modo y su multiplicador, las declaraciones, los puntos de la mano y de la partida;
  - el resumen de cada mano, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - las cartas suizas (se usan las francesas);
  - el Slalom y otros modos;
  - declarar a mano o callarse las declaraciones;
  - «bedanken» (reclamar la victoria) a mano: la partida termina sola al llegar a 1.000.

## Capabilities

### New Capabilities
- `juego-jass`: reglas del Jass (Schieber):
  - baraja y reparto;
  - elección del modo y schieben;
  - órdenes y puntos por modo;
  - bazas;
  - declaraciones y Stöck;
  - puntos de la mano con su multiplicador;
  - partida a 1.000;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Jass.
- `niveles-ia`: el Jass entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Jass con su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/jass.ts`, `ia/jass-basica.ts` e `ia/reconstruir/jass.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaJass.svelte` y `ResumenJass.svelte`;
  - cambian el registro de juegos, los textos, la pantalla de fin, la guía y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - los modos triunfo, Obenabe y Undenufe con schieben;
  - los multiplicadores ×1, ×2 y ×3;
  - las declaraciones automáticas y el Stöck;
  - la partida a 1.000 puntos.
