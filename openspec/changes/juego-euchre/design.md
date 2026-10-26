## Context

El Euchre es un juego de bazas por parejas como el Whist y Picas, ya en la suite. Lo nuevo:
- la elección del triunfo en dos vueltas con la carta vuelta y el descarte del repartidor;
- jugar solo, que deja a un jugador fuera de la mano y hace bazas de 3 cartas;
- los bowers: la J del otro palo del mismo color cambia de palo y eso afecta a seguir el palo.

## Goals / Non-Goals

**Goals:**
- Euchre clásico a 10 puntos, con pedir, nombrar, jugar solo y los bowers.
- Reutilizar la mesa de bazas común (`MesaBazas`) y la muestra del Whist.
- IA normal por reglas y difícil por simulación de las bazas que le gane.

**Non-Goals:**
- *Stick the dealer*, jugar solo como defensor y partidas a otros puntos.

## Decisions

### 1. Palo efectivo y rango (`juegos/euchre.ts`)
- **Palo efectivo:** `paloEuchre(carta, triunfo)` da el palo de la carta, salvo el bower izquierdo, que es del triunfo. Todo usa ese palo: seguir el palo, ganar la baza y la reconstrucción.
- **Rango:** `rangoEuchre(carta, triunfo)`:
  - bower derecho 16 y bower izquierdo 15;
  - las demás, As 14, K 13, Q 12, J 11, 10 y 9.

### 2. Fases y estado
- **Fases:** `fase: 'primera' | 'segunda' | 'descarte' | 'bazas'`.
- **Reparto y triunfo:** `manos`, `cartaVuelta`, `ocultas` (las 3 que no se juegan), `repartidor`, `turno`, `pasaron` (número de pases en la vuelta) y `triunfo` (`null` hasta elegirlo).
- **Quién elige:** `elige` (asiento), `solo` (booleano) y `fuera` (el compañero que deja la mano, o `null`).
- **Descarte:** `descarte` (la carta descartada por el repartidor, oculta).
- **Bazas:** `mesa`, `ultimaBaza`, `bazas` por asiento y `fallos` (palos efectivos que cada uno no siguió en la mano).
- **Partida:** `puntos` por pareja, `resultadosManos`, `ultimaAccion` y `azar`.
- **Manos sin triunfo:** cuando los 4 pasan dos veces, se reparte con el siguiente repartidor y se guarda `manosAnuladas` para la vista. No entra en `resultadosManos`, que solo tiene manos jugadas.

### 3. Acciones
- **`pedir { solo }`:** primera vuelta.
- **`nombrar { palo, solo }`:** segunda vuelta, palo distinto del de la carta vuelta.
- **`pasar`:** en cualquiera de las dos vueltas.
- **`descartar { carta }`:** solo el repartidor, tras recoger la carta vuelta. Si el repartidor es el que deja la mano, no hay descarte y se va directo a las bazas.
- **`jugar { carta }`.**

### 4. Bazas y puntos
- **Turno:** el que deja la mano se salta, y la baza se cierra con 3 o 4 cartas según haya o no alguien fuera.
- **Puntos:** al acabar las 5 bazas, la pareja que eligió suma 1 con 3 o 4 bazas, 2 con 5 (o 4 si iba solo), y si hace menos de 3 suman 2 los rivales.
- **Registro:** `resultadosManos` guarda `{ elige, solo, triunfo, bazas: [n, n], puntosMano: [n, n], totales: [n, n], euchre }`.
- **Fin:** al llegar una pareja a 10.

### 5. Vista
- **Públicas:**
  - la carta vuelta mientras se elige el triunfo, y quién la recogió después;
  - el triunfo, quién lo eligió y si juega solo, y quién deja la mano;
  - la mesa, la última baza, las bazas, los fallos y los puntos.
- **Propias:** el descarte, solo para el repartidor.
- **Ocultas:** las manos ajenas y las 3 cartas ocultas.

### 6. IAs
- **Normal (`ia/euchre-basica.ts`):**
  - **Fuerza de la mano en un palo:** bower derecho 3, bower izquierdo 2,5, As del triunfo 2, K y Q del triunfo 1,5, otros triunfos 1 y Ases de otros palos 1.
  - **Pedir:** con 6 o más. La carta vuelta suma su valor si reparte su pareja y lo resta si reparte un rival.
  - **Nombrar:** el mejor palo si pasa de 6.
  - **Jugar solo:** con 10 o más.
  - **Descartarse:** la más baja que no es triunfo, prefiriendo la única de su palo.
  - **Bazas:** la heurística común de bazas (`bazas-heuristica.ts`) con el rango y el palo efectivos.
- **Difícil (`ia/reconstruir/euchre.ts`):** `SIMULABLE_EUCHRE`.
  - **Qué simula:** solo las bazas (`decideLaBase` en las fases de elegir y descartar).
  - **Reconstrucción:** las manos ajenas salen al azar de las cartas que no se ven, respetando los `fallos`. Si el repartidor recogió la carta vuelta y no la ha jugado, sigue en su mano.
  - **Valoración:** los puntos de la mano de su pareja menos los de la otra, con las bazas como desempate.
  - Valores de partida: `reconstrucciones` 20 y `presupuesto` 100.

### 7. Cliente
- **`MesaEuchre.svelte`:** sobre `MesaBazas`.
  - **Muestra:** la carta vuelta mientras se elige.
  - **Información:** el triunfo, quién eligió (y «solo»), las bazas de cada pareja y los puntos.
  - **Acciones:** los botones «Pedir», «Pedir solo», «Picas», «Picas solo»… y «Paso».
  - **Descarte:** el repartidor se descarta tocando una carta y la mesa.
  - **Quien deja la mano:** se marca en su detalle.
- **`ResumenEuchre.svelte`:** quién eligió, las bazas, los puntos y los totales.

## Risks / Trade-offs

- **[La heurística común de bazas usa el palo y el rango normales]** → La IA del Euchre pasa sus propias funciones de palo y rango efectivos; si la heurística no lo admite, se escribe una pequeña para el Euchre.
- **[Manos anuladas]** → Si los cuatro pasan dos veces, la mano no cuenta. No hay límite de manos anuladas seguidas, pero la IA pide con manos medianas y es raro que pase muchas veces.
