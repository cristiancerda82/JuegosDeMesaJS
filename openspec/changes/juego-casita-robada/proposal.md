## Why

La Casita robada es el juego de captura con el que muchos niños aprenden a jugar a las cartas con la baraja española. Las reglas se explican en un minuto: llevarse las cartas del mismo número y, sobre todo, robar el montón de otro. La partida es corta y tiene la emoción de que tu casita puede cambiar de manos de una jugada a otra.

La familia «Captura» tiene 6 juegos, pero todos piden sumar o contar puntos (Escoba, Scopa, Casino, Cuarenta), o son de baraja francesa (Pishti, Pesca). Falta uno sencillo de baraja española para los más pequeños.

## What Changes

- Nuevo juego **Casita robada** para 2 a 4 jugadores, cada uno por su cuenta, jugable contra la IA y en red.
  - **Baraja:** la española de 40 cartas.
  - **Reparto:** 4 cartas boca arriba en la mesa y 3 a cada jugador. Cuando todos se quedan sin cartas, se reparten otras 3 a cada uno hasta acabar el mazo.
  - **Jugar:** en su turno, cada uno juega una carta.
    - Se lleva todas las cartas de la mesa del mismo número.
    - Puede robar la casita de un rival cuya carta de arriba sea de ese número.
    - Lo que se lleva va a su casita, con la carta jugada arriba, a la vista de todos.
    - Si no se lleva nada, la carta se queda en la mesa.
  - **Fin:** al acabar el mazo y las manos, lo que queda en la mesa es para el último que se llevó cartas. Gana quien tiene más cartas en su casita; puede haber varios ganadores empatados.
- **IA de la Casita robada en los tres niveles:**
  - **Normal:** roba la casita más grande que puede; si no, se lleva todas las cartas que puede; si no, deja en la mesa la carta que menos le sirve a los demás.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada jugada hasta el final de la partida.
- El servidor de salas admite la Casita robada como un juego más en red.
- **Cliente:**
  - la Casita robada en el menú (familia «Captura»), con el número de jugadores;
  - una mesa con:
    - las cartas de la mesa;
    - la casita de cada uno, con su carta de arriba y cuántas tiene;
    - elegir a quién robar cuando se puede;
  - la pantalla de fin, la guía «¿Cómo se juega?» con sus ejemplos y su historia, y el consejo del modo asistido.
- **Fuera de alcance:**
  - partidas a varias manos o a puntos;
  - parejas con 4 jugadores;
  - variantes con suma de cartas.

## Capabilities

### New Capabilities
- `juego-casita-robada`: reglas de la Casita robada:
  - baraja y reparto;
  - jugar, capturar y robar casitas;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Casita robada.
- `niveles-ia`: la Casita robada entra en la lista de juegos con tres niveles, con su reconstrucción de las cartas ocultas y su difícil por simulación.
- `mesa-cliente`: el menú incluye la Casita robada con su mesa y su fin de partida.
- `menu-juegos`: la Casita robada entra en la familia «Captura».

## Impact

- `packages/engine`:
  - nuevos `juegos/casita-robada.ts`, `ia/casita-robada-basica.ts` e `ia/reconstruir/casita-robada.ts`, con sus tests y la suite genérica del contrato;
  - se registra en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - nueva `MesaCasitaRobada.svelte`;
  - cambian:
    - el registro de juegos y las opciones;
    - el catálogo del menú y el modo asistido;
    - los textos y la guía con sus ejemplos y su historia;
    - la pantalla de fin y los tests E2E.
- No hay dependencias nuevas.
- Las reglas las ha elegido el usuario:
  - 3 cartas por reparto;
  - llevarse todas las cartas del mismo número;
  - las que quedan en la mesa, para el último que se llevó cartas.
