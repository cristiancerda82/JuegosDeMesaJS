## Why

El Treinta y uno (Thirty-one o Scat) es un juego de cartas rápido y muy popular para grupos:
- cada jugador tiene solo 3 cartas;
- por turno se roba y se descarta para sumar lo más cerca posible de 31 en un mismo palo;
- cuando alguien cree que tiene buena mano, se planta, y los demás tienen un último turno;
- quien tiene la peor mano pierde una vida; el último que queda con vidas gana.

Es ligero, se juega de 2 a 6 y su decisión central (cuándo plantarse) es distinta a la de los rummies de la suite. Se reaprovechan:
- la baraja francesa y el robo del mazo o del descarte del Gin Rummy;
- los asientos de 2 a 6 jugadores de la mesa de bazas.

## What Changes

- Nuevo juego **Treinta y uno** de 2 a 6 jugadores (4 por defecto), jugable contra la IA y en red.
  - **Baraja:** la francesa de 52.
  - **Valor de la mano:** la mayor suma de cartas de un mismo palo, con el As 11, las figuras 10 y las demás su número (como mucho 31). Tres cartas del mismo número valen 30,5.
  - **Reparto:** 3 cartas a cada jugador con vidas; se descubre una carta para empezar el descarte, y el resto forma el mazo.
  - **Turno:**
    - robar del mazo o la carta de arriba del descarte, y descartar una (no la que acaba de coger del descarte);
    - o plantarse, en lugar de robar, si nadie se ha plantado aún en la ronda.
  - **Tras plantarse:** cada uno de los demás juega un último turno, y se enseñan las manos.
  - **Vidas:** cada jugador empieza con 3. Al enseñar las manos, quien tiene la peor pierde una vida (si empatan varios, todos). Quien se queda sin vidas queda fuera.
  - **Partida:** gana el último con vidas. Si los últimos pierden su última vida a la vez, empatan.
- **IA del Treinta y uno en los tres niveles:**
  - **Normal:**
    - coge la carta del descarte si con ella sube su mano al menos 4 puntos;
    - descarta la carta que deja la mejor mano;
    - se planta con 27 o más.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula plantarse o robar, de dónde roba y qué descarta hasta el final de la ronda.
- El servidor de salas admite el Treinta y uno como un juego más en red.
- **Cliente:**
  - el Treinta y uno en el menú, con el número de jugadores en las opciones;
  - una mesa con la mano, el valor de la mano, el mazo, el descarte, las vidas y quién se ha plantado;
  - el resumen de cada ronda con las manos de todos, el fin de partida y la guía «¿Cómo se juega?».
- **Fuera de alcance:**
  - ganar al momento con 31;
  - perder doble al plantarse con la peor mano;
  - la baraja española.

## Capabilities

### New Capabilities
- `juego-treinta-y-uno`: reglas del Treinta y uno:
  - baraja y valor de la mano;
  - reparto;
  - turno: robar y descartar, o plantarse;
  - último turno de los demás y enseñar las manos;
  - vidas y eliminación;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Treinta y uno.
- `niveles-ia`: el Treinta y uno entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye el Treinta y uno con sus opciones, su mesa y su fin de partida.

## Impact

- `packages/engine`:
  - nuevos `juegos/treinta-y-uno.ts`, `ia/treinta-y-uno-basica.ts` e `ia/reconstruir/treinta-y-uno.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nuevas `MesaTreintaYUno.svelte` y `ResumenTreintaYUno.svelte`;
  - cambian el registro de juegos, las opciones, los textos y la guía, la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - la baraja francesa, de 2 a 6 jugadores;
  - tres iguales valen 30,5.
