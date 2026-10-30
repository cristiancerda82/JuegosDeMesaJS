## Context

La Sueca es casi el Whist:
- cuatro en parejas;
- el triunfo con la última carta del repartidor, que se ve hasta que la juega;
- la obligación de seguir el palo.

Cambian la baraja (40 cartas y el orden A, 7, K, J, Q…), que cuentan los puntos de las cartas y no las bazas, y la partida a juegos. Se reaprovecha el modelo del Whist: el motor, la reconstrucción y la mesa.

## Goals / Non-Goals

**Goals:**
- Sueca de 4 en parejas a 4 juegos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El renuncio con penalización y otras formas de elegir el triunfo.

## Decisions

### 1. Cartas (`juegos/sueca.ts`)
- **Baraja:** `BARAJA_SUECA`: la francesa de 52 sin 8, 9 ni 10.
- **Rango:** A 10, 7 9, K 8, J 7, Q 6, 6 5… 2 1.
- **Puntos:** `puntosCartaSueca`: A 11, 7 10, K 4, J 3, Q 2.

### 2. Estado
- **Config:** `{ jugadores: 4 }`.
- **Como el Whist:** `manos`, `triunfo`, `cartaTriunfo` (`null` cuando se juega), `turno`, `mesa`, `ultimaBaza`, `fallos` y `repartidor`.
- **Puntos:** `puntosMano` (por pareja, en la mano en curso), `resultadosManos` y `juegos` (por pareja).
- **Otros:** `azar`.

### 3. Acciones y fin de mano
- **Acción:** `jugar { carta }`, siguiendo el palo si se puede.
- **Fin de la mano:** tras la décima baza se cierra la mano. Los juegos se calculan con la tabla de la spec, y el resultado guarda los puntos, los juegos ganados y los juegos tras la mano.
- **Fin de la partida:** si una pareja llega a 4, termina. Si no, se reparte con el siguiente repartidor.
- **Resultado:** ganan los dos asientos de la pareja; los `puntos` del `Fin` son los juegos de la pareja de cada asiento, como en el Whist.

### 4. Vista
La del Whist con `puntosMano` y `juegos`; las cartas jugadas se calculan como las que no están en ninguna mano ni en la mesa.

### 5. IAs
- **Normal (`ia/sueca-basica.ts`):** las reglas de la spec.
- **Difícil (`ia/reconstruir/sueca.ts`):** `SIMULABLE_SUECA`.
  - **Reconstrucción:** como la del Whist: los palos que no se siguieron y la carta del triunfo en la mano del repartidor.
  - **Valoración:** la diferencia de puntos de cartas de la mano entre parejas, entre 10, más 10 por cada juego ganado o perdido.
  - **Valores:** `reconstrucciones` 12 y `presupuesto` 80, como en el Whist. La difícil gana a la normal 148 de 200 partidas y decide en 85 ms como máximo; la normal gana 179 de 200 a una pareja que juega al azar.

### 6. Cliente
- **`MesaSueca.svelte`:** como `MesaWhist`, con los puntos de cada pareja en la mano y los juegos.
- **`ResumenSueca.svelte`:** los puntos de cada pareja, los juegos ganados y los juegos tras la mano.
- **Fin:** juego por parejas, en la rama de parejas de `Fin.svelte`, con los juegos de cada pareja.

## Risks / Trade-offs

- **[Duplicar el Whist]** → Se copian las piezas pequeñas (ganadora, legales y reconstrucción) en lugar de generalizarlas: son pocas líneas, y tocar el Whist no aporta nada al usuario.
