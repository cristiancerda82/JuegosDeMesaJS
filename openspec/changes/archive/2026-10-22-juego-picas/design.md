## Context

Picas reutiliza casi todo:
- **Bazas con baraja francesa:** los Corazones ya tienen el orden con el As arriba (`rangoCorazones`), seguir el palo, la baza en curso, la última baza y las cartas jugadas en la vista.
- **Mesa:** `MesaBazas` pinta 4 asientos con la baza en curso y la última baza; los Corazones ya la usan con baraja francesa.
- **Manos encadenadas:** `resultadosManos`, totales y un resumen entre manos que pausa la sesión, como en la Cuatrola.
- **IA difícil:** `porSimulacion` con `candidatas` para simular solo las cartas, y la reconstrucción con fallos conocidos (`repartirConPermitidos` de la Cuatrola).

Lo nuevo es la apuesta con Nil, las picas rotas y la cuenta de sacos de la partida.

## Goals / Non-Goals

**Goals:**
- Picas completo para 4 jugadores en parejas, con Nil, sacos y partida a 500.
- IA básica que apuesta con sentido, cumple sin sumar sacos y juega el Nil propio y el del compañero, y una difícil por simulación que le gana.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Las variantes de la propuesta (Nil a ciegas, perder a −200, comodines, individual).

## Decisions

### 1. Estado y acciones
`EstadoPicas`:
- `config: { jugadores: 4 }` (no hay opciones de reglas; el número de jugadores lo usa la mesa de bazas), `azar`, `repartidor`;
- `manos`, `fase: 'apuesta' | 'bazas'`, `turno`;
- `apuestas: (number | null)[]`: 0 es Nil, `null` aún no ha apostado;
- `mesa: CartaJugada[]`, `ultimaBaza`, `bazas: number[]` (de cada jugador en la mano), `jugadas: IdCarta[]`, `rotas: boolean`;
- `fallos: PaloFrances[][]`: los palos de salida que cada jugador no siguió en esta mano, públicos (para la reconstrucción);
- `resultadosManos`, `puntos: [number, number]` y `sacos: [number, number]` por pareja.

Acciones: `apostar{bazas: 0..13}` y `jugar{carta}`.

`accionesLegales`:
- en la apuesta, `apostar` de 0 a 13;
- en las bazas, las cartas del palo de salida si tiene; si no, cualquiera. Al salir: todas menos las picas si las picas no están rotas y tiene otra cosa.

Transiciones:
- **`apostar`:** guarda la apuesta y pasa el turno; con la cuarta, empieza la fase de bazas con el turno del de la izquierda del que reparte.
- **`jugar`:** la carta va a la mesa; si no sigue el palo de salida, se apunta el fallo, y si es pica en una baza que no salió de picas, `rotas` pasa a `true`. Con 4 cartas, gana la pica más alta o la más alta del palo de salida; suma la baza, guarda `ultimaBaza` y sale el ganador. Con la 13.ª baza se cierra la mano.

### 2. Cierre de la mano
`ResultadoManoPicas = { apuestas, bazas, contratos: [n, n], bazasPareja: [n, n], puntosMano: [n, n], sacosMano: [n, n], penalizacion: [bool, bool], puntosTras, sacosTras }`.

Por pareja:
- `bazasContrato` = bazas de los jugadores que no dijeron Nil; `sacos` de la mano = las de más sobre el contrato + las de los que dijeron Nil;
- contrato > 0: si `bazasContrato ≥ contrato`, +10·contrato + bazas de más; si no, −10·contrato y esas bazas no suman sacos de contrato (las del Nil sí);
- ±100 por cada Nil;
- sacos acumulados: si llegan a 10, −100 y se descuentan 10.

La partida termina si alguna pareja tiene 500 o más y no hay empate. Si no, se reparte la siguiente mano con el repartidor siguiente. `resultado`: ganan los dos asientos de la pareja con más puntos; `puntos` da a cada asiento los de su pareja.

### 3. Vista
- `miMano`, `cartasEnMano`, `fase`, `turno`, `apuestas`, `contratos`;
- `mesa`, `ultimaBaza`, `bazas`, `jugadas`, `rotas`, `fallos`;
- `repartidor`, `resultadosManos`, `puntos`, `sacos`.

### 4. IAs
- **Básica** (`iaPicasBasica`, determinista):
  - **Apuesta:** cuenta de bazas esperadas: As = 1; Rey con al menos otra del palo = 1 (solo = 0,5); Dama con al menos dos más = 0,5; en picas, además, As, Rey y Dama cuentan como bazas casi seguras y cada pica a partir de la cuarta suma 1. Redondea y apuesta como mínimo 1. Nil si espera menos de 0,5, no tiene picas por encima del 9 y su compañero no ha dicho Nil.
  - **Juego:** según su papel en la baza:
    - con Nil propio: la más alta que no gane; si todas ganan, la más baja;
    - con Nil del compañero aún vivo: si el compañero puede llevarse la baza, ganarla con la más baja que gane;
    - si a la pareja le faltan bazas para el contrato: ganar con la más baja que gane (salvo que ya gane el compañero); si no puede, la más baja;
    - con el contrato cumplido: la más alta que no gane, para no sumar sacos;
    - al salir: con contrato pendiente, sus ases y reyes de palos que no sean picas; si no, la más baja de su palo más largo.
- **Fácil:** `conErrores` sobre la básica.
- **Difícil:** `porSimulacion(iaPicasBasica, SIMULABLE_PICAS)`:
  - `candidatas`: solo las cartas (en la apuesta decide la base);
  - `reconstruir`: las manos ajenas al azar entre las cartas que no se ven, sin los palos que cada uno no siguió (`repartirConPermitidos`);
  - `valorar`: puntos de la mano de su pareja menos los de la otra (con los sacos que lleven a la penalización), más el bono de partida;
  - `reconstrucciones: 12`, `presupuesto: 80`: la mitad que los Corazones, porque las partidas a 500 son largas. Con 24 y 160 ganaba 84 de las primeras 90 partidas a la normal, pero las 200 de la prueba de fuerza tardaban unas dos horas.

Medido en 200 partidas: la normal gana todas a una pareja que juega al azar y todas a la fácil.

### 5. Cliente
- **`MesaPicas.svelte`** sobre `MesaBazas`:
  - `detalle` de cada asiento: «Nil» o «apuesta / bazas»;
  - barra de información: contrato y bazas de cada pareja («Vosotros 7 · 3»), puntos y sacos, y «Picas rotas»;
  - ventana de apuesta con su mano, las apuestas de los demás y botones «Nil» y 1–13;
  - resumen entre manos con `ResumenPicas.svelte`, como en la Cuatrola.
- **Pausas:** las de la mesa de bazas, y la de la subasta tras cada apuesta de la IA.
- **Fin:** la pareja ganadora, los puntos de las dos y el resumen de la última mano.

## Risks / Trade-offs

- **[Apuestas malas de la IA]** → la cuenta de bazas es sencilla; los tests comprueban que la pareja básica gana claramente al azar, y la difícil mejora el juego de cartas, no la apuesta.
- **[La difícil no gana a la normal]** → si la simulación no basta, se añade a la reconstrucción el Nil (el jugador con Nil vivo no tiene cartas que hubiera tenido que jugar para ganar) o se afina la valoración de los sacos.
- **[Tiempo]** → 13 bazas de 4 jugadores son 52 jugadas por simulación; el presupuesto se ajusta para quedar por debajo de 250 ms en escritorio.
