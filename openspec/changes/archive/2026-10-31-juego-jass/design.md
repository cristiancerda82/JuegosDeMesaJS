## Context

El Schieber es un juego de bazas por parejas como la Sueca y la Belote, con cuatro diferencias:
- **Elección:** antes de las bazas hay una elección del modo con schieben.
- **Orden y puntos:** cambian con el modo.
- **Bazas:** siempre se puede fallar, sin subfallar y con la excepción del Buur.
- **Puntos:** se anotan en el momento en que se ganan, porque la partida puede terminar en mitad de una mano.

Se reaprovecha el modelo de la Sueca: el motor de bazas, la reconstrucción y la mesa.

## Goals / Non-Goals

**Goals:**
- Schieber de 4 en parejas a 1.000 puntos con los seis modos, schieben, Weis automáticos, Stöck y multiplicadores; con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Las cartas suizas, el Slalom, declarar a mano y bedanken a mano.

## Decisions

### 1. Cartas (`juegos/jass.ts`)
- **Baraja:** `BARAJA_JASS`: la francesa de 52 del 6 al As.
- **Modo:** `ModoJass` = `PaloFrances | 'obenabe' | 'undenufe'`, y `MULTIPLICADOR_JASS` por modo.
- **Rango (`rangoJass(carta, modo)`):** un número para comparar dentro del mismo palo.
  - En el triunfo: J 20, 9 19, A 18, K 17, Q 16, 10 15, 8 14, 7 13 y 6 12.
  - En los demás palos y en Obenabe, el valor natural (A 14 … 6 6).
  - En Undenufe, el inverso.
- **Puntos:** `puntosCartaJass(carta, modo)`, con las tablas de la spec.
- **Ganadora:** `ganadoraJass(mesa, modo)`: el triunfo más alto o la más alta del palo de salida.
- **Legales:** `cartasLegalesJass(mano, mesa, modo)`, con las reglas de la spec: seguir o fallar, el Buur y no subfallar.

### 2. Declaraciones
- **Cálculo:** `weisJass(mano)` da las escaleras (tramos máximos de 3 o más por palo, en el orden natural) y los cuatro iguales del 9, el 10, la J, la Q, la K o el A, con sus puntos y cartas. Una carta puede estar a la vez en una escalera y en cuatro iguales.
- **Comparación:** `mejorWeisJass(manos, salida, modo)` compara la mejor declaración de cada jugador por (puntos, cartas, carta más alta, del triunfo, orden desde quien sale) y da la pareja que anota, o ninguna si nadie declara.

### 3. Estado
- **Config:** `{ jugadores: 4, meta: 1000 }` (`META_JASS`). El cliente siempre juega a 1.000; las pruebas usan metas más bajas para que las partidas sean cortas.
- **Fases:** `fase` (`'eleccion'` o `'bazas'`), `repartidor`, `elige` (quien tenía la elección), `pasado` (si ha pasado) y `modo`.
- **Cartas:** `manos`, `manosIniciales` (para el Weis y el Stöck), `mesa`, `ultimaBaza`, `turno` y `bazasGanadas` por pareja.
- **Puntos:**
  - `weis`: las declaraciones ganadoras con su pareja, `null` hasta la primera baza;
  - `stock`: el asiento que lo anotó, si alguno;
  - `puntosMano` por pareja, ya multiplicados;
  - `porConcepto`: bazas, declaraciones y Stöck por pareja;
  - `puntos` de la partida;
  - `resultadosManos`.
- **Otros:** `azar`.

### 4. Acciones
- **`elegir { modo }`:** en la elección; se puede elegir cualquier modo.
- **`pasar`:** solo si aún no se ha pasado. La elección pasa al compañero.
- **`jugar { carta }`:** en las bazas, con las legales.

### 5. Anotación
- **`anotar(estado, pareja, puntos)`:** suma a la mano y a la partida, y si la pareja llega a 1.000, cierra la mano en el acto: guarda el resultado de la mano a medias y termina la partida.
- **Orden de los eventos:**
  - el Stöck se anota al jugar la segunda carta, antes de resolver la baza;
  - al acabar la primera baza, primero las declaraciones y luego la baza;
  - al acabar la novena, la baza con los 5 de la última y, si es Match, los 100 de más.
- **Fin de la mano:** si nadie ha llegado, se guarda el resultado y se reparte con el siguiente repartidor.

### 6. Resultado y vista
- **Resultado:** ganan los dos asientos de la pareja que llegó; los `puntos` del `Fin` son los de la pareja de cada asiento.
- **Vista:**
  - lo de la spec;
  - `misWeis`: las declaraciones propias, calculadas con la mano inicial;
  - `jugadasPor`: las cartas que ha jugado cada uno en la mano, para reconstruir (también las manos del reparto, que hacen falta para el Stöck).

### 7. IAs
- **Normal (`ia/jass-basica.ts`):** las reglas de la spec.
  - **«Carta más alta que queda»:** la más alta del palo, en el orden del modo, entre las que no se han jugado.
  - **«Sin gastar un triunfo»:** se prefieren las cartas que no son triunfo.
- **Difícil (`ia/reconstruir/jass.ts`):** `SIMULABLE_JASS`.
  - **Qué decide la normal:** la elección (`decideLaBase` en la fase `'eleccion'`).
  - **Reconstrucción:** como en la Sueca, con las restricciones de niveles-ia:
    - los palos que no se siguieron sin fallar;
    - el triunfo que no se echó (solo puede quedar el Buur);
    - las cartas de las declaraciones ganadoras.
  - **Valoración:** la diferencia de puntos de la mano entre parejas, entre 50, más `bonoPartida` si la partida acaba.
  - **Valores:** `reconstrucciones` 12 y `presupuesto` 80, como en la Sueca. La difícil gana a la normal 136 de 200 partidas (a 300 puntos) y decide en 98 ms como máximo; la normal gana 168 de 200 a una pareja que juega al azar.

### 8. Cliente
- **`MesaJass.svelte`:** como `MesaSueca`, sobre `MesaBazas`.
  - **Elección:** botones `modo-{modo}` y `pasar`.
  - **Barra de información:** el modo con su multiplicador (`modo-jass`), los puntos de la mano y de la partida, y las declaraciones ganadoras (`weis`) y el Stöck (`stock`) cuando se anotan.
- **`ResumenJass.svelte`:** por pareja, las declaraciones, el Stöck, las bazas, el total de la mano y los puntos de la partida.
- **Fin:** juego por parejas, en la rama de parejas de `Fin.svelte`, con los puntos de cada pareja.

## Risks / Trade-offs

- **[Fin en mitad de la mano]** → El resumen de esa mano sale incompleto; se muestra igual, porque explica por qué ha terminado.
- **[Weis automáticos]** → Enseñar las declaraciones ganadoras da información a los rivales, como en el juego real; la reconstrucción la usa.
