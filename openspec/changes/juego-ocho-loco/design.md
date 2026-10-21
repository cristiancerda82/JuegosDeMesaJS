## Context

El Ocho loco no necesita piezas nuevas del motor:
- **Reparto:** la baraja francesa, `barajar` y `repartir` ya existen.
- **Manos y puntos:** el Cinquillo ya encadena manos con `resultadosManos`, totales y reparto rotatorio, y su difícil simula el resto de la mano.
- **Reconstrucción:** `Ocultas` y `manosOcultas` reparten las cartas que no se ven.
- **Mesa:** `AsientoRival` y `lado` colocan de 1 a 4 rivales alrededor.

Lo nuevo es la regla de casar por palo o número, el 8 que elige palo, el turno en dos pasos (robar y luego jugar o pasar) y el mazo que se rehace con el descarte.

## Goals / Non-Goals

**Goals:**
- Ocho loco completo de 2 a 5 jugadores con partida a 100.
- IA básica que guarda los ochos y elige bien el palo, y una difícil por simulación que le gana.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Las variantes de la propuesta (más cartas especiales, robar hasta poder jugar, una sola mano, jugar varias iguales).

## Decisions

### 1. Estado y acciones
`EstadoOchoLoco`:
- `config: { jugadores: 2..5 }`, `azar`, `repartidor`;
- `manos`, `mazo` (se roba el último), `descarte` (la de arriba es la última);
- `palo`: el palo que toca (el de la carta de arriba, o el elegido con un 8);
- `turno`, `robada: IdCarta | null` (la carta robada en este turno, que es la única que se puede jugar después);
- `pasesSeguidos`: cuántos han pasado seguidos sin poder robar, para detectar la mano bloqueada;
- `ultimas: (UltimaOchoLoco | null)[]`: la última acción de cada asiento;
- `faltas: (FaltaOchoLoco | null)[]`: de la última vez que robó cada asiento en la mano, el palo que tocaba y el número de la carta de arriba (no tenía ninguna que casara);
- `resultadosManos` y `totales`, como en el Cinquillo.

Acciones:
- `jugar{carta, palo?}`: `palo` solo con un 8, y entonces hay una acción por cada palo. Como mucho son unas 30 acciones;
- `robar`;
- `pasar`.

`accionesLegales`:
- si ya robó: jugar la robada si casa (con sus cuatro palos si es un 8), y `pasar`;
- si no, las cartas que casan (los ochos con cuatro palos cada uno);
- si no hay ninguna: `robar` si quedan cartas en el mazo o en el descarte bajo la de arriba, y si no, `pasar`.

Transiciones:
- **`jugar`:** la carta sale de la mano y va arriba del descarte; `palo` pasa a ser el elegido o el de la carta; `robada` y `pasesSeguidos` se ponen a cero y le toca al siguiente. Si la mano se quedó vacía, se cierra la mano.
- **`robar`:** apunta la falta del jugador. Si el mazo está vacío, primero se baraja el descarte menos la de arriba con el `azar` del estado. Se roba la última carta y se guarda en `robada`; el turno no cambia.
- **`pasar`:** le toca al siguiente. Si pasa sin haber robado (no quedaba nada), suma uno a `pasesSeguidos`; si pasa tras robar, lo pone a cero. Cuando llega al número de jugadores, la mano se cierra bloqueada.

**Por qué el 8 lleva el palo en la acción:** elegirlo en una acción aparte haría un estado intermedio más, y como mucho hay cuatro ochos con cuatro palos: 16 acciones.

### 2. Cierre de la mano y partida
Al cerrar la mano se calculan los puntos de lo que le queda a cada uno (8 = 50, figuras 10, el resto su número). Gana la mano quien se quedó sin cartas o, si está bloqueada, quien tenga menos puntos. Si hay empate en el mínimo, nadie se apunta nada.
`ResultadoManoOchoLoco = { ganador: Asiento | null, bloqueada, puntosEnMano, ganados, totalesTras }`.

Si algún total llega a 100, la partida termina y `resultado` da como ganador al de más puntos (solo puede llegar uno por mano, porque solo puntúa el ganador de la mano). Si no, se reparte la siguiente mano con el repartidor siguiente.

### 3. Vista
- `miMano`, `cartasEnMano`, `mazo` (número), `descarte` (todas las cartas, son públicas), `palo`, `turno`;
- `robe`: si el jugador en turno ya robó (público); `robada`, la carta, solo para él;
- `ultimas`, sin la carta robada;
- `pasesSeguidos` y `faltas`: lo que se sabe de quien robó (el palo que tocaba y el número de la carta de arriba), para la reconstrucción;
- `resultadosManos`, `totales` y `repartidor`.

### 4. IAs
Lo que más pesa en el Ocho loco es guardar los ochos: medido en 2.000 partidas a 2 jugadores, quien los guarda gana el 72 % contra quien no. Entre estrategias que los guardan apenas hay diferencia (elegir palo, carta o jugar la robada de otra forma no se aparta del 50 %), y una difícil que simulaba sobre una normal que ya los guardaba ganaba 51 de 200 a 4 jugadores (lo justo son 50). Por eso los niveles se separan así:
- **Normal** (`iaOchoLocoBasica`, determinista): entre las jugadas que casan, ochos incluidos, la que la deja con más cartas del palo que tocará (con un 8, el palo del que más le quedan), más los puntos de la carta / 100 para desempatar. Juega la robada si casa; si no tiene jugables, roba o pasa. Gana 392 de 500 al azar a 2 jugadores.
- **Fácil:** `conErrores` sobre la normal.
- **Experta** (`iaOchoLocoExperta`): igual, pero no juega un 8 mientras tenga otra carta que case.
- **Difícil:** `porSimulacion(iaOchoLocoExperta, SIMULABLE_OCHO_LOCO)`. Gana 73 de 200 a la normal a 4 jugadores y 150 de 200 a 2 jugadores.
  - `reconstruir`: las manos ajenas y el mazo se reparten al azar entre las cartas que no se ven (todas menos la mano propia y el descarte). Quien robó en esta mano no tenía entonces ni ese palo, ni ese número, ni ochos (`faltas`, públicas en la vista): todas sus cartas menos una se eligen entre las que lo cumplen, y si no alcanzan, se reparte sin la restricción. Si el jugador en turno es otro y ya robó, su robada es la carta libre de su mano;
  - `valorar`: lo que gana cada uno en la mano menos los puntos que le quedan, frente a la media de los demás, más el bono de partida;
  - `reconstrucciones: 60`, `presupuesto: 400`: unos 90 ms como mucho por decisión en escritorio.

### 5. Cliente
- **`MesaOchoLoco.svelte`:**
  - los rivales con `AsientoRival` (número de cartas y su última acción);
  - en el centro, el mazo con su número y el descarte con la carta de arriba y una insignia del palo que toca;
  - abajo, la mano ordenada por palo y número, con las jugables destacadas; tocar un 8 abre cuatro botones de palo;
  - los botones «Robar» y «Pasar» según las acciones legales;
  - una línea con los puntos de cada jugador.
- **`ResumenOchoLoco.svelte`:** entre manos, como el resumen del Cinquillo: quién ganó, los puntos de cada mano y los totales.
- **Pausas:** 600 ms tras cada carta jugada por la IA y 400 ms tras robar o pasar.
- **Fin:** el ganador y la tabla de puntos.

## Risks / Trade-offs

- **[Manos largas con 2 jugadores]** → con el mazo que se rehace, una mano puede alargarse; las partidas al azar de los tests tienen tope de pasos y la mano bloqueada corta los casos sin salida.
- **[Niveles poco distintos]** → entre estrategias razonables casi todo es azar; la diferencia entre normal y difícil está en guardar los ochos, que es justo lo que más pesa.
- **[Tiempo de la simulación]** → las manos son cortas (5–7 cartas), así que 150 simulaciones caben de sobra en 500 ms.
