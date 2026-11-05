## Context

El Barbu de la suite (`juegos/barbu.ts`) ya tiene casi todo lo que necesita el Rentz:
- contratos que elige el que reparte;
- bazas de evitar con fin anticipado;
- el dominó con filas desde la J;
- una IA por estimación de contratos.

El Rentz se diferencia en:
- la baraja de 32 y 8 cartas por jugador;
- que cada jugador tiene su propia lista de siete contratos (en el Barbu de la suite la lista es común y la partida dura 7 manos);
- el contrato positivo de bazas en lugar del triunfo;
- que no hay reglas especiales para salir a corazones ni para descartarse el K;
- las cuentas.

Se escribe como juego aparte, copiando lo que sirve del Barbu y adaptándolo, en vez de añadir variantes al Barbu: las diferencias tocan casi todas las funciones y mezclarlas haría el Barbu más difícil de leer.

## Goals / Non-Goals

**Goals:**
- Rentz para 4 a 28 manos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Otros números de jugadores, doblar y el contrato de todos los negativos.

## Decisions

### 1. Cartas (`juegos/rentz.ts`)
- **Baraja:** `BARAJA_RENTZ`, la francesa del 7 al As.
- **Rango:** `rangoRentz` del 7 (7) al As (14).
- **Contratos:** `ContratoRentz = 'bazas' | 'corazones' | 'damas' | 'rey' | 'ultima' | 'domino' | 'positivo'`, en `CONTRATOS_RENTZ`.
- **Puntos:**
  - `penalizaRentz(c, contrato)`: 5 por corazón, 10 por dama y 40 por el K de corazones, según el contrato;
  - `PUNTOS_DOMINO_RENTZ = [40, 20, 10, 0]`.
- **Cartas legales:** el palo de salida si se tiene; si no, todas.
- **Dominó:** `encajaRentz`, `encajanRentz` y `ponerEnFila`, como en el Barbu pero con el 7 como tope bajo.

### 2. Estado y fases
- **Config:** `{ jugadores: 4; rondas: number }`. `rondas` es cuántos contratos elige cada jugador: 7 por defecto, y menos en las pruebas. La partida dura `4 · rondas` manos.
- **Fases:** `'contrato' | 'bazas' | 'domino'`.
- **Estado:** como el del Barbu, sin triunfo, y con `jugados: ContratoRentz[][]` por jugador. También:
  - `repartidor`, `manos`, `turno`, `mesa`, `ultimaBaza`, `bazasJugadas`;
  - `puntosMano`, `filas`, `acabados`, `jugadasPor`, `fallos`, `noTiene`;
  - `totales`, `resultadosManos`.
- **Turnos:**
  - en la fase `contrato` elige el que reparte, y sale o abre él;
  - el reparto pasa al siguiente en cada mano.
- **Puntos de las bazas:**
  - sin bazas: −5;
  - bazas: +5;
  - sin la última: −40 en la octava baza;
  - el resto: −penalizaciones de las cartas.
- **Fin anticipado:** en corazones, damas y rey, en cuanto no queda ninguna carta que penalice en las manos.
- **Vista:** todo lo público y la mano propia. `ultimaBaza` se vacía al repartir.
- **`ResultadoManoRentz`:** `contrato`, `elige`, `puntos`, `totalesTras`.

### 3. IAs
- **Normal (`ia/rentz-basica.ts`):**
  - la estimación de contratos de la spec;
  - las reglas de las bazas de evitar del Barbu;
  - las de ganar bazas en el contrato positivo;
  - la carta del dominó.
- **Difícil (`ia/reconstruir/rentz.ts`):** `SIMULABLE_RENTZ`.
  - **Reconstrucción:** como la del Barbu, con `fallos` y `noTiene`.
  - **`decideLaBase`:** en la fase `contrato`.
  - **Valoración:** los puntos de la mano del asiento menos la media de los otros, dividido entre 10, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 20 y `presupuesto` 160, sin horizonte (la mano es corta, de 32 cartas). La difícil gana 70 de 200 partidas contra tres normales (la parte justa son 50), con 34 ms como máximo.

### 4. Cliente
- **`MesaRentz.svelte`:** a partir de `MesaBarbu.svelte`, sobre `MesaBazas` con 4 jugadores.
  - **Elegir:** un botón por cada contrato que le queda (`contrato-<id>`), compactos para que los siete quepan en dos filas a 360 px.
  - **Información:** el contrato de la mano y quién lo eligió, la mano de las 28, las filas del dominó y el botón «Pasar».
- **`ResumenRentz.svelte`:** el contrato, lo anotado y el marcador.
- **Fin:** juego sin parejas: entra en la lista de exclusión de `Fin.svelte`, con su bloque.

## Risks / Trade-offs

- **28 manos son una partida larga** → las manos son de 8 cartas y rápidas. Las pruebas usan `rondas: 1` o `2`, y el E2E de la partida completa va con `rapido`.
- **Código repetido con el Barbu** → se acepta: las diferencias tocan las reglas de salida, las cuentas, los contratos y el reparto de la partida.
