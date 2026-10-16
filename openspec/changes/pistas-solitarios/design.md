## Context

Los tres solitarios ya tienen deshacer, autocompletar y abandonar como acciones del motor, y sus vistas muestran todo lo que se ve en la mesa:
- **Klondike:** el mazo y el descarte; las columnas, con las cartas ocultas y las visibles; las fundaciones.
- **FreeCell:** las celdas, las fundaciones y las columnas.
- **Spider:** las columnas, con las cartas ocultas y las visibles; el mazo; las escaleras completadas.

Las mesas marcan cada pila con un `data-testid` (`f0`, `c3`, `mazo`, `descarte`…) y cada carta con `data-carta`. Eso basta para resaltar sin tocar la interacción.

## Goals / Non-Goals

**Goals:**
- Una pista heurística, pura e instantánea por solitario, en el motor y con tests.
- Botón «Pista» con resaltado temporal, aviso «No veo ningún movimiento útil» y aviso de atasco en las tres mesas.
- Contar las pistas usadas, guardarlas con la partida y mostrarlas en el fin.

**Non-Goals:**
- Resolutores.
- Rehacer.
- Pistas en los juegos contra la IA.
- Penalizar los récords por usar pistas.

## Decisions

### 1. Pistas en el motor (`ia/pistas.ts`)

```ts
export function pistaKlondike(vista: VistaKlondike, acciones: readonly AccionKlondike[]): AccionKlondike | null;
export function pistaFreeCell(vista: VistaFreeCell, acciones: readonly AccionFreeCell[]): AccionFreeCell | null;
export function pistaSpider(vista: VistaSpider, acciones: readonly AccionSpider[]): AccionSpider | null;
export function atascado(acciones: readonly { tipo: string }[]): boolean;
```

Cada pista puntúa las acciones `mover` legales, descarta las de valor 0 y devuelve la de mayor puntuación. En caso de empate gana la primera en el orden de `accionesLegales`, así que es determinista.

| Movimiento | Klondike | FreeCell | Spider |
|---|---|---|---|
| A una fundación | 100 (+50 si descubre una carta) | 100 | — |
| Descubre una carta boca abajo | 80 | — | 80 |
| Del descarte o de una celda a una columna | 40 | 40 | — |
| Alarga una escalera del mismo palo | — | — | 50 (+80 si además descubre) |
| Vacía una columna de la que salen cartas útiles | 30 | 30 | 40 |
| Entre columnas sin descubrir ni vaciar nada | 0 | 0 | 0 |
| Desde una fundación | 0 | 0 | — |
| Un Rey que ya está al fondo, a una columna vacía | 0 | 0 | 0 |

En el FreeCell, mover a una celda solo puntúa (20) si deja libre una carta que en ese momento puede subir a una fundación.

**Respaldo** si no hay ningún movimiento con puntuación:
- **Klondike:** `robar` si está entre las legales, y si no `reciclar`.
- **Spider:** `repartir` si está entre las legales.
- Si tampoco se puede, `null`.

**Atasco:** `atascado(acciones)` es cierto si no hay ninguna acción legal salvo `deshacer` y `abandonar`. Lo usa la mesa con `sesion.legales`.

### 2. Cliente

- **`Sesion`:** nuevo `pistas = $state(0)` y un método `pedirPista(): A | null`:
  1. calcula la pista con `def.pista`, una función opcional nueva de `DefJuego`;
  2. si hay pista, suma 1 y guarda la partida.

  El guardado gana el campo opcional `pistas`, que al retomar vale 0 si falta.
- **Resaltado:** cada mesa traduce la acción a elementos.
  - Para `mover`, las últimas `cantidad` cartas de la pila de origen y la pila de destino reciben la clase `pista` durante 2,5 s, con una animación de pulso. Respeta `prefers-reduced-motion`: sin pulso, solo el contorno.
  - Para `robar`, `reciclar` o `repartir`, se resalta el mazo.
  - Si se hace cualquier movimiento, el resaltado desaparece.
- **Botón «Pista»** en la barra de cada solitario (`data-testid="pista"`). Sin pista, aparece un aviso breve en la barra: «No veo ningún movimiento útil: prueba a deshacer».
- **Aviso de atasco:** un panel no modal sobre la mesa (`data-testid="atasco"`) con el texto «No quedan movimientos» y los botones Deshacer (si es legal) y Abandonar. Abandonar usa la acción del motor, que ya lleva a la pantalla de fin.
- **Fin:** en los solitarios, una línea «Pistas usadas: N» (`data-testid="pistas-usadas"`).

## Risks / Trade-offs

- **Heurística sin búsqueda:** puede sugerir un movimiento que no lleva a ganar. Es una pista, no la solución, y deshacer está a mano.
- **Robar en bucle en el Klondike con vueltas ilimitadas:** la pista seguirá diciendo «roba». Es correcto, porque robar sigue siendo una jugada. El aviso de atasco solo sale cuando de verdad no hay jugadas.
- **El aviso de atasco puede tapar parte de la mesa en móvil:** va en la parte de abajo, sin velo, para que se siga viendo la mesa.
