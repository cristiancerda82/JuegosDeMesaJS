## Context

El Big Two es de la familia del Culo: se sueltan jugadas que superan a la de la mesa y gana quien se queda antes sin cartas. Lo nuevo:
- las jugadas de 5 cartas con sus tipos;
- el orden con el 2 arriba y el palo como desempate;
- la salida con el 3♦.

El riesgo principal es el número de acciones legales: con 13 cartas puede haber cientos de jugadas de 5.

## Goals / Non-Goals

**Goals:**
- Big Two clásico de 4 jugadores, con jugadas de 5 y partida a 50.
- Acciones legales canónicas y en número manejable.
- IA normal por reglas y difícil por simulación con candidatas que le gane.

**Non-Goals:**
- Menos de 4 jugadores, bombas, escaleras con vuelta y que pasar bloquee la ronda.

## Decisions

### 1. Cartas y jugadas (`juegos/big-two.ts`)
- **Rango de número:** `numeroBigTwo(c)` del 3 (0) al 2 (12). `valorBigTwo(c) = numero * 4 + palo`, con ♦ 0, ♣ 1, ♥ 2 y ♠ 3: un orden total de las 52 cartas.
- **`jugadaBigTwo(cartas)`:** clasifica un conjunto. Devuelve `null` si no es jugada, o `{ tipo, fuerza }`:
  - `tipo` es `suelta`, `pareja`, `trio`, `escalera`, `color`, `full`, `poker` o `escaleraColor`;
  - `fuerza` es un número comparable dentro del mismo tamaño. En las de 5 es `rangoTipo * 1000 + valor de la carta decisiva`, donde la carta decisiva es la más alta en escaleras y colores, la del trío en el full y la del póker en el póker.
- **`supera(a, b)`:** mismo número de cartas y `fuerza(a) > fuerza(b)`.

### 2. Acciones y su enumeración
- **Acciones:**
  - `jugar { cartas }`, con las cartas ordenadas por `valorBigTwo`, que es la forma canónica;
  - `pasar`, solo si hay jugada en la mesa.
- **Sueltas, parejas y tríos:** se enumeran agrupando por número.
- **De 5, sin recorrer las combinaciones de 5:**
  - escaleras: por cada número inicial, el producto de las cartas de cada número;
  - colores: combinaciones de 5 de cada palo;
  - full: trío × pareja de otro número;
  - póker: cuatro × cada carta restante.
  - Las escaleras que son a la vez color se clasifican como escalera de color y no se repiten.
- **Primera jugada de la mano:** solo las que llevan el 3♦.
- **Al superar:** solo las del mismo tamaño que superan a la de la mesa.

### 3. Estado
- **Mano en juego:** `manos`, `turno`, `mesa` (`{ asiento, cartas, tipo } | null`), `pasesSeguidos`, `jugadas` (las cartas jugadas en la mano) y `primera` (la próxima jugada debe llevar el 3♦).
- **Partida:** `totales` por asiento, `resultadosManos` (`{ ganador, cartasRestantes, puntos, totales }`), `ultimaAccion` y `azar`.
- **Ronda:** cuando `pasesSeguidos` llega a 3, la mesa se vacía y le toca al dueño de la jugada. Si ese jugador se quedó sin cartas, la mano ya terminó al jugar.

### 4. Vista
Todo es público menos las manos ajenas.

### 5. IAs
- **Normal (`ia/big-two-basica.ts`):**
  - **Al salir:** la jugada que contiene su carta más baja, prefiriendo la que suelta más cartas.
  - **Al superar:** cada jugada candidata tiene un coste. Es su fuerza, más una penalización si rompe una pareja, un trío o una jugada de 5 que tenía, y una grande si lleva un 2 mientras ningún rival tenga 4 cartas o menos. Juega la de menor coste. Si solo quedan jugadas con 2 y no es el momento, pasa.
- **Difícil (`ia/reconstruir/big-two.ts`):** `SIMULABLE_BIG_TWO`.
  - **Candidatas:** la de la normal, pasar y la más baja de cada tamaño y tipo, como mucho 8.
  - **Reconstrucción:** las manos ajenas salen al azar de las cartas que no se han visto.
  - **Valoración:** si la mano se cerró, la media de los puntos de los demás menos los propios, más el bono de partida. Si no, la diferencia de cartas en mano.
  - Valores de partida: `reconstrucciones` 20 y `presupuesto` 100.

### 6. Cliente
- **`MesaBigTwo.svelte`:**
  - los rivales con sus cartas, sus puntos y la marca «Pasa»;
  - la mesa con la última jugada, su tipo y quién la hizo;
  - la mano ordenada.
- **Jugar:** se marcan las cartas tocándolas. «Jugar» se activa si las marcadas son una acción legal; también está «Paso».
- **`ResumenBigTwo.svelte`:** quién ganó la mano, las cartas que quedaron, los puntos y los totales.

## Risks / Trade-offs

- **[Muchas jugadas de 5 con manos de un solo palo]** → Con 7 cartas de un palo hay 21 colores, y como mucho unos centenares de acciones en total. La IA difícil solo simula sus candidatas.
- **[La mano entera en 360 px]** → 13 cartas en la mano propia: se usa el mismo solapamiento que en el Sevens, con un 30 % visible por carta.
