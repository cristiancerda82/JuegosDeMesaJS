## Context

`motor/bazas.ts` ya tiene casi todo lo que necesita la Butifarra:
- `cartaGanadora` decide quién gana la baza.
- `cartasObligadas` aplica las obligaciones. Con `montarSobreCompanero: false`, si la baza es del compañero solo obliga a seguir el palo.
- `bandoDe` da los bandos 0-2 contra 1-3.

Le faltan dos cosas: los valores de la Butifarra (9 > As > Rey > Caballo > Sota > 8…2) y jugar sin triunfo. Ambas funciones reciben un `PaloEspanol` como triunfo.

Las demás piezas ya existen:
- `ia/bazas-heuristica.ts` (`cartaParaResponder`, `cartaParaSalir`, `masBarata`): sirve como base de la IA de juego.
- `reconstruir/comun.ts` (`Ocultas`, `bonoPartida`): sirve para la IA difícil.
- En el cliente, `MesaBazas` ya pinta 4 jugadores en parejas con los snippets `info`, `acciones` y `detalleAviso`. El Guiñote y el Tute la usan así.

## Goals / Non-Goals

**Goals:**
- Butifarra completa de 4 jugadores: triunfo, delegar, contros, bazas con obligaciones, puntuación y partida a 51, 101 o 151.
- IA en los tres niveles. La difícil le gana a la normal en la prueba de fuerza.
- Jugable en local y en red, con su mesa, el resumen de cada mano y la guía.

**Non-Goals:**
- Las variantes de 3 jugadores, las señas y la puntuación sin multiplicar.
- Una IA de contros por simulación (ver Decisión 4).

## Decisions

### 1. Sin triunfo en el motor de bazas
`cartaGanadora` y `cartasObligadas` aceptan `triunfo: PaloEspanol | null`. Con `null`, ninguna carta es triunfo:
- gana la más alta del palo de salida;
- sin el palo, se juega cualquier carta, salvo que la vaya ganando el compañero.

`SituacionBaza.triunfo` y `coste`/`masBarata`/`cartaParaSalir` aceptan también `null`. Los juegos existentes siguen pasando un palo y no cambian. Se añade `VALORES_BUTIFARRA = { orden: [9, 1, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2], puntos: { 9: 5, 1: 4, 12: 3, 11: 2, 10: 1 } }`.

**Alternativa descartada:** un palo ficticio para la butifarra. Rompería `paloDe` y los tipos.

### 2. Estado por fases
`EstadoButifarra` guarda:
- `config` (`objetivo: 51 | 101 | 151`), `azar`, `repartidor`, `manos`;
- `fase: 'elegir' | 'contros' | 'jugar'` y `turno`;
- `eleccion: { triunfo: PaloEspanol | null; quien: Asiento; delegada: boolean } | null`, donde `triunfo: null` es butifarra;
- `contros: 0 | 1 | 2 | 3` (contro, recontro, Sant Vicenç) y `pasados: number`, que cuenta cuántos del bando que decide ya pasaron en este paso;
- `mesa`, `bazasJugadas: { cartas: CartaJugada[]; ganador }[]` y, por bando, `bazas` y `puntos` de cartas;
- `resultadosManos` y `totales: [number, number]`.

Acciones:
- `elegir{triunfo: PaloEspanol | null}` y `delegar`;
- `contro` (dice el paso que toque) y `pasar`;
- `jugar{carta}`.

Flujo:
- **Elegir:** le toca al repartidor. `delegar` pasa el turno a su compañero con `delegada: true`. Al elegir, la fase pasa a `contros`.
- **Contros:** el paso `k = contros + 1` lo decide el bando rival del que eligió si `k` es impar, y el bando que eligió si es par. Los dos jugadores del bando deciden en orden de juego desde el siguiente al repartidor; el turno es el primero de esos dos que aún no pasó. Así se cumple el orden de la spec sin más estado.
  - `contro` sube `contros` y pone `pasados = 0`. Si `contros` llega a 3, empieza el juego.
  - `pasar` suma uno a `pasados`. Si ya pasaron los dos, empieza el juego.
- **Jugar:** sale el siguiente al repartidor. Las cartas legales salen de `cartasObligadas(mano, mesa, triunfo, { asiento, montarSobreCompanero: false, valores: VALORES_BUTIFARRA })`. Al completarse la baza la gana `cartaGanadora`, que suma 1 + los puntos de las cartas a su bando.

Tras la 12.ª baza se cierra la mano:
- `multiplicador = 2^contros × (butifarra ? 2 : 1)`;
- el bando con más de 36 se anota `(puntos − 36) × multiplicador`.

Después termina la partida o se reparte la siguiente mano con `siguiente(repartidor)`. El primer repartidor es el asiento 3, como en el Guiñote, para que salga el asiento 0.

`resultadosManos` guarda, por mano:
- `eleccion` y `contros`;
- `multiplicador`;
- `puntos` (de cartas y bazas por bando);
- `anotados` y `totalesTras`.

### 3. IA básica (`ia/butifarra-basica.ts`)
- **Valor de cada palo** como triunfo: `Σ puntos de sus cartas + 1,5 × (largo − 3)` + 3 por manilla con As.
- **Valor de butifarra:** suma de manillas (4 c/u), ases acompañados de manilla (3) y palos largos con manilla y As (2 por carta de más de 3).
- **Elegir:**
  - si butifarra supera un umbral alto, elige butifarra;
  - si no, el mejor palo;
  - como repartidor, delega si el mejor palo no llega a un umbral mínimo. El escenario «sin manillas ni ases y sin palo de más de 3» siempre queda por debajo.
  Los umbrales se ajustan con las partidas contra la IA del mismo nivel.
- **Contros:** estima los puntos de sus cartas para el triunfo elegido. Dice contro si estima que su bando pasa de 36 con margen; el recontro y el Sant Vicenç piden más margen. Si no, pasa.
- **Al jugar:** usa `cartaParaResponder`/`cartaParaSalir` con `VALORES_BUTIFARRA` y el triunfo (o `null`), dentro de las cartas legales. Salvo con butifarra, sale con la manilla de un palo si también tiene el As. Su cálculo de «ya es del compañero» ya carga puntos cuando el compañero es el último en ganar. Además, la IA comprueba si la carta del compañero es la más alta que queda de su palo (las jugadas son públicas) y, si lo es, le carga puntos aunque no sea el último en jugar.

Todo es determinista.

### 4. IA difícil (`ia/reconstruir/butifarra.ts`)
La reconstrucción reparte las cartas ocultas respetando dos tipos de restricción, que se deducen de `bazasJugadas`:
- **Fallos conocidos:** quien no siguió el palo de salida no tiene ese palo.
- **Triunfos conocidos:** quien no siguió el palo, no lo tenía ganando su compañero, y no jugó triunfo, no tiene triunfos.

Reparto con restricciones:
1. Por cada carta oculta, mezclada con `Ocultas`, se elige al azar un asiento que la admita y tenga hueco.
2. Primero se reparten los palos con menos asientos posibles.
3. Si no se llega a un reparto completo, se reintenta con el azar siguiente hasta 50 veces.
4. Después se resuelve como un emparejamiento por palos (cantidad de cada palo por asiento) con un flujo pequeño. Siempre existe solución, porque el estado real la cumple.

Lo que se simula y cómo se valora:
- El `Simulable` simula `elegir`/`delegar` y `jugar`.
- `decideLaBase` devuelve `true` en la fase de contros (ver spec niveles-ia).
- `valorar`: lo que se anota su bando menos lo que se anota el rival en la mano, más `bonoPartida`.
- Las reconstrucciones y el presupuesto se ajustan para quedar por debajo de 250 ms en la prueba de fuerza (punto de partida: 24 reconstrucciones, presupuesto 200).

### 5. Cliente
- **`MesaButifarra.svelte`** sobre `MesaBazas` (4 jugadores, parejas):
  - **`info`:** el triunfo con su icono o «Butifarra», «elige Rival 1 (delegada)» y «×4».
  - **`acciones`:** en `elegir`, los botones de palos, «Butifarra» y «Delegar»; en `contros`, el botón del paso que toca y «Paso».
  - **Avisos** para las elecciones y los contros de los demás.
  - **Detalle de cada asiento:** las bazas del bando.
- **`ResumenButifarra.svelte`:** el panel de fin de mano, que pausa la sesión hasta «Siguiente mano», igual que el Guiñote y la Pocha. Recibe `bando`/`yo` para pintarse desde cualquier asiento en red.
- **Registro:**
  - `DEF_BUTIFARRA` en `juegos.ts` (IA por nivel y pausas de los juegos de bazas, más una pausa breve tras cada elección o contro de la IA), y `IdJuego`, `partida.ts` y el guardado;
  - opciones (objetivo), textos, guía y `Fin.svelte` con los puntos de los bandos;
  - `IDS_JUEGOS_EN_RED`/`JUEGOS_EN_RED` en `red.ts`, para que el servidor y la pantalla de red la ofrezcan sin más cambios.

## Risks / Trade-offs

- **Cambiar la firma de `cartaGanadora`/`cartasObligadas`** podría afectar a los otros juegos de bazas → solo se amplía el tipo, y sus tests y los E2E sirven de regresión.
- **Reconstrucción con restricciones** puede ser lenta o fallar → hay reintentos y un reparto exacto de respaldo, y un test con miles de vistas de partidas al azar comprueba que siempre da una vista idéntica.
- **Las 12 bazas de 4 jugadores son caras de simular** (hasta 48 jugadas por simulación) → hay presupuesto fijo y, si hace falta, horizonte, como en el Chinchón.
- **Las variantes regionales** (quién dice el contro, si se puede delegar con butifarra) → se documenta la variante elegida para que la valide el usuario.
