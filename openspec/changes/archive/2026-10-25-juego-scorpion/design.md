## Context

El Scorpion se parece al Spider: columnas con cartas tapadas que se descubren solas, deshacer guardando el tablero y una pista que busca descubrir cartas. Las diferencias son:
- una sola baraja (`IdCarta`, sin copias);
- se mueve cualquier carta descubierta con todo lo que tiene encima, no solo escaleras;
- solo una K entra en una columna vacía;
- las escaleras completas se quedan en la mesa.

## Goals / Non-Goals

**Goals:**
- Scorpion clásico, con la reserva de 3 cartas y la victoria con las cuatro escaleras en la mesa.
- Pista, récords, deshacer y atasco como el resto de solitarios.
- La mesa de 7 columnas cabe en 360 × 640.

**Non-Goals:**
- Variantes abiertas, Wasp y retirar escaleras.

## Decisions

### 1. Estado (`juegos/scorpion.ts`)
- `columnas: { ocultas: IdCarta[]; visibles: IdCarta[] }[]` (7);
- `reserva: IdCarta[]`;
- `movimientos`, `historial` (los tableros anteriores, como en el Spider), `abandonada`.

### 2. Acciones
- `mover { desde, hasta, cantidad }`: `cantidad` cuenta las cartas desde la que se mueve hasta arriba de la columna. Es legal si el destino:
  - no está vacío y su carta de arriba es la siguiente del mismo palo de la carta que se mueve;
  - o está vacío y la carta que se mueve es una K, salvo que ya esté al fondo de su columna sin tapadas debajo, porque entonces no cambiaría nada.
- `repartir`: con la reserva llena, una carta a cada una de las columnas 0, 1 y 2.
- `deshacer` y `abandonar`.

Como mucho hay 52 cartas visibles × 1 destino posible cada una (solo encajan sobre la siguiente de su palo), así que las acciones son pocas.

### 3. Victoria
Hay cuatro columnas con exactamente 13 cartas visibles, cada una de la K al As del mismo palo; el resto están vacías y la reserva también.

### 4. Pista (`pistaScorpion` en `ia/pistas.ts`)
Puntúa los movimientos:
- descubrir una carta tapada: 80;
- llevar una K a una columna vacía dejando cartas atrás (tapadas, o visibles que no son una escalera): 30;
- unir una carta a la siguiente de su palo cuando no estaba ya encima de ella: 40;
- vaciar una columna: 20.

Si no hay nada útil, `repartir`; si no, `null`.

### 5. Cliente
- **`MesaScorpion.svelte`:** parte de `MesaSpider.svelte`.
  - 7 columnas con `--ancho-carta` igual al ancho disponible entre 7, y la reserva a la derecha de la barra.
  - Tocar una carta descubierta selecciona esa carta y las de encima; tocar la reserva la reparte.
- **E2E:** como Cuarenta ladrones, con un solucionador DFS en `e2e/scorpion-solucion.ts` que busca una semilla ganable y la juega desde la interfaz.

## Risks / Trade-offs

- **[Pocas partidas ganables]** → El Scorpion se gana en torno a un tercio de las veces con buen juego. El solucionador busca entre varias semillas con un límite de nodos.
