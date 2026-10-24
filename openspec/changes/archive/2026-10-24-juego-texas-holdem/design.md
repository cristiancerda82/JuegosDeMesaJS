## Context

El Texas Hold'em se parece al Blackjack en las fichas y en el resumen entre manos, pero es un juego de apuestas entre jugadores con información oculta. Reutiliza:
- la baraja francesa, `barajar` y el azar del estado;
- las manos encadenadas con `resultadosManos` y un resumen que pausa la sesión;
- `conErrores` para la fácil y el registro en `IAS` y `red.ts`.

Lo nuevo es:
- el ciclo de apuestas sin límite, con la subida mínima y el all-in corto;
- los botes secundarios;
- la evaluación de manos de póker;
- una IA difícil que no simula partidas, sino que estima su probabilidad de ganar.

## Goals / Non-Goals

**Goals:**
- Torneo No-Limit de 2 a 6 con ciegas crecientes, botes secundarios y showdown correctos.
- IA normal por fuerza de mano y difícil por equity, que gane a la normal.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Límite fijo, cash, antes, reentradas, enseñar sin showdown.

## Decisions

### 1. Evaluación de manos (`juegos/holdem-manos.ts`)
- `valorMano5(cartas)` → número comparable: la categoría (0–8) en las cifras altas y los desempates en base 15 debajo. Se ordenan los valores (As = 14) por cuántas veces aparecen y luego por valor. La escalera A-2-3-4-5 cuenta con el 5 como carta alta.
- `mejorMano(siete)` → `{ valor, categoria, cartas }`: prueba las 21 combinaciones de cinco. Es lo bastante rápido para la equity de la difícil: unas 300 simulaciones con hasta 5 rivales caben de sobra en 500 ms. Si no cupiera, se baja el número de simulaciones.
- `NOMBRES_MANO` para el cliente: «Escalera de color», «Póker», «Full», «Color», «Escalera», «Trío», «Doble pareja», «Pareja» y «Carta alta».

### 2. Estado (`juegos/holdem.ts`)
`EstadoHoldem`:
- `config: { jugadores: 2..6 }`, `azar`, `numeroMano`, `boton`;
- `fichas: number[]` (lo que le queda a cada uno, sin lo apostado), `eliminados: boolean[]`;
- `manos: IdCarta[][]` (vacía para los eliminados), `mazo`, `comunes` (las descubiertas);
- `fase: 'preflop' | 'flop' | 'turn' | 'river'`, `turno`;
- `apuestas: number[]` (de la ronda), `aportado: number[]` (en toda la mano, para los botes), `retirados`, `allIn`;
- `apuestaMaxima`, `ultimaSubida` (tamaño de la última subida completa), `pendientes: boolean[]` (quién tiene que actuar todavía), `puedeSubir: boolean[]` (falso tras un all-in corto para quien ya había actuado);
- `ultimaAccion`, `eliminacion: Asiento[]` (orden en que caen) y `resultadosManos`.

Acciones: `retirarse`, `pasar`, `igualar` y `subir{ hasta }` (cantidad total de la ronda; apostar es subir desde 0).

### 3. Ciclo de apuestas
- **`accionesLegales`:** `retirarse` siempre (salvo si puede pasar gratis, que también se permite retirarse). `pasar` si `apuestas[a] === apuestaMaxima`. `igualar` si no. `subir{hasta}` para cada entero desde `min(fichas+apuesta, apuestaMaxima + max(ultimaSubida, ciegaGrande))` hasta `fichas+apuesta`, si `puedeSubir[a]` y le quedan fichas por encima de lo que iguala. Con 100 fichas y 6 jugadores la lista llega a unos cientos de acciones. Es aceptable para el motor, y el cliente busca la acción con la cantidad elegida.
- **Subir:** si la subida (`hasta − apuestaMaxima`) es al menos `ultimaSubida`, es completa: actualiza `ultimaSubida`, marca a todos los demás activos como pendientes y les deja subir. Si es un all-in corto, los que ya habían actuado pasan a pendientes pero sin poder subir; los que no habían actuado conservan lo que tenían.
- **Fin de ronda:** cuando nadie con fichas está pendiente. Si queda un solo jugador sin retirarse, gana el bote. Si como mucho uno puede seguir apostando, se descubren las comunes que faltan y hay showdown. Si no, se descubre la siguiente calle y empieza el primero activo después del botón.
- **Ciegas:** se ponen al repartir, como apuestas de la ronda preflop; la grande marca `apuestaMaxima` y `ultimaSubida` (= ciega grande). La ciega grande queda pendiente, así que puede subir aunque todos igualen.

### 4. Botes y showdown
- **Botes:** con los niveles de `aportado` de quienes siguen en la mano, de menor a mayor, cada nivel forma un bote. Ese bote recibe de cada jugador (también de los retirados) el mínimo entre lo que aportó y el nivel, menos lo de los botes anteriores. Participan los no retirados que aportaron al menos ese nivel.
- **Reparto:** en cada bote gana la mejor `mejorMano`. Si empatan, a partes iguales, y el resto va de uno en uno a los ganadores en orden desde el botón.
- **`ResultadoManoHoldem`:** `{ comunes, enseñadas: { asiento, cartas, categoria }[], botes: { cantidad, ganadores, porGanador }[], sinShowdown: Asiento | null, fichasTras, eliminadosTras }`.
- **Tras la mano:** se eliminan los que se quedan a 0, en orden por las fichas que tenían al empezar la mano (de menos a más). Si queda uno, termina; si no, el botón pasa y se reparte con las ciegas del nivel de la nueva mano.
- **`resultado`:** el ganador es el que queda; `puntos` es la posición de cada uno (el ganador 1, el último eliminado 2…), para la clasificación.

### 5. Vista
- `miMano`;
- `comunes`, `fichas`, `apuestas`, `retirados`, `allIn`, `eliminados`;
- `boton`, `ciegas` (las de la mano), `numeroMano`, `fase`, `turno`;
- `bote` (lo de rondas anteriores) y `botes` calculados con lo de la ronda;
- la acción legal mínima de subida y el máximo, para el cliente;
- `ultimaAccion`, `eliminacion` y `resultadosManos`.

### 6. IAs (`ia/holdem-basica.ts`)
- **Normal** (`iaHoldemBasica`):
  - **antes del flop:** una puntuación de las dos cartas (al estilo de Chen: la carta alta, la pareja, si son del mismo palo y si van seguidas) con tres tramos: subir a 3 ciegas grandes o resubir al triple, igualar si cuesta como mucho 3 ciegas grandes, o pasar o retirarse;
  - **después:** la categoría de la mejor mano con las comunes (de pareja alta para arriba, apuesta o sube ¾ del bote; con pareja baja iguala si cuesta poco) y los proyectos de color o escalera abierta (iguala si cuesta menos de un tercio del bote);
  - **con menos de 10 ciegas grandes:** all-in con las manos del tramo alto.
- **Fácil:** `conErrores` sobre la normal.
- **Difícil** (`iaHoldemExperta`):
  - **equity:** con N = 300 simulaciones (menos si hay muchos rivales), reparte al azar dos cartas a cada rival que sigue en la mano y las comunes que faltan, y cuenta las victorias (los empates cuentan su parte);
  - **probabilidades del bote:** `precio = aIgualar / (bote + todas las apuestas + aIgualar)`;
  - **decisión:**
    - con equity menor que el precio, se retira (o pasa si es gratis);
    - con equity muy superior a `1 / jugadores en la mano` (más de 1,5 veces), sube entre medio bote y el bote según la equity;
    - si no, iguala o pasa;
    - si nadie ha apostado y la equity es baja, apuesta de farol medio bote con un 10 % de probabilidad, sacada de su azar;
  - **antes del flop**, para no simular de más, usa también la equity, con menos simulaciones (150).
  - No usa `porSimulacion` ni reconstrucción.
- **Prueba de fuerza:** la difícil contra la normal, 200 partidas de 4 jugadores (uno contra tres, alternando asientos), tiene que ganar más de una de cada cuatro. Gana 74 de 200 (37 %).
- **Ajustes al medir:**
  - La primera normal, que solo jugaba las manos muy buenas, perdía contra quien sube a lo loco (el jugador al azar casi siempre sube, porque hay muchas más subidas que otras acciones). Ahora iguala si el precio frente al bote lo compensa, con una probabilidad de ganar estimada a ojo según la fuerza de su mano y los rivales. Así gana 117 de 400 partidas al azar (29 %) y la mayoría de duelos contra la fácil.
  - La difícil daba a los rivales manos al azar y sobrevaloraba las suyas frente a quien sube, que casi nunca lo hace con cartas malas. Ahora, a quien ha apostado o subido en la ronda le da manos de su rango (las jugables antes del flop).

### 7. Cliente
- **`MesaHoldem.svelte`:**
  - arriba, los rivales en una rejilla de hasta 5 casillas: nombre, fichas, apuesta, marca de botón, «Retirado», «All-in» o «Eliminado», y dos dorsos o sus cartas en el showdown;
  - en el centro, las 5 casillas de cartas comunes, el bote y los botes secundarios, y las ciegas y la mano;
  - abajo, las dos cartas propias, las fichas y la apuesta, y los botones;
  - el selector es un `input type=range` con la cantidad a la vista y atajos «Mín.», «½ bote», «Bote» y «All-in» (ajustados al rango legal).
- **`ResumenHoldem.svelte`:** entre manos, pausando la sesión.
- **Pausas:** 700 ms tras cada acción de la IA, y algo más al descubrir cartas comunes.
- **Fin:** la clasificación por posición.

## Risks / Trade-offs

- **[Muchas acciones legales]** → la subida es un entero entre el mínimo y el all-in. Los tests de contrato y el jugador al azar eligen entre todas, así que harán muchos all-in; es aceptable.
- **[Partidas largas]** → con 6 jugadores y 100 fichas un torneo puede durar muchas manos; las ciegas que suben cada 10 manos lo acotan. Los E2E de partida completa usan 2 jugadores.
- **[Fuerza de la difícil]** → la equity contra manos al azar sobrestima frente a rivales que se retiran con manos malas; aun así, frente a una normal que se retira mucho, apostar con ventaja debería ganarle.
- **[Fichas impares en los empates]** → la ficha que sobra va al primero desde el botón; un test lo comprueba.
