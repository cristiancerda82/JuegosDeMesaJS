## Context

El Rummy 500 se parece al Remigio (bajar y añadir en una mesa común, turnos de robar, bajar y descartar) y al Gin Rummy (baraja francesa, agrupar la mano). Reutiliza:
- la forma de turno y de mesa del Remigio: fases `robar` y `bajar`, combinaciones con identificador, la IA básica que baja y añade todo lo que puede, y su difícil por simulación con `candidatas` y `horizonte`;
- la búsqueda exacta sobre máscaras de bits de `chinchon-combinaciones.ts`, adaptada al As alto y bajo;
- las manos encadenadas con `resultadosManos` y un resumen que pausa la sesión.

No reutiliza el código de combinaciones del Remigio: está atado a la baraja española doble y a los comodines. Lo nuevo es el descarte abierto con la carta obligada, el As que vale distinto según dónde esté y los puntos de lo que cada uno pone en la mesa.

## Goals / Non-Goals

**Goals:**
- Rummy 500 clásico de 2 a 4 jugadores: descarte abierto con obligada, As alto o bajo sin vuelta, cerrar con descarte final, partida a 500.
- IA normal que baja mucho y pronto, y difícil por simulación del robo y del descarte.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Comodines, cerrar sin descartar, «¡Rummy!», otras metas.

## Decisions

### 1. Cartas y combinaciones (`juegos/rummy-500-combinaciones.ts`)
- Una sola baraja: las cartas son `IdCarta` de la francesa.
- Posición de escalera: As = 1 o 14, del 2 a la K, su valor. Una escalera es un palo con un tramo `desde..hasta` de posiciones entre 1 y 14, de al menos 3; no puede contener a la vez el 1 y el 14.
- `CombinacionRummy = { id, tipo: 'grupo' | 'escalera', cartas: { carta, de: Asiento }[] }`, con las cartas de una escalera en orden y el As en su puesto (abajo o arriba).
- `puntosEnMesa(carta, combinacion)`: el As vale 1 en una escalera cuyo As está abajo, 15 en el resto. `puntosEnMano(carta)`: As 15, del 2 al 10 su número, figuras 10.
- `bajadasPosibles(mano)`: todos los grupos de 3 y 4 y todos los tramos de escalera de 3 o más que se pueden formar con la mano (el As puede usarse abajo o arriba). Son pocas decenas con 14 cartas.
- `anadidosPosibles(mano, mesa)`: carta y combinación (la cuarta de un grupo de 3, o la que alarga una escalera por un extremo).
- `mejorBajadaRummy(mano)`: la agrupación que más puntos baja, por búsqueda exacta con memoria sobre la máscara de cartas (como `mejorReparto`), contando el As de una escalera baja como 1.

### 2. Estado y acciones (`juegos/rummy-500.ts`)
`EstadoRummy500`:
- `config: { jugadores: 2..4 }`, `azar`, `repartidor`, `numeroMano`;
- `manos`, `mazo` (se roba la última), `descarte` (de abajo arriba);
- `combinaciones`, `siguienteId`;
- `turno`, `fase: 'robar' | 'bajar'`;
- `obligada: IdCarta | null` (la de más abajo cogida del descarte, pendiente de usar) y `noDescartar: IdCarta | null` (la cogida sola de arriba);
- `puestas: IdCarta[][]`: lo que cada jugador ha puesto en la mesa en la mano, para puntuar;
- `puntos`, `ultimaAccion`, `resultadosManos`.

Acciones: `robarMazo`, `robarDescarte{ desde }` (índice en el descarte), `bajar{ cartas }`, `anadir{ combinacion, carta, arriba? }` (`arriba` decide en qué extremo va un As que cabe en los dos) y `descartar{ carta }`.

`accionesLegales`:
- **en `robar`:** `robarMazo` si hay mazo; `robarDescarte` desde la de arriba siempre; desde una más abajo, solo si la carta de ese índice se puede usar con la mano más las cogidas (está en alguna bajada posible o se puede añadir a la mesa) dejando al menos una carta para descartar.
- **en `bajar`:**
  - `bajar` para cada bajada posible que deje al menos una carta en la mano;
  - `anadir` para cada añadido posible que deje al menos una;
  - `descartar` con cada carta salvo `noDescartar`, y solo si no hay `obligada` pendiente.

Al bajar o añadir la obligada, se limpia. Si nadie descarta la última carta y el siguiente va a robar con el mazo vacío, la mano termina: se comprueba al pasar el turno, para que el jugador sin mazo nunca quede sin acciones.

`ResultadoManoRummy500 = { cerro: Asiento | null, bajado: number[], enMano: number[], cartasEnMano: IdCarta[][], puntosMano: number[], totalesTras: number[] }`.

### 3. Vista
`miMano`, `cartasEnMano`, `mazo` (número), `descarte` (todo), `combinaciones`, `siguienteId`, `turno`, `fase`, `obligada`, `noDescartar`, `puestas` (lo de cada uno en la mesa es público), `puntos`, `repartidor`, `numeroMano`, `ultimaAccion` y `resultadosManos`.

### 4. IAs
- **Normal** (`iaRummy500Basica`):
  - **robar:** para cada carta del descarte desde la que se puede coger, valora: puntos que puede bajar y añadir con la mano más lo cogido (con `mejorBajadaRummy` y los añadidos) menos los que ya podía bajar sin cogerlo, menos la mitad de los puntos de las cogidas que no usaría. Coge desde la de mejor valor si es positivo; si no, roba del mazo (y si no hay mazo, la de arriba del descarte);
  - **bajar:** primero la obligada, si la hay (la bajada o añadido que la usa y más puntos pone); después baja las combinaciones de `mejorBajadaRummy` y añade lo que pueda, una acción por decisión, mientras quede más de una carta;
  - **descartar:** como en el Gin Rummy, la suelta que menos le sirve y más puntos vale.
- **Fácil:** `conErrores` sobre la normal.
- **Difícil:** `porSimulacion(iaRummy500Basica, SIMULABLE_RUMMY_500)`:
  - `candidatas`: en `robar`, el mazo y como mucho 3 cartas del descarte (las de mejor valor para la normal); al descartar, los 4 primeros descartes en el orden de la normal; si la normal baja o añade, decide ella;
  - `reconstruir`: las manos ajenas y el mazo salen al azar de las cartas que no se ven (ni en la mano propia, ni en el descarte, ni en la mesa);
  - `valorar`: los puntos de la mano para el asiento menos la media de los rivales (si no ha terminado, lo puesto en la mesa menos lo que queda en la mano), más el bono de partida;
  - `horizonte` 12, `reconstrucciones` 8 y `presupuesto` 32, como el Remigio.

**Prueba de fuerza:** la difícil gana 144 de 200 partidas a la normal (72 %), con decisiones de 61 ms como mucho.

**Reconstrucción con la obligada:** si el jugador en turno tiene una obligada pendiente, su mano se reconstruye primero, con las cartas que cogió del descarte y, si hace falta, con cartas ocultas que formen con la obligada una combinación; si no, el estado reconstruido podría no dejarle usarla.

### 5. Cliente
- **`MesaRummy500.svelte`:** a partir de la del Remigio, sin comodines ni cambios:
  - el descarte en abanico, con las cartas desde las que se puede coger resaltadas; tocar una la coge con las de encima;
  - la carta obligada, marcada en la mano con un aviso;
  - las combinaciones de la mesa, con un punto del color de quien puso cada carta;
  - «Bajar» con las cartas elegidas; con una carta elegida, tocar una combinación añade; «Descartar» o arrastrar al descarte.
- **`ResumenRummy500.svelte`:** quién cerró o que se acabó el mazo, y de cada jugador lo bajado, lo que le quedó, la mano y el total.
- **Pausas:** 600 ms tras cada acción de la IA, como el Remigio.
- **Fin:** los puntos ordenados y el resumen de la última mano.

## Risks / Trade-offs

- **[Muchas acciones legales]** → con 13 cartas y mesa llena hay decenas de bajadas y añadidos; la difícil solo simula el robo y el descarte, y la normal decide lo demás de forma voraz.
- **[El As en los dos extremos]** → solo una escalera del 2 a la K admite un As por los dos lados; el parámetro `arriba` decide dónde va, y en el resto de casos se ignora.
- **[Partidas largas]** → con 4 jugadores y 7 cartas hacen falta muchas manos para llegar a 500; el E2E de partida completa juega con 2 jugadores y la UI en modo rápido.
- **[Fuerza de la difícil]** → como en el Remigio, si la simulación del robo y el descarte no gana a la normal, se pregunta al usuario.
