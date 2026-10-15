## Context

Hasta ahora todos los juegos son por turnos: en cada momento solo un asiento tiene acciones legales (o, en el pase de los Corazones, se elige por orden). La `Sesion` del cliente aprovecha eso: busca la primera IA con acciones, bloquea al humano, espera `PAUSA_IA_MS` y la hace jugar.

El contrato del motor, en cambio, ya permite que varios asientos tengan acciones legales a la vez: la suite genérica elige entre los asientos con acciones, y `aplicar` valida por asiento. El Burro aprovecha eso en el motor y obliga a cambiar solo la sesión del cliente.

## Goals / Non-Goals

**Goals:**
- El Burro completo de 3 a 5 jugadores: reparto por números, pase simultáneo, plantarse, mano nula, letras y fin.
- Un modo simultáneo en la `Sesion`, genérico, en el que el humano no espera a la IA y cada IA tiene su propio retraso.
- La IA básica y la mesa del Burro.

**Non-Goals:**
- Comodines, cucharas, faroles, más de 5 jugadores y el juego en red.
- Cambiar el comportamiento de la sesión en el resto de juegos.

## Decisions

### 1. Estado (`juegos/burro.ts`)
`ConfigBurro { jugadores: 3 | 4 | 5 }`.

`EstadoBurro` guarda:
- `config`, `azar`, `numeroMano`, `manos: IdCarta[][]`;
- `fase: 'pase' | 'plantando'`;
- `pases: (IdCarta | null)[]` (elecciones pendientes, ocultas para los demás);
- `pasadas` y `recibidas: (IdCarta | null)[]` (lo del último intercambio; cada uno ve solo lo suyo);
- `intercambios: number` (de la mano);
- `plantados: Asiento[]` en orden de llegada;
- `letras: number[]` y `ultimaMano: ResultadoManoBurro | null`.

`ResultadoManoBurro = { nula: true } | { nula: false; primero: Asiento; cuatro: IdCarta[]; orden: Asiento[]; burro: Asiento }`.

Acciones: `pasar {carta}` y `plantarse`.

**Reparto:** con el azar de la partida se barajan los 10 números de la baraja española y se toman los `jugadores` primeros; se barajan sus `4 × jugadores` cartas y se reparten 4 a cada uno.

**Legales:**
- Partida terminada: ninguna.
- `pase`: si el asiento ya eligió, ninguna. Si no, `pasar` cada carta de su mano, en orden, y `plantarse` si sus 4 cartas son del mismo número.
- `plantando`: `plantarse` si el asiento no está en `plantados`.

**Transiciones:**
- `pasar`: guarda la elección. Si ya han elegido todos, intercambia: el asiento `a` da su carta a `(a + 1) % n`; se guardan `pasadas` y `recibidas`, se vacían `pases` y suma `intercambios`. Si llega a 50 sin plantados, mano nula.
- `plantarse`: se añade a `plantados`. Si es el primero, pasa a `plantando`, anula `pases` y guarda sus 4 cartas en el resultado. Cuando quedan `n − 1` plantados, el que falta suma una letra, se registra `ultimaMano` y, si llega a 5, termina la partida. Si no, se reparte la mano siguiente.

**Resultado:** `ganadores` son todos menos el burro; `empate: false`.

### 2. Vista
La vista muestra:
- `miMano`, `miPase`, `pasada`, `recibida` y `eligieron: boolean[]`;
- `fase`, `plantados`, `letras`, `numeroMano`, `intercambios`, `cartasEnMano` y `ultimaMano`.

En `ultimaMano` se ven las 4 cartas del primero que se plantó, aunque sean de una mano ya repartida de nuevo.

El oráculo de la suite del contrato excluye:
- `pasada`, porque el asiento sabe a quién se la dio;
- las 4 cartas de `ultimaMano`, porque se enseñaron al terminar la mano.

### 3. IA básica (`ia/burro-basica.ts`)
- Si `plantarse` es legal, se planta.
- Si no, cuenta las cartas por número, toma los números con menos cartas y elige al azar uno de ellos (con su generador), y pasa la primera carta de ese número.

Las simulaciones de los tests eligen en cada paso, con un generador sembrado, qué asiento actúa entre los que tienen acciones, para no favorecer siempre a los mismos asientos al reaccionar.

### 4. Sesión simultánea (cliente)
`DefJuego` gana un campo opcional:

```ts
simultaneo?: { esperaIA(vista: V, accion: A, azar: EstadoAzar): { ms: number; azar: EstadoAzar } };
```

Sin él, la sesión funciona como hasta ahora. Con él, `#continuar`:
1. Si hay una pausa de `pausaTras` en curso, espera (bloquea a todos, como siempre).
2. Desbloquea al humano (`bloqueada = false`, `pensando = null`).
3. Para cada asiento de la IA con acciones legales, calcula su decisión (sin guardar aún el azar del agente):
   - si ya tiene un temporizador con la misma acción prevista, lo mantiene;
   - si no, cancela el que tuviera y programa uno nuevo con el retraso de `esperaIA` (por un azar propio de esperas, sembrado con la semilla, el asiento y el número de jugadas).
4. A los asientos que ya no tienen acciones se les cancela el temporizador.

Cuando un temporizador vence, la acción prevista se aplica con `#aplicar` si sigue siendo legal (y entonces se guarda el azar del agente). Cualquier acción aplicada, del humano o de la IA, vuelve a llamar a `#continuar`.

Mantener el temporizador cuando la acción no cambia evita que cada plantada reinicie el reloj de los demás. Cambiarlo cuando cambia la acción evita que una IA que iba a pasar carta se plante de inmediato al cambiar de fase.

`pausar` cancela todos los temporizadores y `reanudar` vuelve a llamar a `#continuar`, con retrasos nuevos.

**Retrasos del Burro** (`DEF_BURRO.simultaneo.esperaIA`), multiplicados por `FACTOR_PAUSAS`:
- `pasar`: entre 400 y 1.200 ms;
- `plantarse` con 4 iguales (el primero): entre 1.500 y 4.000 ms;
- `plantarse` como reacción: entre 1.000 y 3.500 ms.

El guardado no cambia: se guardan las jugadas en el orden en que se aplicaron, y `repetir` las reproduce igual.

### 5. Cliente (`MesaBurro.svelte`)
- **Disposición:** el jugador abajo y los rivales en arco por arriba, en orden de asiento de derecha a izquierda (el asiento 1 a la derecha, al que se pasa). Cada rival muestra su nombre, sus letras y su mano: 4 dorsos en abanico o, si se ha plantado, tumbados en línea sobre la mesa.
- **Pase:** se toca una carta de la mano (o se arrastra al rival siguiente) para elegirla; queda levantada con «Pasas a Rival 1». Tras el intercambio, la carta recibida se resalta un momento. Los rivales que ya han elegido muestran su carta elegida separada, boca abajo.
- **«¡Me planto!»:** botón grande siempre visible con el mismo estilo. Si no es legal, `sesion.jugar` devuelve `false` y no pasa nada.
- **Pausas (`pausaTras`):** una breve tras el intercambio, para ver moverse las cartas, y la del fin de mano. El resumen lo pausa el panel, como en el resto de juegos de manos.
- **Panel de fin de mano:** las 4 cartas del primero que se plantó, el orden de los demás, quién lleva letra (o «Mano nula») y las letras de todos.
- **Fin:** «¡Burro!» o «Te has librado», con las letras de cada jugador.

## Risks / Trade-offs

- **Carreras entre el humano y la IA** → todo pasa en el hilo de JavaScript; cada acción llega por separado a `#aplicar`, que valida con `aplicar`. Si la acción prevista de una IA ya no es legal al vencer su temporizador, se descarta y se recalcula.
- **Partidas no reproducibles con la semilla** → solo lo que depende de la velocidad del jugador; el reparto y las decisiones de la IA siguen sembrados, y el guardado reproduce la partida exacta.
- **Con `?rapido` (E2E), las IAs reaccionan casi al instante** → en los tests el jugador casi siempre será el último en reaccionar a una plantada ajena. Para probar adelantarse, se busca con el motor una semilla en la que el jugador recibe 4 iguales al repartir y se planta el primero.
- **Manos infinitas con jugadores al azar** → la mano nula a los 50 intercambios acota la partida.
- **Cambiar la `Sesion` puede romper otros juegos** → el modo simultáneo solo se activa con el campo nuevo, y la suite E2E completa se ejecuta al final.
