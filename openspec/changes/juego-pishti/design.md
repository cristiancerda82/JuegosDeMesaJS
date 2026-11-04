## Context

El Pishti es un juego de pesca como la Scopa y el Cuarenta, pero más simple:
- solo cuenta la carta de arriba del montón;
- cada carta se juega de una sola forma (se lleva el montón o se queda arriba);
- las 3 cartas tapadas del montón inicial son la única información oculta de la mesa.

Se reaprovecha el modelo de la Scopa y del Cuarenta: bandos de 2 o 4, cartas recogidas boca abajo, el montón que va al último que capturó, la reconstrucción con `Ocultas` y la simulación con horizonte. La mesa del cliente es nueva, porque el montón se pinta como una pila y no hay que elegir capturas.

## Goals / Non-Goals

**Goals:**
- Pishti de 2 y de 4 en parejas a 151 puntos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- 3 jugadores o 4 sin parejas;
- las variantes de reparto y de puntos de la proposal.

## Decisions

### 1. Reglas (`juegos/pishti.ts`)
- **Baraja:** `crearBaraja('francesa52')`.
- **Cartas:** `rangoPishti` y `esJotaPishti` (con el nombre del juego, porque el Skat ya exporta un `esJota`).
- **Puntos de una carta (`puntosCartaPishti`):** As y J 1, 2 de tréboles 2, 10 de diamantes 3, el resto 0.
- **Acción:** `jugar { carta }`; cada carta de la mano es una acción legal.
- **Captura:**
  - si `monton` no está vacío y la carta es del rango de la de arriba, o es una J, se lleva el montón con las tapadas;
  - es pishti si el montón tenía una sola carta y no había tapadas, y la carta es del mismo rango: 10, o 20 con dos J.
- **Repartos:** cuando todas las manos se vacían, 4 a cada uno desde el que le toca; sin mazo, se cierra la mano.

### 2. Estado
- **Config:** `{ jugadores: 2 | 4, meta: 151 }`. La meta va en la config para que las pruebas usen partidas más cortas; el cliente juega siempre a 151.
- **Mesa:** `tapadas` (las 3 del montón inicial mientras nadie se lleva el montón) y `monton` (las cartas a la vista, de abajo arriba).
- **Como en la Scopa:**
  - `repartidor`, `mazo`, `manos`, `turno`;
  - `recogidas` por bando, `ultimoEnRecoger`, `ultimaJugada`;
  - `puntos` y `resultadosManos`.
- **Del Pishti:**
  - `pishtis`: por bando, cuántos y cuántos puntos;
  - `vistasMano`: las cartas vistas en la mano, en orden: la de arriba del montón inicial y las echadas. Son públicas, porque estuvieron boca arriba, y las usan la IA y la reconstrucción. Al principio eran solo las echadas, pero entonces la IA olvidaba la carta inicial en cuanto alguien se llevaba el montón.
- **`ultimaJugada`:** `{ asiento, carta, llevadas, tapadas, pishti }`, con las cartas a la vista que se llevó, cuántas tapadas y los puntos del pishti (0 si no lo hubo).

### 3. Puntos de la mano (`puntuarManoPishti`)
- Con las recogidas y los pishtis de cada bando, da por bando:
  - el recuento: cartas, Ases, J, 2 de tréboles, 10 de diamantes, pishtis y sus puntos;
  - los puntos de cada concepto y el total.
- Con empate en cartas, nadie anota los 3.
- **Fin de la partida:** como la Scopa. Tras la mano, si un bando llega a la meta con más que el otro, termina; si no, nueva mano con el siguiente repartidor.

### 4. Vista
- La mano propia, las cartas en cada mano, el mazo, cuántas tapadas, el `monton`, `vistasMano`, la última jugada, las cartas recogidas (solo cuántas) y los pishtis de cada bando, los resultados y los puntos.

### 5. IAs
- **Normal (`ia/pishti-basica.ts`):** la valoración de la spec.
  - «Cartas que no ha visto» cuenta su mano y `vistasMano`.
  - El valor de un montón son 5 por carta (tapadas incluidas) y 30 por punto de carta de las que se ven.
- **Difícil (`ia/reconstruir/pishti.ts`):** `SIMULABLE_PISHTI`.
  - **Reconstrucción:** con `Ocultas`, entre las cartas que no se ven (ni su mano, ni el montón, ni `vistasMano`):
    - las manos ajenas, el mazo y las tapadas, al azar con su tamaño;
    - las recogidas de cada bando, con las cartas vistas en la mano que ya no están en el montón y el resto al azar.
  - **Valoración:** la diferencia de puntos de la mano entre su bando y el otro, más `bonoPartida`. A medias (por el horizonte), los pishtis, los puntos de carta recogidos y 0,3 por carta de más.
  - **Valores:** `reconstrucciones` 50, `presupuesto` 500 y `horizonte` 32, los del Cuarenta. La difícil gana a la normal 140 de 200 partidas con 2 (92 ms como máximo) y 69 de 100 con 4 (129 ms).

### 6. Cliente
- **`MesaPishti.svelte`:** con la estructura de la mesa del Cuarenta (rivales, info, mano propia y el resumen de la mano), sin el selector de capturas.
  - **Montón:** una pila con el dorso de las tapadas y su número; encima, las últimas cartas a la vista en abanico y la de arriba entera.
  - **Jugar:** tocar una carta y el montón; con una sola carta jugable, como en el resto de mesas, la carta obvia.
  - **Pausa:** tras llevarse un montón se ven juntas la carta jugada y las que se lleva, con el aviso de pishti.
  - **Con 4:** los rivales a los lados y el compañero enfrente.
- **`ResumenPishti.svelte`:** por bando, cartas, Ases y J, 2 de tréboles, 10 de diamantes y pishtis, con los puntos.
- **Opciones:** 2 o 4 jugadores.
- **Fin:** el Pishti entra en la rama de parejas de `Fin.svelte`, como la Scopa y el Cuarenta.
- **Sala de espera:** entra en la lista de `PAREJAS`.

## Risks / Trade-offs

- **Montones largos en móvil:** el montón puede llegar a 20 cartas a la vista. Se pintan solo las 5 de arriba en abanico, con el número total, para que quepa en 360 px.
