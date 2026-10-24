## Context

El Gin Rummy es primo del Chinchón: robar del mazo o del descarte, descartar y cerrar cuando las cartas sueltas suman poco. Reutiliza:
- la búsqueda exacta de la mejor agrupación de `chinchon-combinaciones.ts`, que ya maneja grupos y escaleras sobre máscaras de bits;
- las manos encadenadas con `resultadosManos` y un resumen que pausa la sesión (Cuatrola, Ocho loco, Blackjack);
- `porSimulacion` con `candidatas`, `decideLaBase` y `horizonte`, como el Remigio y el Chinchón;
- la mesa del Chinchón como punto de partida (mano, mazo, descarte).

Lo nuevo es la primera carta (quedársela o pasar), colocar cartas en las combinaciones de quien cierra, el undercut, la mano nula y el marcador final con bonos.

## Goals / Non-Goals

**Goals:**
- Gin Rummy clásico de 2 jugadores: cerrar con 10 o menos, Gin y undercut de 25, colocar automático, partida a 100 con bonos.
- IA normal sencilla y difícil por simulación del robo y del descarte.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Big Gin, Oklahoma, más de 2 jugadores, colocar a mano.

## Decisions

### 1. Combinaciones
`chinchon-combinaciones.ts` se generaliza con una baraja más, `francesa52`, con el orden `[1..13]` (As bajo y sin vuelta: Q-K-A no es escalera). `puntosCarta` ya da 10 a los valores 10 y superiores (J, Q y K son 11, 12 y 13). Sin comodines, `mejorReparto` funciona igual con 10 u 11 cartas. Se exporta como `mejorRepartoGin(cartas)` desde `juegos/gin-rummy.ts`, y el tipo de baraja del Chinchón no cambia para sus usuarios (`BarajaChinchon` sigue siendo las dos españolas; el tipo interno amplía a `francesa52`).

### 2. Colocar
`colocar(combinacionesCierre, manoRival)` → `{ combinaciones, sueltas, colocadas, puntos }`:
- Las candidatas a colocar son las cartas del rival del mismo número que un grupo de 3, o del mismo palo que una escalera y a menos de 4 posiciones de uno de sus extremos (las que podrían alargarla en cadena). Son pocas.
- Para cada subconjunto de candidatas se comprueba que se puede colocar entero: los grupos aceptan una carta (como mucho, del número que falta); cada escalera, cartas que formen un tramo seguido desde uno de sus extremos.
- El resto de la mano del rival se agrupa con `mejorReparto`. Se elige el subconjunto que deja menos puntos sueltos; si empatan, el de menos colocadas.

Como mucho son unas decenas de subconjuntos por cierre, así que la búsqueda exacta es barata.

### 3. Estado y acciones
`EstadoGinRummy`:
- `config: { jugadores: 2 }`, `azar`, `repartidor`;
- `mazo`, `descarte` (todo, la de arriba la última), `manos`;
- `fase: 'primera' | 'robar' | 'descartar'`, `turno`, `pasesPrimera` (0 o 1);
- `robadaDelDescarte` (la que no se puede soltar este turno);
- `cogidas: IdCarta[][]`: las cartas que cada jugador cogió del descarte y siguen en su mano (públicas);
- `puntos`, `manosGanadas`, `ultimaAccion`, `resultadosManos`.

Acciones: `robar{desde: 'mazo' | 'descarte'}`, `pasar`, `descartar{carta}` y `cerrar{carta}`.

`accionesLegales`:
- en `primera`: `robar descarte` y `pasar`;
- en `robar`: `robar mazo` y `robar descarte`, salvo justo tras pasar los dos, que solo deja el mazo;
- en `descartar`: `descartar` con cada carta menos `robadaDelDescarte`, y `cerrar` con las que dejan 10 o menos.

Transiciones:
- **`pasar`:** con el primer pase decide el que reparte; con el segundo, el que no reparte pasa a `robar` y solo puede robar del mazo.
- **`robar`:** la carta pasa a la mano; si viene del descarte, se apunta en `robadaDelDescarte` y en `cogidas`.
- **`descartar`:** la carta sale de la mano (y de `cogidas`) al descarte. Si el mazo tiene 2 cartas, la mano es nula y se reparte otra con el mismo repartidor. Si no, el turno pasa al rival en `robar`.
- **`cerrar`:** se descarta la carta, se agrupan las dos manos, se coloca (si no es Gin), se puntúa y se apunta el resultado. Si alguien llega a 100 la partida termina; si no, reparte el otro jugador.

`ResultadoManoGinRummy = { tipo: 'gin' | 'cierre' | 'undercut' | 'nula', cierra: Asiento | null, gana: Asiento | null, puntosMano, manos: { asiento, cartas, combinaciones, sueltas, colocadas, puntos }[], puntosTras, manosGanadasTras }`.

`marcadorFinal(puntos, manosGanadas, ganador)` → `{ puntos, bonoManos, bonoPartida, doble, total }[]`, que usan `resultado` (sus `puntos` son los totales) y la pantalla de fin.

### 4. Vista
- `miMano`, `cartasEnMano`, `mazo` (número), `descarte` (todo), `cogidas` (las de los dos);
- `fase`, `turno`, `pasesPrimera`, `robadaDelDescarte`, `puntos`, `manosGanadas`, `ultimaAccion`, `resultadosManos`.

### 5. IAs
- **Normal** (`iaGinRummyBasica`):
  - **coger el descarte:** si, tras cogerlo y soltar la peor carta, sus puntos sueltos bajan, o si la carta forma una pareja o dos seguidas del mismo palo con alguna suelta; no coge una carta que soltaría enseguida;
  - **descartar:** entre las sueltas de su mejor agrupación, la de más puntos que no forme pareja ni esté junto a otra del mismo palo; si no hay, la suelta de más puntos; nunca una de una combinación si tiene sueltas;
  - **cerrar:** en cuanto puede, con la carta que deja menos puntos.
- **Fácil:** `conErrores` sobre la normal.
- **Difícil:** `porSimulacion(iaGinRummyBasica, SIMULABLE_GIN_RUMMY)`:
  - `decideLaBase` cuando la base cierra;
  - `candidatas`: el robo, o los descartes (sin los cierres);
  - `reconstruir`: la mano del rival lleva sus `cogidas` y el resto, como el mazo, se reparte al azar entre las cartas que no se ven (ni en la mano propia ni en el descarte);
  - `valorar`: los puntos de la mano para el asiento menos los del rival si se cerró; si no, los puntos sueltos del rival menos los propios; más el bono de partida;
  - `horizonte`: 16 jugadas, `reconstrucciones` 12 y `presupuesto` 48, con 4 descartes simulados (los primeros en el orden de la básica).

**Prueba de fuerza:** la difícil gana 129 de 200 partidas a la normal (64,5 %).

### 6. Cliente
- **`MesaGinRummy.svelte`:** parte de la del Chinchón:
  - arriba el rival (dorsos y, a la vista, sus `cogidas`); en el centro el mazo y el descarte; abajo la mano propia ordenada: combinaciones primero (separadas y marcadas), después las sueltas por palo y número, y sus puntos sueltos;
  - en `primera`, tocar el descarte se queda la carta y un botón «Pasar» pasa; tocar (o arrastrar) el mazo o el descarte roba;
  - como en el Chinchón, se elige una carta y aparecen «Descartar» y «Cerrar» (o «¡Gin!» si deja 0), este activo solo si con esa carta se puede cerrar; también se puede arrastrar la carta al descarte.
- **`ResumenGinRummy.svelte`:** entre manos, pausando la sesión: las dos manos destapadas con sus combinaciones, las colocadas marcadas, las sueltas y sus puntos, el tipo de cierre y quién gana cuánto.
- **Pausas:** 600 ms tras cada robo o descarte de la IA.
- **Fin:** el marcador final desglosado y el resumen de la última mano.

## Risks / Trade-offs

- **[Varias agrupaciones con los mismos puntos]** → al cerrar se usa la que da `mejorReparto` para quien cierra, y el rival coloca sobre esas combinaciones. Puede no ser la que más le conviene a quien cierra, pero es determinista.
- **[Fuerza de la difícil]** → las manos son largas y el rival oculto pesa mucho; por eso se limita el horizonte y se simula solo el robo y el descarte.
- **[Tamaño de la mano en el móvil]** → 11 cartas en 360 px se solapan, como en el Chinchón.
