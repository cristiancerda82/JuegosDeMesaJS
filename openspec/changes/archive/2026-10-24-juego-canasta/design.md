## Context

La Canasta comparte mucho con el Pinacle:
- las 108 cartas (`cartasPinacle`, con identificadores `palo-valor#copia`);
- las combinaciones de la pareja;
- el montón abierto con las cartas que cada uno se llevó;
- la mesa de 4 en parejas;
- el difícil que simula solo robar y descartar.

Lo nuevo es:
- las combinaciones solo por valor (sin escaleras);
- los comodines limitados a tres por combinación;
- las canastas de 7;
- el pozo congelado o tapado;
- los treses rojos y negros;
- la primera bajada con mínimo según el marcador.

## Goals / Non-Goals

**Goals:**
- Canasta clásica de 4 en parejas a 5.000 con el pozo clásico.
- Enumerar las acciones legales en un número manejable, para la IA y para la suite del contrato.
- IA normal por reglas y difícil por simulación que le gane.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Pedir permiso para cerrar, el cierre escondido, otras cantidades de jugadores y la obligación de llevarse el pozo al final del mazo.

## Decisions

### 1. Cartas y valores (`juegos/canasta.ts`)
- **Cartas:** se reutilizan `cartasPinacle()` y `basePinacle()`. El rango va del 4 al As, con el As alto; los comodines son los jokers y los doses.
- **Valores:** `puntosCanasta(carta)` da el valor de cada carta.
- **Mano:** se ordena por rango, después los doses, los jokers y los treses negros, y dentro de cada valor por palo y copia.

### 2. Acciones canónicas
Los palos no cuentan, así que una jugada se define por su **firma**: el valor, cuántos naturales, cuántos jokers y cuántos doses. `accionesLegales` enumera una acción por firma, con las primeras cartas de cada tipo en el orden de la mano. El cliente busca la acción con la misma firma que las cartas marcadas. Las acciones son:
- `robar`;
- `tomarPozo { cartas, combinacion }`: las cartas de la mano que acompañan a la de arriba, o `combinacion` si se añade a una de la pareja;
- `bajar { cartas }`: una combinación nueva;
- `anadir { combinacion, cartas }`;
- `deshacer`: solo en la primera bajada, mientras no llega al mínimo;
- `descartar { carta }`: una por cada carta distinta de la mano (base sin copia);
- `acabar`: con el mazo vacío, renunciar a llevarse el pozo.

Así, por valor hay como mucho unas decenas de firmas.

### 3. Estado
- **Por asiento:** `manos`, `conocidas` (lo que cada uno se llevó del pozo y sigue en su mano).
- **Mesa:** `mazo`, `pozo`, `congelado` (hay un comodín en el pozo), `combinaciones` (con `bando`, `rango` y `cartas`), `siguienteId`.
- **Por bando:** `treses` (los treses rojos), `abierto` (ya ha bajado en la mano).
- **Turno:** `turno`, `fase: 'robar' | 'bajar'`.
- **Primera bajada:** `apertura`, mientras el bando del jugador en turno no ha llegado al mínimo. Guarda:
  - la mano y las combinaciones al empezar a bajar, para `deshacer`;
  - las cartas del pozo `bloqueadas`;
  - la combinación del pozo, que no se deshace.
- **Partida:** `puntos`, `puntosInicioMano`, `ultimaAccion`, `resultadosManos`.

`abierto` se fija al llegar al mínimo. Con `apertura`, `descartar` no es legal hasta llegar a él.

### 4. Llevarse el pozo para la primera bajada
`tomarPozo` es legal en la primera bajada solo si la carta de arriba, sus cartas y la mejor bajada posible con el resto de la mano llegan al mínimo. La cota se calcula con una búsqueda voraz por valor. Si la cota dice que no llega, no hay acción; si dice que sí, siempre hay un camino, así que el jugador nunca se queda bloqueado.

### 5. Cerrar
Una acción que deja la mano con 0 cartas cierra la mano. Sin canasta del bando tras la acción, `bajar`, `anadir` y `tomarPozo` no son legales si dejan menos de 2 cartas, y `descartar` no lo es con la última carta. Con el mazo vacío en la fase de robar:
- si se puede llevar el pozo, las acciones son esas más `acabar`;
- si no, la mano se cierra sola en la transición anterior.

Esto lo resuelve `cerrarSiBloqueada` tras cada transición.

### 6. Puntuación
`puntuarManoCanasta` devuelve el desglose por bando:
- `cartas`: el valor de lo bajado;
- `canastas`: limpias × 500 + sucias × 300;
- `treses`: ±100 cada uno, 800 los cuatro;
- `cierre`: 100;
- `mano`: lo que queda en las manos, que resta;
- `total`.

### 7. IAs
- **Normal (`ia/canasta-basica.ts`):** las reglas de la spec. En la primera bajada, calcula un plan con la misma búsqueda voraz del punto 4 y lo ejecuta acción a acción.
- **Difícil (`ia/reconstruir/canasta.ts`):** `SIMULABLE_CANASTA`, al estilo del Pinacle y el Rummy 500.
  - `candidatas`: robar o llevarse el pozo; y en el descarte, los 4 mejores según la normal.
  - `valorar`: la puntuación de la mano si se cerró. Si no, el valor de lo bajado más las canastas (y media canasta por cada combinación de 5 o 6) menos lo que queda en la mano, por bando.
  - `horizonte` 12, `reconstrucciones` 8 y `presupuesto` 32. Con un pozo de 10 cartas o más, o alguna mano de más de 16, decide la normal: con 12 y 20 una decisión llegaba a 311 ms. Así, la difícil gana 114 de 200 partidas a la normal (el 57 %, frente al 50 % por parejas) y decide en menos de 110 ms; la normal gana 166 de 200 a la fácil.
  - **Reconstrucción:** las manos ajenas y el mazo salen al azar de las cartas que no se ven, respetando `conocidas`.

### 8. Cliente
- **`MesaCanasta.svelte`:** parte de la del Pinacle, con el pozo, las combinaciones por pareja con las canastas y sus treses rojos, y los botones `robar`, `coger-pozo`, `bajar`, `anadir-{id}` (al tocar la combinación), `deshacer`, `descartar` y `acabar`.
- **`ResumenCanasta.svelte`:** el desglose por pareja.
- **Fin:** el último resumen y el marcador.
- **Textos:** en `T.canasta` y la guía.

## Risks / Trade-offs

- **[El número de acciones en la primera bajada]** → Se baja combinación a combinación con `deshacer`, en vez de enumerar conjuntos de combinaciones.
- **[Rendimiento de la simulación con manos grandes tras llevarse el pozo]** → Un horizonte corto y pocas reconstrucciones. Si aun así no cabe en el tiempo, se decide como la normal con un pozo de 10 cartas o más o con manos de más de 16, igual que en el Pinacle.
- **[Las cartas que se bajan pueden no ser las que se tocaron]** → Los palos no cuentan en la Canasta. El cliente marca las que se van a bajar según la firma.
