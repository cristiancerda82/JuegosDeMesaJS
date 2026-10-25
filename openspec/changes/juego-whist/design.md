## Context

El Whist es Picas sin apuestas, sin Nil y con un triunfo que cambia cada mano. Se reutiliza casi todo de Picas:
- la baraja francesa y `CartaJugada` del motor de bazas;
- los fallos conocidos (`fallos`) y las cartas jugadas en la vista;
- la reconstrucción con `repartirConPermitidos`;
- la mesa de 4 en parejas del cliente, con su resumen entre manos.

## Goals / Non-Goals

**Goals:**
- Whist clásico inglés a 5 puntos, al mejor de tres juegos, con el triunfo de la última carta del repartidor.
- IA normal por reglas de bazas y difícil por simulación que le gane.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Honores, Whist largo, menos jugadores y subastas.

## Decisions

### 1. Estado (`juegos/whist.ts`)
Los campos son los de Picas sin la fase de apuesta, más:
- `triunfo: PaloFrances` y `cartaTriunfo: IdCarta | null`, que pasa a `null` en cuanto el repartidor la juega;
- `puntos: [n, n]` del juego en curso, `juegos: [n, n]`;
- `resultadosManos`, con las bazas de cada pareja, los puntos, el marcador tras la mano y la pareja que gana el juego (o `null`).

La única acción es `{ tipo: 'jugar', carta }`.

### 2. Reparto
`repartir` da una a una desde el asiento a la izquierda del repartidor, así que la carta 52 es la del repartidor. Se baraja con el azar del estado, y la carta del triunfo es la última repartida.

### 3. Cierre de la mano
- Se cuentan las bazas por pareja, y la que pasa de 6 suma la diferencia.
- Si llega a 5, gana el juego: `juegos[p]++` y los puntos vuelven a `[0, 0]`.
- Si `juegos[p] === 2`, la partida termina.
- Si no, se reparte la mano siguiente con el repartidor siguiente.

### 4. Vista
- La carta del triunfo es pública mientras siga en la mano del repartidor.
- El oráculo del contrato excluye la carta del triunfo de las ocultas del repartidor.

### 5. IAs
- **Normal (`ia/whist-basica.ts`):** las reglas de la spec, con `ganadoraWhist` para saber quién gana la baza en curso.
- **Difícil (`ia/reconstruir/whist.ts`):** `SIMULABLE_WHIST`.
  - **Reconstrucción:** como en Picas, con `repartirConPermitidos` y los fallos. Si la carta del triunfo sigue en juego, va primero a la mano del repartidor (si no es el propio asiento).
  - **Valoración:** la diferencia de puntos de la mano entre parejas más las bazas de diferencia (las bazas cuentan aunque no den puntos), y el bono de partida.
  - `reconstrucciones` 12 y `presupuesto` 80, como en Picas. Con ellos, la difícil gana 157 de 200 partidas a la normal (el 78 %) y decide en menos de 100 ms; la normal gana 154 de 200 a la fácil.

### 6. Cliente
- **`MesaWhist.svelte`:** parte de `MesaPicas.svelte`, sin la apuesta. En la barra muestra el triunfo, las bazas, los puntos y los juegos. La carta del triunfo se ve como la muestra de la mesa de bazas, con el rótulo «Carta del triunfo» en vez de la cuenta del mazo (opción nueva `rotuloMuestra` de `MazoYMuestra`).
- **`ResumenWhist.svelte`:** la tabla por pareja con las bazas, los puntos, el marcador y los juegos, y el aviso de juego ganado.
- **Fin:** los juegos ganados por cada pareja.
- **Textos:** en `T.whist` y la guía.

## Risks / Trade-offs

- **[Partidas largas en la prueba de fuerza]** → Un *rubber* son unas 6–12 manos, menos que una partida de Picas a 500, así que la prueba cabe en su tiempo.
