## Context

El Culo es un juego de descartes por escalada con la baraja española de 40. Reutiliza:
- la baraja española, `barajar` y el azar del estado;
- las manos encadenadas con `resultadosManos` y un resumen que pausa la sesión (como el Rummy 500 o el Texas Hold'em);
- `conErrores` para la fácil, `porSimulacion` con un `Simulable` y `Ocultas` para la reconstrucción;
- el registro en `IAS`, `red.ts`, la tabla de niveles y las pruebas de reconstrucción.

Lo nuevo es:
- las rondas con pases que no te sacan;
- el corte con doses;
- los puestos con cargos;
- el intercambio de cartas entre manos, con información que solo ven los que se cambian.

## Goals / Non-Goals

**Goals:**
- Culo de 3 a 6 con 5 manos, intercambio y puntos por puesto.
- IA normal por reglas sencillas y difícil por simulación que le gane.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Saltos, revolución, comodines, baraja francesa y número de manos configurable.

## Decisions

### 1. Rango de las cartas
`rangoCulo(carta)` da 0 al 3 y 9 al 2: `[3,4,5,6,7,10,11,12,1,2]` indexado por valor. Todas las comparaciones van por rango.

### 2. Estado (`juegos/culo.ts`)
- `manos`, `turno`, `fase: 'intercambio' | 'juego'`.
- `mesa`: la jugada que hay que superar (`{ asiento, cartas } | null`).
- `pasesSeguidos`: cuántos jugadores han pasado desde esa jugada.
- `pasados`: quiénes han pasado desde ella, para la vista.
- `salidos`: asientos en orden de salida.
- `jugadas`: todas las de la mano, para la vista y la reconstrucción.
- `mano`: número de mano, de 1 a 5.
- `cargos`: puestos de la mano anterior, o `null` en la primera.
- `intercambio`: lo que se dio y se recibió en la mano. Contiene, por pareja (presidente/culo, vicepresidente/viceculo), las cartas que se dieron solas y las devueltas, y quién tiene que devolver ahora.
- `puntos`, `resultadosManos`.

Las acciones son:
- `{ tipo: 'jugar', cartas }`;
- `{ tipo: 'pasar' }`;
- `{ tipo: 'devolver', cartas }`.

`accionesLegales` enumera todas las combinaciones de cartas de un mismo valor del tamaño que toca (al abrir, de 1 a 4). Son como mucho 15 por valor, así que no hace falta un sistema de marcas como en el Mentiroso. Las de `devolver` son todas las combinaciones de 2 (o 1) cartas de la mano: como mucho C(14, 2) = 91.

### 3. Ciclo de la ronda
- **Al jugar:** se quitan las cartas, se anotan en `jugadas` y, si la mano queda vacía, el jugador entra en `salidos`.
  - Si son doses, la ronda se limpia (`mesa = null`) y abre el mismo jugador, o el siguiente activo si ha salido.
  - Si no, `mesa` pasa a ser la jugada, `pasesSeguidos = 0` y el turno va al siguiente activo.
- **Al pasar:** `pasesSeguidos++`. Si llega al número de activos que no son el autor de la jugada, la ronda se limpia y abre el autor, o el siguiente activo después de él si ha salido.
- **Fin de la mano:** cuando queda un activo, entra el último en `salidos` y se cierra la mano. Se calculan los cargos y los puntos y se guarda el `ResultadoManoCulo`. Si quedan manos, se reparte la siguiente y se hace el intercambio automático de las mejores cartas. La fase queda en `intercambio`, con el turno al presidente; tras devolver él, al vicepresidente si lo hay; después, `juego` con el turno al culo.

Como en el Rummy 500, la mano nueva se reparte en la misma transición que cierra la anterior. El cliente detiene la sesión con el resumen al ver un `resultadosManos` más largo.

### 4. Vista
- La vista da `misCartasDadas` y `misCartasRecibidas`, solo a los que participan en el intercambio.
- En el intercambio, el presidente ve qué recibió y elige qué devolver; los demás ven solo quién debe devolver.
- El contrato de cartas ocultas lista como ocultas las manos ajenas.

### 5. Reconstrucción (`ia/reconstruir/culo.ts`)
- Primero se quitan de las cartas no vistas las que el asiento dio en el intercambio y no han aparecido en `jugadas`. Esas se colocan en la mano del que las recibió.
- El resto se reparte con `Ocultas` en las manos ajenas, respetando cuántas cartas tiene cada una.
- En la fase de intercambio, quien aún debe devolver tiene su mano de la vista (si es el asiento) o al azar.

### 6. IAs (`ia/culo-basica.ts`)
- **Normal:** las reglas de la spec, agrupando la mano por rango.
- **Difícil:** `niveles(iaCuloBasica, SIMULABLE_CULO)`.
  - `candidatas` deja una jugada por cada (valor, número de cartas), más pasar.
  - `decideLaBase` en la fase de intercambio.
  - `valorar` usa los puntos del puesto en la mano (N − 1 − posición) más un poco por las cartas que le quedan a los demás si la mano no ha terminado.
  - Sin `horizonte`, porque las manos son cortas: como mucho 14 cartas.
  - `reconstrucciones` 16 y `presupuesto` 96. Con ellos, la difícil gana 88 de 200 partidas de 4 a la normal (el 44 %, frente al 25 % que le tocaría) y decide en menos de 70 ms; la normal gana 97 de 200 a la fácil.

### 7. Cliente
- **`MesaCulo.svelte`:**
  - arriba, los rivales en fila, cada uno con su número de cartas, su cargo, «Pasa» y su puesto si ha salido;
  - en el centro, la jugada a superar, en abanico, con su autor, y la mano «Mano 2 de 5»;
  - abajo, la mano ordenada por rango con selección y los botones `jugar`, `pasar` y, en el intercambio, `devolver`.
  - Cuando hay una jugada que superar, la marca automática de cartas iguales se hace en el cliente.
- **`ResumenCulo.svelte`:** la tabla del orden de salida, con el cargo, los puntos de la mano y el total.
- **Fin:** la clasificación con los puntos.
- **Textos:** van en `T.culo`, con la guía.

## Risks / Trade-offs

- **[Las jugadas de varias cartas son muchas]** → El motor las enumera todas para que cualquier selección del jugador sea legal tal cual. La IA difícil solo simula una por valor y número.
- **[La simulación puede no sacar ventaja si el reparto es muy desigual]** → Primero se mide la fuerza; si no llega, se ajusta la valoración o el presupuesto y se anota aquí.
- **[Información del intercambio]** → El que recibe las mejores cartas sabe que el culo no tiene nada más alto que ellas. La reconstrucción no lo usa, porque la spec no lo exige; queda como mejora.
