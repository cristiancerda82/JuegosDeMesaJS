## Context

El Conquián se parece a los rummies de la suite (Chinchón, Gin Rummy, Rummy 500 y Remigio) en las combinaciones, pero no en el turno:
- no se roba a la mano: la carta descubierta se usa bajándola o no se usa;
- cada carta se ofrece primero a uno y luego, a veces, al otro;
- la mano se gana con 11 cartas bajadas, no con puntos.

Se reaprovechan:
- `posicionEscalera` de `chinchon-combinaciones.ts`, con el orden de la baraja española de 40;
- la idea de la mesa del Rummy 500 (la mano que se ordena, elegir cartas y «Bajar», tocar una combinación para añadir);
- el resumen y el fin de partida por manos ganadas, como en el Écarté.

## Goals / Non-Goals

**Goals:**
- Conquián para 2, con 11 cartas bajadas y partida al mejor de 5, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Obligar al rival a usar una carta, reorganizar combinaciones, otros números de jugadores y la baraja de 48.

## Decisions

### 1. Combinaciones (`juegos/conquian.ts`)
- **Orden:** `posicionConquian(c)` = `posicionEscalera(valor, 'espanola40')` (As 0 … rey 9).
- **`esCombinacionConquian(cartas)`:**
  - **grupo:** 3 o 4 cartas, todas del mismo valor (con palos distintos, que en una baraja sin repetidas siempre lo son);
  - **escalera:** 3 o más del mismo palo, con posiciones seguidas.
- **Combinaciones bajadas:** `CombinacionConquian { cartas: IdCarta[] }`, por jugador, en el orden en que se bajan. Las de una escalera se guardan ordenadas.

### 2. La carta descubierta
- **Estado:** `descubierta: IdCarta | null`, `origen: 'mazo' | 'descarte'`, `deQuien: Asiento` (quien la descubrió o la descartó) y `ofrecidaA: Asiento`.
- **Fases:** `'decidir' | 'descartar'`.
- **Acciones:**
  - `bajar { cartas }`: una combinación nueva con la descubierta y esas cartas de la mano (2 o más);
  - `anadir { combinacion, cartas }`: la descubierta y esas cartas de la mano (0 o más) se añaden a la combinación `combinacion` del jugador, que tiene que seguir siendo válida;
  - `pasar`;
  - `descartar { carta }`.
- **Acciones legales de bajar y añadir:** se buscan solo las combinaciones que contienen la descubierta:
  - **grupos:** con 2 o 3 cartas de la mano de su mismo valor;
  - **escaleras:** los tramos seguidos del palo de la descubierta que la contienen, con al menos 3 cartas, usando solo cartas de la mano;
  - **añadir:** a un grupo de 3 de su valor; a una escalera, por un extremo, con la descubierta y las cartas de la mano que la siguen seguidas hacia fuera.

  Así hay pocas acciones (como mucho unas decenas) y todas son distintas.
- **Pasar:**
  - si viene del mazo y aún no se ofreció al rival, se ofrece al rival;
  - si no, queda muerta (`muertas`) y descubre la siguiente el rival de `deQuien`.
- **Tras bajar o añadir:** si la mano queda vacía, el jugador gana la mano; si no, pasa a `descartar`. El descarte pasa a ser la descubierta con `origen: 'descarte'`, ofrecida al rival.
- **Mazo vacío:** al tener que descubrir sin mazo, la mano termina en tablas.

### 3. Manos y partida
- **`ResultadoManoConquian`:** `empieza`, `ganador` (o `null` si fueron tablas), `bajadas` (cuántas cartas bajó cada uno), `ganadas` (las manos ganadas tras ella).
- **Empieza:** el asiento 0 en la primera mano; después, se alternan.
- **Fin:** cuando alguien llega a 3 manos ganadas, o tras 9 manos. `Fin.puntos` son las manos ganadas.
- **Config:** `{ manosParaGanar: number }` (3 por defecto; 1 en algunas pruebas), y el máximo de manos es `3 × manosParaGanar`.

### 4. Estado y vista
- **Estado:** `manos`, `mazo`, `muertas`, `combinaciones` (por jugador), `descubierta`, `origen`, `deQuien`, `ofrecidaA`, `fase`, `turno`, `ganadas`, `numeroMano`, `empieza`, `resultadosManos`, `azar`.
- **Vista:** la mano propia, cuántas tiene el rival, todas las combinaciones, las cartas muertas, la descubierta con su origen y a quién se ofrece, cuántas quedan en el mazo y todo lo demás, que es público.

### 5. IAs
- **Normal (`ia/conquian-basica.ts`):**
  - **Usar:** entre `bajar` y `anadir`, la que baja más cartas de la mano; si empatan, añadir; si no hay ninguna, `pasar`.
  - **Descartar:** `relacionConquian(carta, mano)` cuenta las del mismo valor y las del mismo palo a una o dos posiciones. Se descartan antes las que no puede usar el rival (las que no añadirían a sus combinaciones), luego las de menos relación y, si empatan, la más alta.
- **Difícil (`ia/reconstruir/conquian.ts`):** `SIMULABLE_CONQUIAN`.
  - **Reconstrucción:** la mano del rival y el mazo al azar entre las cartas que no se ven, con su tamaño. No hay más restricciones: pasar no dice nada seguro de la mano.
  - **`decideLaBase`:** nunca. Se simulan usar o pasar, con qué jugada y el descarte.
  - **Valoración:** +1 si gana la mano, −1 si la pierde, 0 en tablas, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 30 y `presupuesto` 300. La difícil gana 135 de 200 partidas a la normal (la parte justa son 100), con 86 ms como máximo por jugada.

### 6. Cliente
- **`MesaConquian.svelte`:**
  - arriba, la mano del rival boca abajo y sus combinaciones;
  - en el centro, el mazo (con su número), la última carta muerta y la carta descubierta, marcada «Del mazo» o «Descarte de …» y «Para ti» o «Para el rival»;
  - debajo, mis combinaciones (con cuántas cartas llevo bajadas) y mi mano, que se ordena por palos o por números.
  - **Elegir:** las cartas de la mano se marcan al tocarlas. «Bajar» se activa cuando la elección con la descubierta es una acción `bajar` legal. Mis combinaciones se resaltan cuando la elección se puede añadir a ellas (acción `anadir` legal) y se tocan para añadir.
  - **Descartar:** en la fase `descartar`, la carta elegida con «Descartar» o con un doble toque.
  - **Información:** manos ganadas por cada uno y la mano en curso.
- **`ResumenConquian.svelte`:** quién gana la mano o «Tablas», cuántas cartas bajó cada uno y las manos ganadas.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.

## Risks / Trade-offs

- **Las manos acaban mucho en tablas** → es propio del juego. Para que la partida no se alargue, hay un máximo de 9 manos.
- **Muchas jugadas para elegir en la difícil** → las acciones de bajar y añadir siempre contienen la descubierta, así que hay pocas; si pasan del presupuesto, el marco de niveles decide como la normal.
- **Elegir combinación en el móvil** → la mesa marca qué se puede hacer con la elección (el botón «Bajar» o las combinaciones resaltadas), y las acciones que no son legales no responden.
