## Why

El siguiente juego recomendado de la revisión de los libros es **Los cuatro seises**, que describe Núñez Elvira como un juego «simple», muy jugado en familia. Hay que quedarse antes que nadie sin cartas, colocándolas en cuatro escaleras, una por palo, que nacen de los seises.

Se parece al Cinquillo de la suite, pero cambia en cuatro cosas:
- las escaleras nacen del 6, no del 5, y abre el 6 de oros;
- se juega de 4 a 8, repartiendo toda la baraja: la de 40 cartas o la de 48, con los ochos y los nueves;
- no se cuentan las cartas que quedan: hay un fondo en el que todos ponen al empezar y en el que paga quien pasa, y se lo lleva entero quien se queda antes sin cartas;
- el libro aconseja guardar los seises para bloquear a los demás, sin bloquearse a uno mismo.

## What Changes

- Nuevo juego **Cuatro seises** para 4, 5, 6 u 8 jugadores, cada uno contra los demás, contra la IA y en red.
  - **Reparto:** toda la baraja, de una en una. Con la de 40, de 4, 5 u 8 jugadores; con la de 48, de 4, 6 u 8: siempre el mismo número de cartas para todos, como pide el libro.
  - **Jugadas:** abre quien tiene el 6 de oros. Después, cada uno en su turno pone una carta que alargue una escalera por arriba o por abajo, o un 6 que abra otro palo. Si no puede, pasa. Si puede, tiene que jugar.
  - **Orden de las escaleras:** As, 2… 7, Sota, Caballo y Rey con la de 40; con la de 48, también el 8 y el 9 entre el 7 y la Sota.
  - **El fondo:** al empezar cada mano, cada jugador pone 1 ficha; cada vez que alguien pasa, pone otra. Quien se queda antes sin cartas se lleva el fondo entero.
  - **Partida:** de 3 manos (o de 1 o 5, en las opciones). Gana quien acaba con más fichas.
- **IA del Cuatro seises en los tres niveles:**
  - **Normal:** la heurística del Cinquillo, que pasa a ser común sin cambiar lo que decide: prefiere las cartas que acercan las suyas y no abren camino a los demás, y por eso guarda los seises que no le hacen falta.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula cada jugada hasta el final de la mano.
- El servidor de salas admite el Cuatro seises como un juego más en red.
- **Cliente:**
  - el Cuatro seises en el menú (familia «Descarte»), con las opciones de la baraja, los jugadores y las manos;
  - una mesa con las cuatro escaleras, el fondo y las fichas de cada uno; la del Cinquillo pasa a ser común sin cambiar lo que muestra;
  - el resumen de cada mano con quién se lleva el fondo y lo que ha pagado cada uno;
  - el fin de partida con la clasificación;
  - la guía con sus ejemplos comprobados con el motor y su historia;
  - el consejo del modo asistido.
- **Fuera de alcance:** otras cantidades de fichas para el fondo y la partida sin fin del libro.

## Capabilities

### New Capabilities
- `juego-cuatro-seises`: reglas del Cuatro seises:
  - barajas, jugadores y reparto;
  - jugadas y escaleras;
  - el fondo;
  - fin de la mano y de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica del Cuatro seises.
- `niveles-ia`: el Cuatro seises entra en la lista de juegos con tres niveles.
- `mesa-cliente`: el menú incluye el Cuatro seises con su mesa y su fin de partida.
- `menu-juegos`: el Cuatro seises entra en la familia «Descarte».

## Impact

- `packages/engine`:
  - **Nuevos:** `juegos/cuatro-seises.ts`, `ia/cuatro-seises-basica.ts` e `ia/reconstruir/cuatro-seises.ts`, con sus tests y la suite genérica del contrato.
  - **Cinquillo:** la regla de encajar una carta en las escaleras y la heurística de su IA pasan a ser comunes, con el orden y la carta de la que nacen como parámetros. El Cinquillo no cambia.
  - **Registro:** en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - **Nuevos:** `MesaEscaleras.svelte`, común con el Cinquillo, y `MesaCuatroSeises.svelte`.
  - **Cambian:**
    - `MesaCinquillo.svelte`, que pasa a usar la mesa común;
    - el registro de juegos y las opciones;
    - el catálogo y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los E2E.
- No hay dependencias nuevas.
- Las reglas son las de Núñez Elvira; el número de manos y el valor de 1 ficha sustituyen a la partida sin meta y a las cantidades acordadas del libro.
