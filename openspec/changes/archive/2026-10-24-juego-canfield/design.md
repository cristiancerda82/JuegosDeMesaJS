## Context

El Canfield es el Klondike con reserva, base y vuelta. Reutiliza:
- la estructura de `klondike.ts`: mazo y descarte con robo de 1 o 3 y reciclado, columnas, fundaciones, historial para deshacer, `movimientos` y `abandonada`;
- la pista por puntos de `ia/pistas.ts` y `atascado`;
- los récords de tiempo y movimientos de las estadísticas, que no necesitan cambios;
- la mesa del Klondike (`MesaKlondike.svelte`), con `Interaccion` para arrastrar, tocar y hacer doble toque, y el buscador de soluciones de los E2E.

## Goals / Non-Goals

**Goals:**
- Canfield clásico con robo de 3 o de 1 y vueltas ilimitadas, tramos ordenados y huecos llenados con la reserva.

**Non-Goals:**
- Límite de vueltas, mover solo columnas enteras, llenar huecos a mano con reserva, puntuación de casino.

## Decisions

### 1. Motor propio
`juegos/canfield.ts` (`id: 'canfield'`) es un juego aparte. La base y la vuelta afectan a todas las reglas de apilar, y la reserva y el llenado automático de los huecos cambian el deshacer, así que no cabe como opción del Klondike. Se copia la forma de trabajar de `klondike.ts` (una `Mesa` mutable dentro de cada transición).

- `ConfigCanfield = { robo: 1 | 3 }`, por defecto 3.
- `PilaCanfield = 'descarte' | 'reserva' | 'c0'…'c3' | 'f0'…'f3'`.
- `EstadoCanfield = { config, base, reserva, mazo, descarte, columnas: IdCarta[][], fundaciones, movimientos, historial, abandonada }`. La reserva va de abajo arriba y solo se ve la última. Las columnas son todo cartas boca arriba.
- `AccionCanfield = robar | reciclar | mover{desde, hasta, cantidad} | deshacer | autocompletar | abandonar`.
- `MovimientoCanfield` guarda, además de lo del Klondike, `relleno: number | null`: la columna que se llenó con la reserva en ese movimiento, para deshacerlo.

### 2. Apilar con vuelta
- **Siguiente valor:** `siguiente(v) = v === 13 ? 1 : v + 1`.
- **Fundación:** vacía admite una carta de valor `base`; si no, la del mismo palo y valor siguiente al de arriba. Completa con 13 cartas.
- **Columna:** la carta de arriba de destino `t` admite `c` si `siguiente(valor(c)) === valor(t)` y los colores son distintos. Una columna vacía (solo posible con la reserva vacía) admite cualquier carta.
- **Tramo:** desde el índice `k` hasta el final, si cada carta va sobre la anterior.

### 3. Acciones legales y llenado
- `robar` si hay mazo; si no, `reciclar` si hay descarte.
- Desde el descarte (la de arriba), la reserva (la de arriba) y cada tramo de columna, a cada columna y fundación donde encaje (a una fundación, solo una carta).
- Desde las fundaciones, la de arriba a una columna con carta en la que encaje (no a un hueco, para no dar vueltas).
- `deshacer`, `autocompletar` (mazo, descarte y reserva vacíos) y `abandonar`.

Tras cada movimiento, si alguna columna queda vacía y la reserva tiene cartas, la de arriba de la reserva pasa a esa columna. Solo puede vaciarse una columna por movimiento, así que se guarda cuál en `relleno`. Al deshacer, primero la carta vuelve de la columna a la reserva y después se revierte el movimiento.

### 4. Autocompletar
Con el mazo, el descarte y la reserva vacíos, todas las cartas que faltan están en las columnas. Aun así, con la vuelta no siempre se pueden subir: con base 9, una columna 10, 9, 8 tapa el 9 con el 8, que es la última carta de su fundación. Por eso `autocompletar` solo es legal si, subiendo una y otra vez cualquier carta de arriba de una columna que encaje en una fundación, se completan las cuatro. La simulación es barata (como mucho 52 pasos) y solo se hace cuando no quedan mazo, descarte ni reserva.

### 5. Pista
`pistaCanfield` puntúa:
- 100 por subir a una fundación (más 20 si sale de la reserva);
- 70 por sacar la carta de la reserva a una columna;
- 40 por sacar la del descarte a una columna;
- 30 por mover un tramo que vacía una columna, si queda reserva para llenarla (así sale una carta de la reserva);
- 0 por el resto (pasar tramos entre columnas sin vaciar nada, bajar de una fundación).

Si nada puntúa, sugiere robar o reciclar.

### 6. Cliente
- **`MesaCanfield.svelte`:** a partir de la del Klondike:
  - la fila de arriba con el mazo, el descarte (en abanico con robo de 3) y las 4 fundaciones, con un indicador de la base;
  - debajo, la reserva (una pila con su carta de arriba y el número que quedan) y las 4 columnas.
  - Con 5 pilas de ancho, las cartas son más grandes que en el Klondike.
- **Opciones:** robar de 3 o de 1.
- **Estadísticas:** sin cambios de código.
- **Fin:** movimientos y tiempo, como el Klondike.
- **E2E de victoria:** un buscador de soluciones como el del Yukon, adaptado a mazo y reserva, busca una semilla ganable con robo de 1.

## Risks / Trade-offs

- **[Pocas partidas se ganan]** → con robo de 3 se gana una minoría de partidas; el E2E de victoria busca una semilla con solución y robo de 1.
- **[Llenado automático y deshacer]** → el historial guarda la columna rellenada; un test comprueba que deshacer deja el estado exactamente como estaba.
- **[Ciclos al reciclar]** → con reciclado ilimitado, la partida puede no tener fin; el aviso de partida atascada no salta mientras se pueda robar, como en el Klondike.
