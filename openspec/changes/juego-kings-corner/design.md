## Context

Kings in the Corner se parece a un solitario compartido: todas las pilas están en el centro y son de todos. Como en el Spite and Malice, cada turno tiene varias jugadas seguidas del mismo jugador, que acaba pasando. La diferencia es que aquí se puede mover una pila entera.

## Goals / Non-Goals

**Goals:**
- Kings in the Corner de 2 a 4, de una sola mano, con robo al empezar el turno y movimiento de pilas.
- Una mesa propia en cruz con selección de origen y destino.
- IA normal por reglas y difícil por simulación con horizonte.

**Non-Goals:**
- Puntuación por varias manos y variantes sin robo o sin mover pilas.

## Decisions

### 1. Estado (`juegos/kings-corner.ts`)
- **Config:** `{ jugadores: 2..4 }`, por defecto 2.
- **Pilas:** 8 listas de cartas (la de arriba es la última). Los índices 0 a 3 son las laterales (arriba, derecha, abajo e izquierda) y los 4 a 7 las esquinas (arriba-izquierda, arriba-derecha, abajo-derecha y abajo-izquierda).
- **Manos y mazo:** `manos` y `mazo` (la siguiente que se roba es la última).
- **Turno:** `turno` y `pasesSeguidos`, que se ponen a 0 con cualquier jugada o movimiento.
- **Resultado y otros:** `ganador` (`Asiento`, `'empate'` o `null`), `ultimaAccion` y `azar`.
- **Fin por bloqueo:** si el mazo está vacío y `pasesSeguidos` llega al número de jugadores, termina la partida y gana quien tenga menos cartas. Si empatan, `ganador` es `'empate'` y el `Fin` da como ganadores a todos los que tienen el mínimo.

### 2. Acciones
- **`jugar { carta, pila }`:**
  - sobre una pila con cartas, si la carta encaja (uno menos y del color contrario);
  - en un hueco lateral, cualquier carta;
  - en una esquina vacía, solo un K.

  De los huecos laterales y de las esquinas vacías se ofrece solo el primero, porque son iguales.
- **`mover { desde, a }`:** `desde` es una pila lateral con cartas. Su primera carta tiene que encajar sobre la de arriba de `a`, que tiene cartas. Mover a un hueco no tiene sentido y no se ofrece.
- **`pasar`:** termina el turno. El siguiente jugador roba al empezar.
- **Orden:** las acciones se ofrecen en un orden fijo: primero mover, después jugar por carta y pila, y al final pasar.

### 3. Vista
- **Visible:** su mano, `cartasEnMano`, `enMazo`, `pilas`, `turno`, `pasesSeguidos`, `ganador` y `ultimaAccion`.
- **Oculto:** las manos ajenas y el mazo.

### 4. IAs
- **Normal (`ia/kings-corner-basica.ts`):** la lista de prioridades de la spec. Para llenar un hueco, cuenta cuántas cartas de su mano encadena desde cada carta posible y elige la de la cadena más larga.
- **Difícil (`ia/reconstruir/kings-corner.ts`):** `SIMULABLE_KINGS_CORNER`.
  - **Reconstrucción:** las manos ajenas y el mazo, al azar entre las cartas que no se ven.
  - **Simulación:** `manoTerminada` siempre es `false`, y se simulan como mucho `horizonte` 30 jugadas.
  - **Valoración:** las cartas del rival que menos tiene menos las suyas, más el bono de la partida.
  - **Valores:** `reconstrucciones` 10 y `presupuesto` 80. Gana a la normal 119 de 200 partidas y decide en 44 ms como máximo.

### 5. Cliente
- **`MesaKingsCorner.svelte`:** mesa propia.
  - **Rivales:** arriba, con sus cartas (`asiento-{a}`).
  - **Centro:** una rejilla de 3 × 3 con las esquinas, las laterales y el mazo en el centro. Cada pila (`pila-{i}`) muestra su primera carta y la de arriba solapadas, para saber si se puede mover.
  - **Abajo:** la mano (`mano-{carta}`), el turno y el botón de pasar (`pasar`).
  - **Selección:** un estado local `origen`, que es una carta de la mano o una pila lateral. Los destinos válidos se resaltan.
- **Pausa:** `pausaTras` hace una pausa tras cada acción de un rival, para verla.
- **Fin:** la pantalla de fin con las cartas que le quedan a cada uno.

## Risks / Trade-offs

- **[Partidas que no acaban]** → El bloqueo con el mazo vacío las termina. Mientras quede mazo, cada turno roba, así que el mazo se acaba.
- **[Pilas altas en 360 px]** → Solo se pintan la primera carta y la de arriba de cada pila, solapadas.
