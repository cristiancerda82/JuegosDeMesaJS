## Why

El siguiente juego recomendado de la revisión de los libros es la **Cirulla**, que «Juegos de cartas» presenta como la variante de la Escoba típica de Liguria. Se juega como la Scopa de la suite, con cuatro novedades:
- además de las capturas de la Scopa, se puede capturar sumando 15 con la carta jugada, y el As se lleva toda la mesa (si no hay otro As en ella);
- hay «acuses»: quien recibe tres cartas que suman menos de 10, o tres iguales, las enseña y se anota escobas;
- el 7 de corazones (el 7 de copas con la baraja española) es un comodín para los acuses;
- se cuentan además la cirulla grande y la pequeña: las figuras y las cartas bajas de oros.

## What Changes

- Nuevo juego **Cirulla** para 2 jugadores o 4 en parejas, contra la IA y en red.
  - **Baraja y reparto:** la española de 40 cartas, como la Scopa de la suite. Se ponen 4 cartas en la mesa y se dan 3 a cada uno; cuando todos las han jugado, otras 3, hasta acabar el mazo. Si en la mesa salen dos Ases o más, se vuelve a repartir.
  - **La mesa inicial:** si sus 4 cartas suman 15, el que reparte se las lleva y se anota 1 escoba; si suman 30, 2. El 7 de copas en la mesa vale lo que haga falta para llegar a 15 o a 30.
  - **Acuses:** al recibir sus 3 cartas, quien tiene tres iguales las enseña y se anota 10 escobas; si no, quien suma menos de 10 las enseña y se anota 3. En los acuses, el 7 de copas vale lo que haga falta. Las cartas enseñadas se quedan a la vista hasta que se juegan.
  - **Capturas:**
    - las de la Scopa: una carta del mismo valor o, si no hay ninguna, varias que sumen su valor;
    - además, las cartas que, sumadas a la jugada, dan 15;
    - el As, si en la mesa no hay ningún As, se la lleva entera y hace escoba; si lo hay, captura como las demás cartas;
    - si se puede capturar, hay que hacerlo.
  - **Escobas:** como en la Scopa, dejar la mesa vacía al capturar, salvo en la última jugada de la mano.
  - **Recuento de cada mano:** como en la Scopa (cartas, oros, el 7 de oros, la primera y las escobas), más la **cirulla grande** (la Sota, el Caballo y el Rey de oros juntos: 5 puntos) y la **pequeña** (el As, el 2 y el 3 de oros juntos: 3 puntos, y uno más por cada carta seguida, del 4 al 6).
  - **Partida:** a 51 puntos; si los dos pasan de 51, gana quien tenga más. Quien se lleva los diez oros en una mano gana la partida en el acto.
- **IA de la Cirulla en los tres niveles:**
  - **Normal:** valora cada jugada como la de la Scopa, contando también las cartas de la cirulla grande y la pequeña y el riesgo de dejar la mesa a tiro de un 15 o de un As.
  - **Fácil:** se equivoca a veces.
  - **Difícil:** simula hasta el final de la mano, con las cartas acusadas en la mano de quien las enseñó.
- El servidor de salas admite la Cirulla como un juego más en red.
- **Cliente:**
  - la Cirulla en el menú (familia «Captura»), con las opciones de jugadores y de meta;
  - una mesa de captura común con la Scopa, que sigue mostrando lo mismo: la de la Cirulla añade las cartas acusadas de cada rival, el aviso de los acuses y de la mesa inicial, y la suma que pide cada carta (su valor o el 15);
  - el resumen de cada mano con la cirulla grande y la pequeña;
  - el fin de partida;
  - la guía con sus ejemplos comprobados con el motor y su historia;
  - el consejo del modo asistido.
- **Fuera de alcance:** la Cirulla para 3 jugadores, y el 7 de copas como comodín al capturar (el libro solo lo explica en los acuses y en la mesa inicial).

## Capabilities

### New Capabilities
- `juego-cirulla`: reglas de la Cirulla:
  - baraja, reparto y mesa inicial;
  - acuses;
  - capturas y escobas;
  - recuento de cada mano;
  - fin de la partida;
  - vista del jugador.

### Modified Capabilities
- `ia-jugadores`: se agrega la IA básica de la Cirulla.
- `niveles-ia`: la Cirulla entra en la lista de juegos con tres niveles, con su reconstrucción.
- `mesa-cliente`: el menú incluye la Cirulla con su mesa y su fin de partida.
- `menu-juegos`: la Cirulla entra en la familia «Captura».

## Impact

- `packages/engine`:
  - **Nuevos:** `juegos/cirulla.ts`, `ia/cirulla-basica.ts` e `ia/reconstruir/cirulla.ts`, con sus tests y la suite genérica del contrato.
  - **Scopa:** la Cirulla usa sus funciones de capturas, primera y repartos sin cambiarlas.
  - **Registro:** en `IAS`, en `red.ts`, en la tabla de niveles y en las pruebas de reconstrucción.
- `packages/server`: ningún cambio de código.
- `packages/client`:
  - **Nuevos:** `captura/MesaCaptura.svelte`, común con la Scopa, `MesaCirulla.svelte` y `ResumenCirulla.svelte`.
  - **Cambian:**
    - `MesaScopa.svelte`, que pasa a usar la mesa común;
    - el registro de juegos y las opciones;
    - el catálogo y el modo asistido;
    - los textos y la guía con sus ejemplos;
    - la pantalla de fin y los E2E.
- No hay dependencias nuevas.
- Las reglas son las del libro; donde es ambiguo (el límite de los acuses, el comodín), se sigue la Cirulla de Liguria y se explica en el diseño.
