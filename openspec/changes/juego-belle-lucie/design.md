## Context

La Belle Lucie tiene todas las cartas a la vista desde el reparto, como el FreeCell. Pero solo se mueve la carta de arriba de cada abanico, y los abanicos vacíos no sirven para nada. Los rebarajes usan azar, así que el estado guarda el `azar` y deshacer restaura el tablero entero, también el azar.

## Goals / Non-Goals

**Goals:**
- La Belle Lucie clásica: 18 abanicos, dos rebarajes y una merci tras el último.
- Pista, récords, deshacer y atasco como el resto de solitarios.
- La mesa con 18 abanicos cabe en 360 × 640.

**Non-Goals:**
- Trefoil, Shamrocks, rebarajes ilimitados y mover grupos.

## Decisions

### 1. Estado (`juegos/belle-lucie.ts`)
- **Tablero:**
  - `abanicos: IdCarta[][]` (la carta de arriba es la última);
  - `fundaciones: Record<PaloFrances, number>`, el valor de arriba (0 si está vacía);
  - `rebarajes`, los que quedan, de 2 a 0;
  - `merci`: `'pendiente'` hasta el último rebaraje, después `'disponible'`, y `'usada'`;
  - `azar`.
- **Partida:** `movimientos`, `historial` (los tableros anteriores) y `abandonada`.

### 2. Acciones
- **`fundacion { abanico }`:** sube la carta de arriba.
- **`mover { desde, hasta }`:** la de arriba de `desde` sobre la de arriba de `hasta`, si es la siguiente más baja del mismo palo. Como solo encajan sobre una carta concreta, las acciones son pocas.
- **`rebarajar`:** si quedan rebarajes y hay cartas en los abanicos. Baraja con el `azar` y reparte de 3 en 3. Si era el último, la merci pasa a `'disponible'`.
- **`merci { abanico, indice }`:** con la merci disponible, cualquier carta que no sea la de arriba de un abanico de 2 o más cartas.
- **`deshacer` y `abandonar`.**

### 3. Victoria
Las 4 fundaciones en el K.

### 4. Pista (`pistaBelleLucie` en `ia/pistas.ts`)
Puntúa las acciones:
- subir a una fundación: 100;
- mover una carta sobre otra si la que queda arriba de su abanico puede subir: 60;
- o puede moverse sobre otra: 30;
- o si así se vacía el abanico: 10.

Si no hay nada útil:
1. la merci con una carta que pueda subir a su fundación;
2. si no, rebarajar;
3. si no, `null`.

### 5. Cliente
- **`MesaBelleLucie.svelte`:** mesa propia.
  - **Arriba:** las 4 fundaciones (`fundacion-{palo}`).
  - **Abanicos:** una rejilla de 18 abanicos (`abanico-{i}`) con las cartas solapadas en horizontal, 4 por fila en 360 px y más en escritorio. Cada carta lleva `data-carta`.
  - **Interacción:** tocar la carta de arriba de un abanico la marca, y tocar otro abanico o una fundación la mueve. Tocar dos veces la sube a su fundación si se puede.
  - **Merci:** el botón `merci` activa el modo merci; después se toca la carta.
  - **Barra:** movimientos, tiempo, `rebarajar` (con los que quedan), `merci`, deshacer, pista y abandonar, como en el resto de solitarios.
- **E2E:** para ganar desde la interfaz, un solucionador sencillo (`e2e/belle-lucie-solucion.ts`) busca la solución de una semilla y la juega. Como el azar de los rebarajes está en el estado, también prueba los rebarajes y la merci, y la semilla del test (`lucie-17`) los usa.

## Risks / Trade-offs

- **[Partidas que no se ganan]** → El solucionador tiene un límite de nodos. Con rebarajes y merci, una de cada cuatro semillas, más o menos, se gana.
- **[18 abanicos en 360 px]** → Las cartas de cada abanico se solapan en horizontal y los abanicos van en 5 filas de 4.
