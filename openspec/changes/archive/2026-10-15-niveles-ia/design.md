## Context

Cada juego con IA tiene hoy un agente «básico» (`ia/<juego>-basica.ts`) que decide con su vista y sus acciones legales. El cliente lo toma de `DefJuego.ia` y lo usa en todos los asientos de la máquina. El motor es puro, determinista y rápido: una partida completa entre IAs básicas se simula en milisegundos. Eso hace viable una IA por simulación.

La vista de cada juego oculta las cartas ajenas y el mazo, pero muestra todo lo demás:
- lo jugado;
- cuántas cartas tiene cada uno;
- los puntos, el turno y la fase.

## Goals / Non-Goals

**Goals:**
- Tres niveles (fácil, normal y difícil) en los 11 juegos con IA, con las garantías de siempre: legal, reproducible y en menos de 500 ms.
- Un único mecanismo genérico para el fácil (errores) y otro para el difícil (simulación). Lo propio de cada juego es solo la reconstrucción del estado y la valoración de la mano.
- Elegir y recordar el nivel en el cliente, y guardarlo con la partida.

**Non-Goals:**
- IAs específicas «expertas» escritas a mano por juego.
- Que el difícil considere lo que podrían deducir los rivales, más allá de lo que garantiza la reconstrucción coherente.
- Estadísticas por nivel.

## Decisions

### 1. Tipos y agentes genéricos (`ia/niveles.ts`)

```ts
export type NivelIA = 'facil' | 'normal' | 'dificil';
export const NIVELES_IA: readonly NivelIA[] = ['facil', 'normal', 'dificil'];

/** Fácil: con probabilidad `prob` (y si `puedeFallar` lo permite) elige una acción legal al azar. */
export function conErrores<V, A>(base: Agente<V, A>, prob: number, puedeFallar?: (a: A) => boolean): Agente<V, A>;

export interface Simulable<C, E, A, V> {
  readonly juego: Juego<C, E, A, V>;
  /** Un estado completo coherente con la vista: las cartas ocultas, al azar. */
  reconstruir(vista: V, azar: EstadoAzar): E;
  /** La mano empezada en `inicio` ha terminado en `estado` (o la partida). */
  manoTerminada(inicio: E, estado: E): boolean;
  /** Lo bueno que es para `asiento` cómo terminó la mano: lo suyo menos lo de los rivales. */
  valorar(inicio: E, final: E, asiento: Asiento): number;
  /** Reconstrucciones por decisión, como máximo (fijo, para que sea reproducible). */
  readonly reconstrucciones: number;
  /** Partidas simuladas por decisión, como máximo: con muchas acciones, menos reconstrucciones. */
  readonly presupuesto: number;
  /** Jugadas simuladas como máximo tras la acción; sin él, hasta el fin de la mano. */
  readonly horizonte?: number;
}

/** Difícil: simulación con la IA `base` jugando el resto de la mano. */
export function porSimulacion<C, E, A, V>(base: Agente<V, A>, s: Simulable<C, E, A, V>): Agente<V, A>;
```

**Fácil.** Con el generador del agente:
1. Saca un número.
2. Si cae por debajo de `prob` y la acción no está protegida, elige una legal al azar.
3. Si no, delega en la normal.

Se usa `prob = 0.3`. En el Burro, `prob = 0.5` y solo para `pasar`.

**Difícil.**
1. Con una sola acción legal, la elige.
2. Si hay más:
   - calcula la elección de la normal, que gana los empates;
   - repite `reconstrucciones` veces: reconstruye un estado y, para cada acción legal, la aplica y juega el resto de la mano con la `base` en todos los asientos;
   - suma `valorar` por acción;
   - elige la de mayor suma.

Detalles:
- En cada paso de la simulación actúa el primer asiento con acciones legales.
- Los agentes simulados usan azares derivados del azar de la decisión.
- Se pone un tope de pasos por simulación, como salvaguarda.
- Las mismas reconstrucciones se usan para todas las acciones, para comparar en igualdad de condiciones.

### 2. Reconstrucción por juego (`ia/reconstruir/<juego>.ts`)

Cada juego exporta una función `reconstruir<Juego>(vista, azar)`:
1. Calcula las cartas desconocidas: la baraja del juego menos las visibles (mano propia, mesa, bazas y descartes vistos, muestra, cartas enseñadas…).
2. Las baraja con el azar.
3. Las reparte entre los sitios ocultos, respetando los tamaños que la vista da: `cartasEnMano`, cartas en el mazo, etc.
4. Copia de la vista todo lo público: turno, fase, puntos, resultados, configuración…
5. Rellena con un valor neutro lo que no afecta a la mano en curso, como el azar del juego para las manos siguientes.

Cuando a una vista le falte algo público que el estado necesita, se añade a la vista: una tarea por juego lo comprueba.

**Test genérico** (`test/contrato/verificar-reconstruccion.ts`). Juega partidas al azar y, en cada estado y para cada asiento con vista, comprueba:
- `vistaDe(reconstruir(vista), asiento)` es igual a `vista`;
- las acciones legales de ese asiento son las mismas;
- el estado reconstruido se puede jugar hasta el final con IAs básicas.

### 3. Valoración y fin de mano por juego

Usan lo que cada estado ya registra (`resultadosManos`, puntos, fichas o piedras):
- **Bazas (Brisca, Tute, Guiñote):** puntos de la mano del bando propio menos los del rival.
- **Pocha:** puntos de la mano propios menos la media de los demás.
- **Corazones:** puntos de la mano de los demás (media) menos los propios, porque los puntos son malos.
- **Escoba:** puntos de la mano propios menos los del rival.
- **Chinchón y Cinquillo:** penalización media de los rivales menos la propia (más −50 al propio si queda eliminado en el Chinchón).
- **Siete y media:** fichas ganadas en la mano.
- **Mus:** piedras de la mano de la pareja propia menos las de la rival.

Si la partida termina dentro de la simulación, se suma un extra grande a favor o en contra según quién gana, para preferir ganar la partida a ganar puntos.

### 4. Registro de IAs (`ia/ias.ts`)

```ts
export const IAS = {
  brisca: { facil: …, normal: iaBriscaBasica, dificil: … },
  // …
} satisfies Record<string, Record<NivelIA, Agente<any, any>>>;
```

Las IAs de cada nivel se construyen una vez y se exportan desde `index.ts`.

**Calibración.** Las reconstrucciones y el presupuesto se calibran por juego para que la decisión más lenta, medida en los tests, quede por debajo de 250 ms en escritorio y deje margen para el móvil:
- se hacen `min(reconstrucciones, presupuesto / acciones)` reconstrucciones por decisión;
- si salen menos de 2, decide la normal, como en el pase de 3 cartas de los Corazones (286 combinaciones);
- el Chinchón simula 16 jugadas como máximo y valora las manos con su mejor reparto en ese punto.

| Juego | Reconstrucciones | Presupuesto |
|---|---|---|
| Brisca | 40 | 160 |
| Tute | 24 | 200 |
| Guiñote | 30 | 180 |
| Escoba | 20 | 120 |
| Chinchón | 12 | 100 |
| Siete y media | 40 | 400 |
| Cinquillo | 30 | 150 |
| Pocha | 24 | 200 |
| Mus | 12 | 150 |
| Corazones | 24 | 200 |

**Datos añadidos a las vistas** (públicos; ningún spec de juego los prohíbe):
- `jugadas` (cartas ya jugadas en bazas de la mano): Brisca, Tute, Guiñote, Pocha y Corazones;
- `puntos` de las bazas: Brisca, Tute y Guiñote;
- `puedeCantar`: Tute y Guiñote;
- `hablados` y `cartasDescartadas` (solo el número): Mus.

La Escoba no los gana: su spec prohíbe mostrar qué cartas ha recogido cada bando, así que la reconstrucción reparte las recogidas al azar. Eso hace que su IA difícil juegue como quien no lleva la cuenta. En el Mus, la reconstrucción repite las manos ajenas (hasta 200 veces) hasta que cuadran con lo declarado de pares y juego.

### 5. Cliente

- **`DefJuego.ia`:** pasa a `Record<NivelIA, Agente<V, A>> | null`.
- **`Sesion`:** recibe el `nivel` (en `nueva` y en `desdeGuardado`) y usa `def.ia[nivel]`. `simultaneo.esperaIA(vista, accion, g, nivel)` lo recibe también.
- **Retrasos del Burro para plantarse (ms):**

  | Nivel | Primero | Reacción |
  |---|---|---|
  | Fácil | 2.500–5.000 | 2.000–5.000 |
  | Normal | 1.500–4.000 | 1.000–3.500 |
  | Difícil | 900–2.500 | 600–2.000 |

- **`Guardado`:** campo opcional `nivel`. Si falta, `normal`. Sigue siendo la versión 1, porque es compatible.
- **`Opciones.svelte`:**
  - fieldset «Nivel de la IA» con tres radios, solo si `JUEGOS[juego].ia !== null`;
  - el valor inicial se lee de `localStorage` (`juegos-de-mesa/nivel/<juego>`, tolerante a fallos) y se guarda al empezar;
  - `empezar(config, nivel)`.
- **`App` y `partida.ts`:** `nuevaPartida(id, config, nivel)`. La revancha conserva el nivel.

### 6. Tests de fuerza

Los enfrentamientos difícil contra normal (200 partidas por juego) tardan minutos, así que van en `test/ia/fuerza.test.ts` con `describe.runIf(process.env.FUERZA)`. Se ejecutan en la verificación final con `FUERZA=1`. Los de normal contra fácil son rápidos y van siempre.

## Risks / Trade-offs

- **Reconstrucciones uniformes:** no tienen en cuenta deducciones como «no siguió el palo, luego no tiene». Es una mejora posible, que deja la IA algo más floja pero correcta.
- **La simulación con la IA normal juega los rivales «como la normal»:** el difícil explota los errores de la normal, que es justo contra quien se mide. Contra humanos sigue siendo mejor que la normal, pero no perfecto.
- **Tiempo en móvil:** se calibra con margen (250 ms en escritorio). Si un juego no llega, se bajan sus reconstrucciones.
- **Puede que en algún juego el difícil no supere a la normal** (por ejemplo, donde la heurística ya es buena o la mano es casi de azar, como la Siete y media). Se ajustan la valoración o las reconstrucciones. Si aun así no se consigue, se avisa al usuario antes de rebajar el requisito.
- **Tamaño del change:** son 10 reconstrucciones distintas. Las tareas van juego a juego, cada una con su test de reconstrucción.
