## Context

En el Julepe de la suite (`juegos/julepe.ts`):
- **Reparto:** cada mano empieza en la fase `decidir`. La última carta del que reparte es la muestra (`cartaTriunfo`) y se queda en su mano.
- **Decidir:** se decide desde la mano hasta el que reparte. El que reparte está obligado a jugar si antes de él juega uno o ninguno; si no juega nadie más, se lleva el bote.
- **Descartar y jugar:** en `descartar` cada uno cambia las cartas que quiera, mientras quede mazo, y en `jugar` se juegan 5 bazas.
- **Cobro (`cerrarMano`):** cada baza vale `boteMano / 5`, y quien no hace 2 paga `boteMano` de julepe.

## Goals / Non-Goals

**Goals:**
- Bailarla y la defensa del bote como dos opciones del mismo juego, con la IA de los tres niveles, en red y en la mesa.
- Que las partidas y salas sin las opciones no cambien.

**Non-Goals:**
- Las demás variantes del Julepe:
  - la viuda o el «tomate» de 3 cartas;
  - que todos estén obligados con una Sota de muestra;
  - el doble del postre de otras reglas.

## Decisions

### 1. Opciones en la config
- **`ConfigJulepe`:** gana `bailarla?: boolean` y `defensa?: boolean`. `crear` las normaliza a `=== true`.

### 2. Bailarla
- **Fase nueva `bailar`:** con la opción, cada mano empieza en `bailar` con el turno del que reparte, si sigue en la partida.
- **Acciones:** `{ tipo: 'bailar' }` y `{ tipo: 'mirar' }`.
  - **`mirar`:** pasa a `decidir` desde la mano, como siempre.
  - **`bailar`:** marca `bailada: true` y `juega[repartidor] = true`, y pasa a `decidir` desde la mano.
- **El repartidor ya ha decidido:** si la bailó, cuando la decisión llega a él no vuelve a decidir: se sigue como tras su decisión (`trasDecidir`).
- **Vista:** durante `bailar`, la `miMano` del que reparte es solo la muestra; `cartasEnMano` sigue diciendo 5. Los demás ven lo de siempre.
- **Cobro:**
  - cada baza del que la bailó vale el doble;
  - se cobra primero a los demás, y lo suyo no pasa de lo que quede en el bote;
  - si no hace 2 bazas, paga `2 × boteMano` de julepe, sin pasar de sus fichas.
  - Si no juega nadie más, se lleva el bote como siempre.
- **Estado:** `bailada?: boolean`, que se borra en cada mano nueva. En el resultado de la mano, `bailada?: true`.

### 3. Defensa del bote
- **Cuándo:** con la opción, si antes del que reparte juega exactamente uno y el que reparte no la bailó, su `jugar` (la única acción legal, como hoy) lo convierte en defensor (`defiende: true`). Al instante recibe la primera carta del mazo.
- **Descarte del defensor:** sus acciones legales son descartar exactamente una carta de sus 6, sin robar. Si suelta la muestra, deja de verse, como en el descarte normal.
- **Cobro:** cobra sus bazas como siempre, y sin 2 bazas no paga julepe.
- **Estado:** `defiende?: boolean`, que se borra en cada mano nueva. En el resultado de la mano, `defensa?: true`.

### 4. Vista
- Siempre llevan `bailada: boolean` y `defiende: boolean`, en `false` sin las opciones, para que la mesa y la IA no tengan que mirar la config.

### 5. IA
- **Normal (`julepe-basica.ts`):**
  - **Fase `bailar`:** la baila si la muestra es un As o un Tres.
  - **Defensor en el descarte:** suelta la peor de sus cartas: la más baja de las que no son triunfo, As ni Tres; si todas lo son, la más baja.
  - **Decidir:** igual que siempre.
- **Reconstrucción:**
  - Cuenta los huecos de la mano propia como `cartasEnMano − miMano`, para el repartidor que aún no ha visto sus cartas. Las que no ve se reparten al azar con la muestra al final.
  - Copia `bailada` y `defiende`.
- **Difícil:** `decideLaBase` incluye la fase `bailar`.

### 6. Cliente
- **Opciones:** casillas «Bailarla» y «Defensa del bote», con su explicación.
- **Mesa:**
  - **Fase `bailar`:** el que reparte tiene los botones «La bailo» y «Miro mis cartas», y en su mano solo ve la muestra.
  - **Avisos:**
    - «Rival 2 la baila» y «Rival 2 mira sus cartas»;
    - en la cabecera, mientras dura la mano, «Rival 2 la baila (cobra doble)» o «Rival 2 defiende el bote».
  - **Descarte del defensor:** «Defiendes el bote: suelta una carta», con una sola carta marcable.
- **Guía:** la línea «En otros sitios…» pasa a «Variantes (opciones «Bailarla» y «Defensa del bote»)…».

## Risks / Trade-offs

- **El cobro doble no sale de ninguna fuente** → se dice en la guía y lo eligió el usuario. Se limita a lo que hay en el bote para que nunca quede en negativo.
- **El defensor con 6 cartas** → la reconstrucción ya usa `cartasEnMano`, así que lo cuenta bien.
- **Una fase más al empezar cada mano** → solo con la opción.
