## Context

Los juegos de la suite cumplen el contrato `Juego<C, E, A, V>` del motor y se prueban con la suite genérica `describirContrato`, cuyo oráculo comprueba que la vista no enseña cartas ocultas.

El Mus no tiene bazas ni triunfo, así que no aprovecha `motor/bazas.ts`. Lo que sí reaprovecha:
- **Motor:** `crearAzar`, `barajar` y `repartir`.
- **Cliente:** `AsientoRival`, `Carta`, el patrón de panel de fin de mano que pausa la sesión (Guiñote, Pocha) y la vista de 4 asientos (abajo, derecha, arriba, izquierda) de `asientos.ts`.

## Goals / Non-Goals

**Goals:**
- Mus en parejas completo: mus y descartes, los cuatro lances con declaraciones, apuestas con subidas y órdago, conteo, juegos y partida.
- Una IA básica que juegue con sentido: cortar con buenas manos, descartar, envidar y querer según la fuerza.
- Una mesa clara en el móvil, con todo lo que se ha dicho a la vista y un conteo explicado al final de cada mano.

**Non-Goals:**
- Señas, 2 o 6 jugadores, la «real» y otras variantes regionales.
- Cantidades de envite libres: se envida o sube 2 o 5, o se echa órdago.

## Decisions

### 1. Jugadas en un módulo propio (`juegos/mus-jugadas.ts`)
Funciones puras, todas parametrizadas por `reyes: 8 | 4`:
- **`rango(carta)`:** valor de 1 (As) a 10 (Rey) para Grande y Chica. Con ocho reyes, el 3 es 10 y el 2 es 1.
- **`valorJuego(carta)`:** 10 las figuras y, con ocho reyes, el 3; 1 el As y, con ocho reyes, el 2; el resto su número.
- **`pares(mano)`:** `null | { tipo: 'pareja' | 'medias' | 'duples', clave: number[] }`.
- **`puntosJuego(mano)`:** la suma de `valorJuego`.
- **`ordenJuego(suma)`:** la posición en la escala 31, 32, 40, 37…33.
- **`comparar(lance, a, b)`:** positivo si gana `a`. Grande ordena los rangos de mayor a menor y Chica de menor a mayor, y en los dos se compara lexicográficamente.
- **`ganadorLance(lance, manos, mano)`:** recorre los asientos desde la mano y se queda con el mejor, así que el más cercano gana los empates.
- **`piedrasJugada(lance, mano)`:** lo que cobra cada jugador por su jugada: 1, 2 o 3 en Pares; 3 o 2 en Juego; 1 en Punto (solo una vez por pareja).

### 2. Estado por fases (`juegos/mus.ts`)
`EstadoMus` guarda:
- **Partida:** `config` (`reyes: 8 | 4`, `puntos: 30 | 40`, `juegos: 1 | 3 | 5`, que es el mejor de N), `azar`, `repartidor`, `manos`, `mazo` y `descartes`.
- **Fase de la mano:** `fase: 'mus' | 'descarte' | 'lance'`, con `musPedido: boolean[]`, `descartados: number[]` (de la última ronda) y `turno`.
- **Lances:** `lance: 'grande' | 'chica' | 'pares' | 'juego' | 'punto'`, `lances: RegistroLance[]` y `envite: Envite | null`.
  - `RegistroLance` lleva el lance, el estado (`'paso' | 'querido' | 'noQuerido' | 'sinApuesta' | 'noSeJuega'`), las piedras y la pareja que envidó.
  - `Envite` lleva `{ pareja, total, previo, responde: Asiento[] }`.
- **Declaraciones:** `declaraciones: { pares: boolean[]; juego: boolean[] } | null`, que se calculan al cortar el mus.
- **Marcador:** `piedras: [number, number]`, `juegos: [number, number]`, `resultadosManos: ResultadoManoMus[]` y `ultimaAccion` para los avisos.

Acciones:
- `mus`, `cortar`, `descartar{cartas}`;
- `paso`, `envidar{piedras: 2|5}`, `subir{piedras: 2|5}`, `ordago`, `quiero`, `noQuiero`.

**Orden de habla en un lance:**
- Los participantes, desde la mano.
- Mientras no hay envite, cada uno habla una vez. Si hablan todos sin envidar, el lance queda en paso.
- Con envite, `responde` es la cola de rivales que aún pueden contestar, empezando por el siguiente al que envidó. Un `noQuiero` pasa al siguiente de la cola y, si se vacía, el envite queda no querido.
- Una subida o un órdago crea un envite nuevo de la otra pareja, con `previo = total` del anterior.
- Si no se quiere, cobra `previo` o 1 si `previo` es 0.

**Lances sin apuesta:** al llegar a Pares o Juego, si solo una pareja tiene la jugada (`sinApuesta`) o ninguna (`noSeJuega`), el lance se registra y se pasa al siguiente sin pedir acciones.

**Fin de los lances:**
- Al cerrarse Juego o Punto se hace el conteo.
- Si un órdago se quiere, la mano termina con el resultado de ese lance: la pareja ganadora pasa a tener los puntos del juego.

### 3. Conteo y resultado
`ResultadoManoMus` incluye:
- `manos` (las cartas de los cuatro), `mano` y `ordago: LanceMus | null`;
- `lances: { lance, estado, ganador: 0 | 1 | null, apuesta: [n, n], jugadas: [n, n] }[]`;
- `piedrasTras`, `juegoGanado: 0 | 1 | null` y `juegosTras`.

El conteo recorre los lances en orden. Suma primero la apuesta, después las jugadas, y para en cuanto una pareja llega a `puntos`. Al ganarse un juego, las piedras vuelven a `[0, 0]`.

La partida termina cuando una pareja llega a `⌈juegos / 2⌉` juegos. Si no, se reparte la mano siguiente, con el reparto en el siguiente asiento.

**Descartes:** se roba del mazo. Si no alcanza, se barajan los descartes acumulados con el azar del estado.

**Oráculo de la suite del contrato:** excluye las cartas de `resultadosManos.at(-1).manos`, que ya se han enseñado.

### 4. IA básica (`ia/mus-basica.ts`)
Fuerza de cada lance de 0 a 1, a partir de `mus-jugadas`, con un pequeño extra si es mano:
- **Grande:** número de reyes y de caballos.
- **Chica:** número de ases y de cuatros.
- **Pares:** el tipo y el rango.
- **Juego:** la 31 vale 1, la 32 0,8 y el resto entre 0,4 y 0,6.
- **Punto:** la suma.

Decisiones:
- **Mus:** corta con 31, duples, medias o tres reyes; si no, pide mus.
- **Descarte:** se queda con los reyes y las cartas que forman pares, y descarta el resto. Si todo le sirve, descarta su carta más baja.
- **Hablar sin envite:** envida 2 con fuerza ≥ 0,6, envida 5 con ≥ 0,8 y echa órdago con ≥ 0,95. Si no, pasa.
- **Contestar:** quiere si la fuerza ≥ umbral (que sube con el total del envite), sube con ≥ 0,85 y quiere el órdago con ≥ 0,7 (con un umbral más alto regala una piedra a cada órdago de farol). Si no, no quiere.

Es determinista.

### 5. Cliente (`MesaMus.svelte`)
Mesa propia en rejilla de 4 lados, como `MesaBazas`, sin tapete de bazas:
- **Rivales y compañero:** `AsientoRival`, con detalle «Mano», «Mus», «Corta», «Descarta 2», «Envida 2», «Pares», «Juego»….
- **Centro:** la lista de lances (Grande, Chica, Pares, Juego/Punto) con su estado («en paso», «7 queridas», «no quiso: 1 para vosotros», «—»), el lance en curso resaltado y el envite pendiente.
- **Info:** el marcador «Nosotros 12 · Ellos 25 (a 40) · Juegos 1–0».
- **Mano propia:**
  - Cartas propias dibujadas con `Carta`.
  - En el descarte, tocar una carta la marca o la desmarca, y «Descartar (N)» está activo con 1 a 4 cartas marcadas.
  - Los botones de las acciones legales.
- **Avisos:** la última acción de la IA con una pausa breve (`pausaTras`, según `ultimaAccion`).
- **Panel de conteo:** al aumentar `resultadosManos`, pausa la sesión y muestra las cuatro manos, la tabla por lance (ganador, piedras de apuesta y de jugadas por pareja) y el marcador. Indica el órdago si lo hubo. Se cierra con «Siguiente mano».
- **Fin:** juegos de cada pareja y el último conteo.

## Risks / Trade-offs

- **Complejidad de las apuestas** (colas de respuesta, subidas, órdagos) → tests de escenarios por cada camino y la suite del contrato con muchas partidas al azar.
- **Partidas largas entre IAs en la simulación de 1.000 partidas** → con `juegos: 1` y 30 piedras en parte de las configuraciones, y límite de pasos.
- **Variantes regionales** (piedras del punto en paso, quién contesta un envite) → se documenta la elegida para que la valide el usuario.
- **Mesa con 4 asientos y mucha información en 360 px** → el detalle de cada asiento es una sola palabra, y los lances van en una lista compacta. Hay un E2E de 360 × 640 sin scroll horizontal.
