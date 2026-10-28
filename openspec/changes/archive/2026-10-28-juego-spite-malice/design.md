## Context

Spite and Malice no se parece a los juegos de bazas recientes. Cada turno tiene varias jugadas seguidas del mismo jugador, hay dos copias de cada carta, y la mano se rellena a mitad de turno. Su mesa también es distinta: montones, descartes y escaleras comunes.

## Goals / Non-Goals

**Goals:**
- Spite and Malice clásico para 2, con montones de 20, dos barajas sin comodines y 4 descartes.
- Una mesa propia con selección de origen y destino.
- IA normal por reglas (cadenas hasta el montón) y difícil por simulación con horizonte.

**Non-Goals:**
- Otras opciones de montón, comodines, menos descartes y más de 2 jugadores.

## Decisions

### 1. Cartas (`juegos/spite-malice.ts`)
- **Baraja:** `BARAJA_SPITE_MALICE`, dos veces la francesa de 52. Las dos copias de una carta tienen el mismo `IdCarta`, así que las manos y los mazos son multiconjuntos. Las operaciones quitan una sola copia (`quitarUna`).
- **Valor:** As 1, 2…10, J 11, Q 12. El K es comodín.
- **`puedeIr(carta, escalera)`:** la carta va en una escalera si es un K o si su valor es el de la escalera más uno (una escalera vacía vale 0). La Q completa la escalera.

### 2. Estado
- **Cartas de cada jugador:** `montones` (la última es la de arriba), `manos` y `descartes` (4 por jugador, la última de cada una es la de arriba).
- **Centro y mazo:** `escaleras` (4 sitios, cada uno una lista de cartas, vacía si está libre), `completas` (las cartas de las escaleras terminadas) y `mazo` (el siguiente que se roba es el último).
- **Turno:** `turno`, `pasesSeguidos` (para el empate) y `ultimaAccion`.
- **Resultado:** `ganador` (`Asiento`, `'empate'` o `null`) y `azar`.

### 3. Acciones
- **`jugar { desde, escalera }`:**
  - `desde` es `{ tipo: 'monton' }`, `{ tipo: 'mano', carta }` o `{ tipo: 'descarte', pila }`;
  - `escalera` es el índice del sitio (0 a 3);
  - de las escaleras libres solo se ofrece la primera, porque son iguales;
  - las cartas de la mano repetidas se ofrecen una vez.
- **`descartar { carta, pila }`:** de la mano a uno de sus 4 descartes. Termina el turno.
- **`pasar`:** solo si no tiene cartas en la mano ni puede jugar nada.

### 4. Robo y fin
- **Al empezar el turno:** se roba hasta 5.
- **Al vaciar la mano jugando:** se roban 5.
- **Mazo agotado:** si hay que robar y el mazo está vacío, las `completas` se barajan con el `azar` y forman el mazo.
- **Fin:** en cuanto un montón se vacía, gana su dueño. Con dos `pasar` seguidos (es decir, sin mazo ni completas y sin jugadas), empate.

### 5. Vista
- **Públicas:**
  - cuántas cartas tiene cada montón y la de arriba;
  - los descartes completos, las escaleras, cuántas cartas hay en las completas y en el mazo;
  - cuántas cartas tiene cada mano;
  - la última acción.
- **Ocultas:** la mano del rival, las cartas boca abajo de los montones y el mazo.

### 6. IAs
- **Normal (`ia/spite-malice-basica.ts`):**
  - **Montón:** si la carta de su montón va en alguna escalera, la juega. Si es un K, en la escalera más alta.
  - **Cadena:** búsqueda en profundidad de hasta 6 jugadas con cartas que no son K (de la mano y de arriba de los descartes), que acabe con la carta del montón colocada; juega la primera jugada de la cadena más corta. Si con los K se llega y sin ellos no, también los usa.
  - **Mano y descartes:** juega cartas de la mano que no son K, empezando por las más bajas, y después las de arriba de sus descartes, mientras no dejen una escalera en el valor anterior al de la carta de arriba del montón del rival. Jugar también los descartes evita que se le acumulen las cartas y se agote el mazo, que acababa muchas partidas en empate.
  - **Descartar:** como dice la spec de `ia-jugadores`.
- **Difícil (`ia/reconstruir/spite-malice.ts`):** `SIMULABLE_SPITE_MALICE`.
  - **Qué simula:** cada decisión, entre candidatas limitadas (`candidatas`): la de la normal, las jugadas desde el montón, las primeras jugadas de cada cadena y los descartes de la normal en cada pila.
  - **Horizonte:** 40 jugadas.
  - **Valoración:** las cartas que le quedan al rival en el montón menos las suyas, más el bono de la partida.
  - **Reconstrucción:** la mano del rival, las cartas boca abajo de los dos montones y el mazo se reparten al azar entre las cartas que no se ven, contando copias.
  - Valores de partida: `reconstrucciones` 12 y `presupuesto` 60.

### 7. Cliente
- **`MesaSpiteMalice.svelte`:** mesa propia, en tres franjas.
  - **Arriba, el rival:** su montón, sus descartes y su mano boca abajo.
  - **Centro:** el mazo, las 4 escaleras con su valor y las completas.
  - **Abajo, el jugador:** sus descartes, su montón y su mano.
  - **Selección:** un estado local `origen`. Tocar un origen jugable lo marca; tocar un destino válido hace la acción. Los destinos válidos se resaltan.
  - **Testids:** `mano-{i}`, `monton-propio`, `descarte-propio-{p}`, `escalera-{e}`, `monton-rival`, `descarte-rival-{p}`, `mazo` y `aviso`.
- **Fin:** la pantalla de fin con el ganador y las cartas que le quedaban a cada uno en el montón.

## Risks / Trade-offs

- **[Copias de cartas]** → Las dos copias se ven igual. La interfaz identifica las cartas de la mano por su posición, y la acción por el `IdCarta`, que basta porque las dos copias son intercambiables.
- **[Turnos largos de la difícil]** → La difícil decide jugada a jugada. Con un horizonte y unas candidatas limitadas se mantiene por debajo de 500 ms.
- **[Empates]** → Son raros: hacen falta mazo y completas vacíos y nadie que pueda mover.
