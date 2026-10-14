## Context

`motor/bazas.ts` ya resuelve quién gana la baza (`cartaGanadora`) y las obligaciones (`cartasObligadas`). Con `montarSobreCompanero: true` no tiene en cuenta los bandos, que es lo que pide un juego sin parejas. `ia/bazas-heuristica.ts` tiene `masBarata`, `coste` y `cartaParaSalir`.

En el cliente, `MesaBazas` cubre la mano propia, los rivales, el mazo y la muestra, el tapete y los snippets `info`, `acciones` y `detalleAviso`. Pero tiene dos limitaciones:
- `lado()` y `nombreAsiento()` solo contemplan 2 y 4 jugadores, y con 4 llaman «Compañero» al asiento 2.
- El detalle de cada asiento son siempre «N bazas».

## Goals / Non-Goals

**Goals:**
- Pocha completa con 3 y 4 jugadores: secuencia de manos, triunfo, apuestas, bazas y puntuación.
- Generalizar `MesaBazas` para 3 jugadores y para nombres y detalles propios de cada juego, sin cambiar la Brisca, el Tute ni el Guiñote.

**Non-Goals:**
- 5 y 6 jugadores (la mesa no tiene sitio para tantos rivales en el móvil).
- Variantes de manos a ciegas o sin triunfo.

## Decisions

### 1. Estado por fases
`EstadoPocha` guarda:
- `config` (`jugadores: 3 | 4`, `duracion: 'corta' | 'completa'`, `restriccionRepartidor: boolean`), `azar` y `secuencia: number[]` (cartas de cada mano, calculada al crear);
- `indiceMano`, `repartidor`, `manos`, `mazo` (el resto, oculto) y `muestra: IdCarta | null` (la carta boca arriba que marca el triunfo);
- `cartaTriunfo: IdCarta | null` (la del repartidor si se repartió todo, mientras siga en su mano) y `triunfo`;
- `fase: 'apostar' | 'jugar'`, `apuestas: (number | null)[]`, `turno`, `mesa`, `bazas: number[]` y `ultimaBaza`;
- `resultadosManos: { cartas, apuestas, bazas, puntos, totalesTras }[]` y `totales`.

Acciones: `apostar{bazas}` y `jugar{carta}`.

- **Apostar:** se apuesta en orden desde el siguiente al repartidor. Cuando apuesta el repartidor, la fase pasa a `jugar` y sale el siguiente al repartidor.
- **Jugar:** al completarse la baza, la gana `cartaGanadora` y su ganador abre la siguiente. Sin cartas en las manos, se puntúa la mano y se reparte la siguiente de la secuencia, o termina la partida.

Las cartas jugables salen de `cartasObligadas(mano, mesa, triunfo, { asiento, montarSobreCompanero: true })`.

### 2. Puntuación y secuencia
- **Puntos de la mano:** si se acierta, `10 + 5 × apuesta`; si no, `−5 × |bazas − apuesta|`.
- **Secuencia:** `subida = 1..max` y `bajada = max−1..1`, con `max = 5` en la corta y `⌊40 / n⌋` en la completa.
- **Muestra:** si `cartas × n < 40`, la muestra es la carta siguiente al reparto. Si no, `cartaTriunfo` es la última carta del repartidor.

### 3. IA básica (`ia/pocha-basica.ts`)
- **Apuesta:** suma la probabilidad estimada de que gane cada carta y la redondea.
  - Triunfo As o 3: 0,9. Rey o Caballo de triunfo: 0,6. Otros triunfos: 0,3.
  - As de otro palo: 0,7. 3 de otro palo: 0,4.

  Si el resultado es la apuesta prohibida, prueba con ±1 dentro del rango. Si no lo es, elige la más cercana entre las legales.
- **Al jugar, si le faltan bazas:**
  - Sale con su carta más alta que no sea triunfo y, si no tiene, con la más baja.
  - Al responder, juega la carta más barata que gane ahora la baza; si ninguna gana, la más barata.
- **Al jugar, si ya cumplió:**
  - Sale con la carta más baja.
  - Al responder, juega la carta más alta que no gane; si todas ganan, la más barata.

Es determinista.

### 4. Cliente
- **`asientos.ts`:** `lado(asiento, 3)` devuelve `abajo`, `derecha` e `izquierda`. `VistaBazas.config.jugadores` pasa a ser `number`.
- **`MesaBazas`:** recibe dos props opcionales, `nombre(asiento)` y `detalle(asiento)`. Por defecto usa `nombreAsiento` y «N bazas», que es lo de ahora.
- **`MesaPocha.svelte`:**
  - Nombres «Rival 1…3».
  - Detalle «apuesta X · bazas Y · Z pts».
  - En `info`: triunfo, «Mano 4 de 9 · 4 cartas».
  - En `acciones`: botones «0», «1», … («N bazas»), sin el prohibido.
  - Avisos de las apuestas de la IA.
  - Panel de resultado de la mano que pausa la sesión.
- **`DEF_POCHA`:** la pausa tras cada baza es la de los juegos de bazas, con una pausa breve tras cada apuesta de la IA. El cierre de la mano lo detiene el panel.

## Risks / Trade-offs

- **Cambiar `MesaBazas` y `lado()`** podría afectar a la Brisca, el Tute y el Guiñote → las props nuevas son opcionales y `lado()` para 2 y 4 no cambia. Sus E2E sirven de regresión.
- **Partida completa larga** (19 manos con 4) → es opcional; por defecto se juega la corta.
- **Variantes de puntuación** (algunas casas dan 5 por baza sin bono, o 10 + 3) → se documenta la elegida para que la valide el usuario.
