## Context

El motor ya tiene la baraja española, el azar con semilla, el barajado y el contrato `Juego<C,E,A,V>`, con la suite genérica de propiedades y su oráculo de cartas ocultas. En el cliente, la mesa de bazas aporta `AsientoRival` y `ManoPropia`, y el Chinchón aporta el patrón del panel de resultado que pausa la sesión (`pausar`/`reanudar`). La Siete y media no tiene bazas ni turnos de una sola carta. Tiene fases (apostar, pedir o plantarse, banca y liquidación), fichas que pasan de un jugador a otro y una carta tapada por jugador.

## Goals / Non-Goals

**Goals:**
- Siete y media completa de 2 a 4 jugadores, con apuestas en fichas, banca rotatoria o por siete y media, y partida a N manos.
- Mantener las garantías del contrato: vista sin cartas tapadas ajenas ni mazo, determinismo y JSON plano.

**Non-Goals:**
- El comodín, doblar la apuesta y las apuestas laterales.
- Que el humano pueda irse de la partida a mitad sin que termine.
- El juego en red.

## Decisions

### 1. Estado por fases
`EstadoSieteYMedia` tiene estos campos:
- `config`, `azar`, `banca`, `fichas: number[]` y `manoNumero`.
- `fase: 'apostar' | 'jugar'` y `turno`.
- `apuestas: (number | null)[]`, con `null` en la banca y en quien aún no apostó.
- `mazo` (se baraja uno nuevo cada mano).
- `cartas: IdCarta[][]`, donde la posición 0 es la tapada.
- `estados: ('jugando' | 'plantado' | 'pasado')[]`.
- `ultimaAccion` y `resultadosManos`.

Acciones: `apostar{fichas}`, `pedir` y `plantarse`.

- **`apostar`:** los puntos apuestan en orden desde el siguiente a la banca. Al apostar el último, se baraja y se da una carta a cada uno, y el turno pasa al primer punto en la fase `'jugar'`.
- **`pedir`:** si la jugada pasa de 7,5, el punto queda `'pasado'`, su apuesta pasa a la banca en el acto y avanza el turno. Si llega a 7,5, queda `'plantado'` y avanza. A la banca, pasarse le cierra la mano.
- **`plantarse`:** avanza el turno. Después del último punto juega la banca, salvo que todos se hayan pasado.

Barajar al repartir, y no al crear la mano, mantiene el orden del mazo fuera de la vista: el oráculo de cartas ocultas comprueba el mazo y las tapadas ajenas.

*Alternativa descartada:* un mazo continuo entre manos, como se juega a veces en casa. Complicaría el rebarajado sin aportar nada a una partida contra la IA.

### 2. Valores en medios puntos
El valor de una jugada se guarda como entero en **medios puntos** (7,5 = 15) para no arrastrar decimales. El As vale 2, el 7 vale 14 y cada figura vale 1. La vista y el cliente lo muestran dividido entre 2. Se exportan `valorCarta`, `valorJugada` y `esSieteYMediaNatural`.

### 3. Liquidación
`liquidar` recorre los puntos en orden de turno:
- **Pasado:** ya pagó al pasarse; su variación se registra.
- **Si la banca se pasó, o el punto tiene más:** la banca paga la apuesta, o el doble si hay siete y media natural y está activado el pago doble. Si no le alcanzan las fichas, paga hasta quedarse a 0.
- **En otro caso:** la banca cobra la apuesta.

`ResultadoManoSieteYMedia` guarda `{ banca, cartas, valores, pasados, variacion, fichasTras }`. La siguiente banca es:
- con `cambioBanca: 'rotar'`, el siguiente jugador con fichas;
- con `'sieteYMedia'`, el primer punto que ganó con 7,5, o la misma banca.

La partida termina si `manoNumero === config.manos` o algún jugador tiene 0 fichas. `resultado` devuelve como ganadores a los que tienen más fichas y, como puntos, las fichas.

### 4. Vista
`VistaSieteYMedia` muestra:
- `config`, `asiento`, `banca`, `fichas`, `apuestas`, `fase`, `turno`, `estados`, `ultimaAccion` y `resultadosManos`;
- `cartas: (IdCarta | null)[][]`, con la tapada ajena como `null`;
- `miValor` (el valor propio completo);
- `visibles: number[]` (el valor de las cartas boca arriba de cada jugador);
- `mazo` (cuántas cartas quedan).

### 5. IA básica (`ia/siete-y-media-basica.ts`)
- **Apuesta:** `min(max, max(1, round(fichas / 10)))`.
- **Como punto:** pide si su jugada vale menos de 5 (10 medios).
- **Como banca:** calcula la mejor amenaza, que es la mayor de `visibles + 1` (la tapada vale como mínimo medio punto) entre los puntos `'plantado'`. Pide si su jugada no la supera y vale menos de 6. Si no hay amenazas, se planta a partir de 5.

Es determinista: no usa el azar que recibe.

### 6. Cliente
`MesaSieteYMedia.svelte`:
- **Rivales:** `AsientoRival` con el nombre, las fichas y la apuesta como detalle, y una marca de «Banca».
- **Centro:** el mazo, con las jugadas de cada rival boca arriba junto a su asiento (la tapada como dorso).
- **Abajo:** la jugada propia con su valor y los controles:
  - en la fase de apostar, un selector numérico (−/+) con «Apostar»;
  - en la de jugar, «Pedir carta» y «Plantarse».
- **Avisos:** cada pide, planta y pasa se anuncia con una pausa breve (`pausaTras` sobre `ultimaAccion`).
- **Resultado de la mano:** `ResultadoSieteYMedia.svelte` aparece en un panel que pausa la sesión, como en el Chinchón, y se reutiliza en la pantalla de fin.

La carta propia no se arrastra: las acciones son botones, porque no hay que elegir carta.

## Risks / Trade-offs

- **Azar alto:** una IA sencilla puede perder bastantes partidas contra el azar. Con banca rotatoria la ventaja está sobre todo en plantarse bien. El test exige «claramente más de la mitad», y el umbral se ajusta con la simulación: al menos un 60 %.
- **Partidas que se cortan pronto por una quiebra:** con 50 fichas y apuesta máxima de 10 es raro antes de la mano 10, y las fichas iniciales son configurables.
- **Variantes regionales** (empates, pago doble, cambio de banca) → se configuran y las valida el usuario.
