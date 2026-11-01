## Context

El Barbu junta en un solo juego seis variantes de bazas y un dominó. Las bazas se parecen a las de Corazones (cada uno contra todos, seguir el palo) y el dominó a Sevens, pero desde las Jotas y con puntos por el orden de acabar. Lo nuevo es la elección del contrato y que la partida recorra los siete.

## Goals / Non-Goals

**Goals:**
- Barbu de 4 a 7 manos, con los siete contratos clásicos sin dobles; con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- Los dobles, la partida de 28 manos y elegir el número del dominó.

## Decisions

### 1. Cartas y contratos (`juegos/barbu.ts`)
- **Baraja:** la francesa de 52; el As vale 14 para el orden.
- **Contratos:** `ContratoBarbu` = `'bazas' | 'corazones' | 'damas' | 'rey' | 'ultimas' | 'triunfo' | 'domino'`, en `CONTRATOS_BARBU`.
- **Funciones:**
  - `penalizaBarbu(carta, contrato)`: si una carta penaliza en el contrato, para la IA y el fin anticipado;
  - `cartasLegalesBarbu(mano, mesa, contrato, triunfo)`;
  - `ganadoraBarbu(mesa, triunfo)`;
  - `encajaBarbu(filas, carta)`.

### 2. Estado
- **Config:** `{ jugadores: 4, manos: 7 }`. El cliente juega siempre 7; las pruebas usan menos (los contratos se eligen igualmente entre los que quedan).
- **Fase:** `fase` (`'contrato'`, `'triunfo'`, `'bazas'` o `'domino'`), `repartidor`, `contrato`, `triunfo` y `jugados` (los contratos ya jugados).
- **Cartas:** `manos`, `turno`, `mesa`, `ultimaBaza` y `bazasJugadas`.
- **Puntos de la mano:** `ganadas` (las cartas ganadas por cada uno, para puntuar) y `puntosMano` (por jugador, que se actualiza al cerrar cada baza).
- **Dominó:** `filas` (por palo, `{ bajo, alto }` o `null`, como en Sevens) y `acabados` (en orden).
- **Para reconstruir:**
  - `jugadasPor`;
  - `fallos` (palos de los que no tiene);
  - `noTiene` (cartas que encajaban cuando pasó en el dominó).
- **Partida:** `totales`, `resultadosManos` y `azar`.

### 3. Acciones
- **`contrato { contrato }`:** en la fase `'contrato'`. Con `'triunfo'` se pasa a la fase `'triunfo'`; con `'domino'`, a `'domino'`; con los demás, a `'bazas'`.
- **`triunfo { palo }`:** en la fase `'triunfo'`.
- **`jugar { carta }`:** en las bazas y en el dominó.
- **`pasar`:** solo en el dominó, cuando no hay carta que encaje.

### 4. Puntuación
- **Contratos de bazas:** al cerrar cada baza se suman sus puntos a quien la gana.
  - **Sin las dos últimas:** −10 en la baza 12 y −20 en la 13.
  - **Fin anticipado:** en sin corazones, sin damas y sin el Rey de corazones, la mano termina cuando se han ganado todas las cartas que penalizan.
- **Dominó:** al quedarse alguien sin cartas, entra en `acabados`; con tres acabados se anotan +45, +20, +5 y −5 y termina la mano.
- **Cierre de la mano:** el resultado guarda el contrato, el triunfo, el repartidor, los puntos de la mano y los totales. Si quedan manos, se reparte con el siguiente repartidor.
- **Resultado:** ganan todos los que tienen el total máximo, y es empate si son los cuatro; los `puntos` del `Fin` son los totales.

### 5. Vista
Lo de la spec, con `jugadasPor`, `fallos` y `noTiene`.

### 6. IAs
- **Normal (`ia/barbu-basica.ts`):** las reglas de la spec.
- **Difícil (`ia/reconstruir/barbu.ts`):** `SIMULABLE_BARBU`.
  - **Qué decide la normal:** el contrato y el triunfo (`decideLaBase` en las fases `'contrato'` y `'triunfo'`).
  - **Reconstrucción:** con los fallos y las cartas de `noTiene`.
  - **Valoración:** sus puntos de la mano menos la media de los de los demás, entre 10, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 10 y `presupuesto` 80. Contra tres normales, la difícil gana 74 de 200 partidas (de 2 manos; le corresponderían 50) y decide en 54 ms como máximo; la normal gana 133 de 200 contra tres jugadores al azar.

### 7. Cliente
- **`MesaBarbu.svelte`:** las fases de contrato y triunfo, y los contratos de bazas, sobre `MesaBazas`.
  - **Botones:** `contrato-{contrato}` y `triunfo-{palo}`.
  - **Barra de información:**
    - el contrato (`contrato-barbu`);
    - la mano de las 7 (`mano-ronda`);
    - los puntos de la mano y de la partida de cada uno (`puntos-{asiento}`).
- **`DominoBarbu.svelte`:** la mesa del dominó, como la de `MesaSevens`.
  - **Filas:** una por palo (`fila-{palo}`).
  - **Paso:** el botón `paso`.
  - **Rivales:** las cartas de cada rival y los que han acabado.
- **`ResumenBarbu.svelte`:** por jugador, lo anotado en la mano y el total.
- **Fin:** el Barbu entra en la lista de juegos sin parejas de `Fin.svelte`, con los totales.

## Risks / Trade-offs

- **[Siete contratos en un juego]** → Más código que un juego normal; se mantiene en un solo archivo con funciones pequeñas por contrato, y los tests cubren cada uno por separado.
- **[El repartidor elige con 4 jugadores y 7 manos]** → Los asientos 0, 1 y 2 eligen dos veces y el 3 una; es la consecuencia de la partida corta que eligió el usuario.
