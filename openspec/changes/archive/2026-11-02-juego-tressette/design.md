## Context

El Tressette es la Sueca sin triunfo:
- cuatro en parejas, 10 cartas cada uno y sin mazo;
- la obligación de seguir el palo;
- cuentan los puntos de las cartas y no las bazas.

Cambian la baraja (la española de 40, con el orden 3, 2, As, rey…), los puntos en tercios con la última baza, y la partida a 21 puntos en lugar de a juegos. Se reaprovecha el modelo de la Sueca: el motor, la reconstrucción y la mesa.

## Goals / Non-Goals

**Goals:**
- Tressette de 4 en parejas a 21, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Las acusas, las señas habladas, el juego de 2 con mazo y el premio del cappotto.

## Decisions

### 1. Cartas (`juegos/tressette.ts`)
- **Baraja:** `crearBaraja('espanola40')`, como la Scopa.
- **Rango:** `rangoTressette`: 3 10, 2 9, As 8, rey 7, caballo 6, sota 5, 7 4, 6 3, 5 2 y 4 1.
- **Puntos:** se cuentan en tercios para no usar decimales. `terciosCartaTressette`: As 3; 3, 2 y figuras 1; las demás 0. La última baza suma 3 tercios. En total, 35 tercios por mano.
- **Puntos de la mano:** `Math.floor(tercios / 3)` para cada pareja. Como 35 deja resto 2, las dos parejas suman siempre 11.

### 2. Estado
- **Config:** `{ jugadores: 4, meta: 21 }`. La meta va en la config para que las pruebas usen partidas más cortas; el cliente juega siempre a 21.
- **Como la Sueca:** `manos`, `turno`, `mesa`, `ultimaBaza`, `bazas` (por jugador, para la mesa), `fallos` y `repartidor`, sin triunfo.
- **Puntos:** `tercios` (por pareja, en la mano en curso), `resultadosManos` (tercios, quién se llevó la última baza, puntos anotados y puntos tras la mano) y `puntos` (por pareja).
- **Otros:** `azar`.

### 3. Acciones y fin de mano
- **Acción:** `jugar { carta }`, siguiendo el palo si se puede.
- **Fin de la mano:** tras la décima baza se suman los 3 tercios de la última y se cierra la mano.
- **Fin de la partida:** si una pareja llega a la meta con más puntos que la otra, termina. Si no, se reparte con el siguiente repartidor.
- **Resultado:** ganan los dos asientos de la pareja; los `puntos` del `Fin` son los puntos de la pareja de cada asiento, como en la Sueca.

### 4. Vista
La de la Sueca sin triunfo, con las bazas de cada jugador, `tercios` y `puntos`; las cartas jugadas se calculan como las que no están en ninguna mano ni en la mesa.

### 5. IAs
- **Normal (`ia/tressette-basica.ts`):** las reglas de la spec, con «la más alta que queda» calculada con las cartas jugadas de la vista.
- **Difícil (`ia/reconstruir/tressette.ts`):** `SIMULABLE_TRESSETTE`.
  - **Reconstrucción:** como la de la Sueca, con los palos que no se siguieron y sin carta del triunfo.
  - **Valoración:** la diferencia de tercios de la mano entre parejas, entre 3, más la diferencia de puntos anotados (los tercios sobrantes no anotan) y `bonoPartida`.
  - **Valores:** `reconstrucciones` 12 y `presupuesto` 80, como en la Sueca. La difícil gana a la normal 137 de 200 partidas a 21 (122 de 200 a 11) y decide en 99 ms como máximo; la normal gana claramente a una pareja que juega al azar.

### 6. Cliente
- **`MesaTressette.svelte`:** a partir de `MesaSueca`, sin triunfo, con los puntos de cada pareja en la mano (los tercios como «⅓» y «⅔») y en la partida.
- **`ResumenTressette.svelte`:** los puntos de cartas de cada pareja, la última baza, lo que anota cada una y los puntos tras la mano.
- **Fin:** juego por parejas, en la rama de parejas de `Fin.svelte`, con los puntos de cada pareja.

## Risks / Trade-offs

- **[Duplicar la Sueca]** → Se copian las piezas pequeñas (ganadora, legales, reconstrucción y mesa) en lugar de generalizarlas: son pocas líneas, y tocar la Sueca no aporta nada al usuario.
- **[Sin triunfo, poca ventaja de la simulación]** → En los juegos sin triunfo la información que da cada baza pesa mucho; si la difícil no supera a la normal con los valores de la Sueca, se suben las simulaciones dentro del límite de 500 ms.
