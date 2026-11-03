## Context

El Truco argentino y el Truc valenciano comparten la baraja, la jerarquía de las cartas, el reparto de 3 cartas, las bazas sin palo obligatorio, las pardas y los puntos de envido. Cambian las apuestas:
- **Envido:** una cadena de envido, envido, real envido y falta envido, en lugar del envit, torne y falta.
- **Truco:** truco, retruco y vale cuatro, sin joc fora.

También cambian el cierre del envido cuando se acepta el truco y la cuenta: una partida a 30 en lugar de cames de 12 piedras. El motor se copia del Truc y se adapta, reaprovechando sus funciones puras.

## Goals / Non-Goals

**Goals:**
- Truco de 2 o de 4 a 30, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- La flor, la partida a 15, las señas y el punto extra por irse al mazo sin cantar el envido.

## Decisions

### 1. Cartas y bazas (`juegos/truco.ts`)
- Se importan de `juegos/truc` `rangoTruc`, `puntosEnvit` y `ganadorDeLaMano`: la jerarquía, los puntos de envido y las pardas son las mismas.
- `resolverBaza` se copia del Truc: la baza parda, quién sale tras ella y la mano que termina en cuanto se sabe el ganador.

### 2. Estado
- **Config:** `{ jugadores: 2 | 4, meta: 30 }`. La meta va en la config para que las pruebas usen partidas más cortas; el cliente juega siempre a 30.
- **Como el Truc:** `repartidor`, `manos`, `turno`, `mesa`, `bazasJugadas`, `ultimaBaza` y `resultadosManos`.
- **Envido:** `{ cantos, estado, quien, responde, valor, ganador, mostrado }`, donde `cantos` es la cadena (`'envido' | 'real' | 'falta'`).
- **Truco:** `{ nivel, pendiente, quien, responde, puedeSubir }`, con `nivel` de 0 a 3.
- **Puntos:** `puntos` por bando.

### 3. Acciones
- `jugar`, `envido`, `realEnvido`, `faltaEnvido`, `truco`, `quiero`, `noQuiero` y `meVoy`.
- **Cantos posibles del envido:** `envido` si hay menos de dos envidos y aún no hay real ni falta; `realEnvido` si aún no hay real ni falta; `faltaEnvido` si aún no hay falta.
- **Valores del envido:**
  - `valorCantos(cantos, puntos, meta)`: la suma (envido 2, real 3) o, con falta, `meta - max(puntos)`.
  - No querido: `max(1, valorCantos(cantos sin el último))`.
- **Se puede cantar envido:** primera baza, sin envido aún, el asiento no ha jugado su carta y `truco.nivel === 0` (aún no se ha aceptado ningún truco). Al responder a un truco pendiente sigue valiendo: «el envido está primero».
- **Cierre de la mano:** se suma el envido; si nadie llega a la meta, el truco. La partida termina al llegar a la meta.

### 4. Vista
La del Truc con el envido, el truco, `valorMano` y `puntos` en lugar de las piedras y las cames.

### 5. IAs
- **Normal (`ia/truco-basica.ts`):** la del Truc con los cantos del Truco y los umbrales de la spec. `fuerzaManoTruco` es la `fuerzaMano` del Truc, copiada para la vista del Truco; sus umbrales son constantes del módulo, sin exportar, para no chocar con los del Truc en `index.ts`.
- **Difícil (`ia/reconstruir/truco.ts`):** `SIMULABLE_TRUCO`.
  - **Reconstrucción:** la del Truc (los puntos de envido mostrados tienen que cuadrar), con la vista del Truco.
  - **Apuestas:** `decideLaBase` cuando hay una apuesta pendiente; en su turno, `candidatas` deja las cartas si la normal juega y la apuesta de la normal si apuesta, como en el Truc.
  - **Valoración:** los puntos de la mano de su bando menos los del otro, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 40 y `presupuesto` 120, como en el Truc. La difícil gana a la normal 128 de 200 partidas con 2 (40 ms como máximo) y 136 de 200 con 4 (72 ms).

### 6. Cliente
- **`MesaTruco.svelte`:** a partir de `MesaTruc`, con los botones y los avisos del Truco y los puntos en malas y buenas.
- **`ResumenTruco.svelte`:** el envido, el truco y los puntos de cada bando en la mano y tras ella.
- **Opciones:** 2 o 4 jugadores.
- **Sala de espera:** el Truco entra en la lista de juegos por parejas de `SalaEspera.svelte`, como el Truc.
- **Fin:** como el Truc, en la rama de parejas de `Fin.svelte`, con los puntos de cada bando.

## Risks / Trade-offs

- **[Duplicar el Truc]** → Se copia el motor y se adapta en lugar de generalizarlo: las apuestas y la cuenta son distintas en casi todo, y tocar el Truc no aporta nada al usuario. Lo que es igual (la jerarquía, el envido y las pardas) se importa.
