## Context

El Skat es un juego de bazas con solista, como el Tute subastado y la Cuatrola, pero para 3 y con reglas propias:
- una subasta por parejas de posiciones (Mittelhand contra Vorhand, y el que queda contra Hinterhand);
- el Skat que se coge o no;
- tres clases de juego con órdenes distintos;
- un valor que depende de los matadores y los anuncios, y que puede no llegar a lo pujado.

## Goals / Non-Goals

**Goals:**
- Skat con palo, Grand y Nulo, mano, schneider, schwarz y ouvert, y la puntuación simple (más el valor, o menos el doble).
- Reutilizar la mesa de bazas común (`MesaBazas`) con 3 jugadores.
- IA normal por reglas y difícil por simulación de las bazas que le gane.

**Non-Goals:**
- Saltar valores en la subasta, Kontra y Re, Ramsch, Bock y los extras de Seeger-Fabian.

## Decisions

### 1. Cartas y juegos (`juegos/skat.ts`)
- **Juego declarado:** `JuegoSkat = 'treboles' | 'picas' | 'corazones' | 'diamantes' | 'grand' | 'nulo'` y `AnuncioSkat = 'ninguno' | 'schneider' | 'schwarz' | 'ouvert'`.
- **Palo efectivo:** `paloSkat(carta, juego)`: en palo y Grand, las J son del palo `'triunfo'`. En palo, las cartas del palo elegido también son `'triunfo'`.
- **Orden:** `rangoSkat(carta, juego)`:
  - en el triunfo, J♣ 14, J♠ 13, J♥ 12, J♦ 11, y después A 7, 10 6, K 5, Q 4, 9 3, 8 2 y 7 1;
  - en los demás palos, igual sin las J;
  - en Nulo, A 8, K 7, Q 6, J 5, 10 4, 9 3, 8 2 y 7 1.
- **Valor:** `valorSkat(carta)`: As 11, 10 10, K 4, Q 3, J 2.
- **Valores de la subasta:** `VALORES_SUBASTA`, calculados como los valores posibles de un juego (bases por multiplicadores de 2 a 18, Grand de 2 a 11 y los cuatro Nulos) desde 18 y sin repetir.

### 2. Fases y estado
- **Fases:** `fase: 'subasta' | 'skat' | 'descarte' | 'declarar' | 'bazas'`.
- **Subasta:** `subasta = { pujador, escucha, valor, esperando: 'puja' | 'respuesta', tramo: 1 | 2 | 3 }`.
  - Tramo 1: Mittelhand contra Vorhand.
  - Tramo 2: Hinterhand contra el que queda.
  - Tramo 3: si nadie pujó, el que queda puede jugar con 18 o pasar.
- **Reparto:** `manos`, `skat` (las 2 cartas apartadas: el Skat original o el descarte), `repartidor` y `turno`.
- **Solista:** `solista`, `puja`, `cogioSkat`, `descartadas` (para saber cuándo terminar el descarte), `juego` y `anuncio`.
- **Bazas:** `mesa`, `ultimaBaza`, `jugadas`, `puntosBazas` y `bazas` por bando (`[solista, defensores]`), y `fallos` por asiento (palos efectivos no seguidos).
- **Partida:** `puntos` por asiento, `resultadosManos`, `manosAnuladas`, `ultimaAccion` y `azar`.

### 3. Acciones
- **Subasta:**
  - `pujar` (el siguiente valor), `aceptar` y `pasar`;
  - en el tramo 3, `pujar` es jugar con 18.
- **El Skat:** `cogerSkat`, o `declarar { juego, anuncio }` directamente, que es jugar de mano.
- **Descarte:** `descartar { carta }`, dos veces.
- **Declarar:** `declarar { juego, anuncio }` tras el descarte, con anuncio `'ninguno'`, o `'ouvert'` solo en Nulo.
- **Bazas:** `jugar { carta }`.

### 4. Resultado y valor
- **Fin de las bazas:** al acabar las 10 bazas, o en Nulo en cuanto el solista gana una.
- **Matadores:** `matadoresSkat(cartas, juego)` sobre la mano inicial del solista más el Skat. Devuelve `{ con: boolean, n }`.
- **Multiplicador:** `n + 1`, más mano, schneider, schneider anunciado, schwarz, schwarz anunciado y ouvert. Los anuncios incluyen los menores (ouvert implica schwarz, que implica schneider).
- **Ganar:**
  - palo y Grand: 61 o más (con el Skat) y cumplir lo anunciado;
  - Nulo: ninguna baza.
- **Pasarse:** si el valor es menor que la puja, el solista pierde y el valor sube al menor múltiplo de la base que llega a la puja. En Nulo el valor no cambia: si la puja pasa del valor del Nulo declarado, pierde con ese valor.
- **Registro:** `resultadosManos` guarda `{ solista, juego, anuncio, mano, skat, puja, puntosSolista, bazasSolista, matadores, multiplicador, valor, gana, delta, totales }`.
- **Fin de la partida:** cuando `resultadosManos.length` llega a `3 × rondas`.

### 5. Vista
- **Públicas:**
  - la subasta, el solista, la puja, si cogió el Skat, el juego y el anuncio;
  - la mesa, la última baza, las jugadas, los puntos y las bazas de cada bando, y los fallos;
  - la mano del solista si juega ouvert;
  - los puntos y los resultados (con el Skat de cada mano ya jugada).
- **Propias:** el solista ve el Skat desde que lo coge, y después su descarte.
- **Ocultas:** las manos ajenas y el Skat.

### 6. IAs
- **Normal (`ia/skat-basica.ts`):**
  - **Valoración:** `mejorJuegoSkat(mano)` estima para cada palo y el Grand una fuerza (J 2, A 1,5, 10 con otra carta del palo 1, y en palo cada triunfo 1) y si es ganable, con un umbral por clase. El Nulo es ganable si cada palo que tiene incluye su 7 y no tiene As ni K. Da el juego ganable de más valor y su valor (con los matadores de la mano).
  - **Subasta:** puja o acepta mientras el valor no pase de ese valor.
  - **El Skat:** lo coge siempre. Se descarta de una en una, de la carta que más mejora su juego al quitarla: primero dieces y K de palos cortos que no son triunfo, nunca J ni triunfos.
  - **Declarar:** el mejor juego que llegue a la puja, o, si ninguno llega, el de más valor.
  - **Bazas:** como la spec de `ia-jugadores`.
- **Difícil (`ia/reconstruir/skat.ts`):** `SIMULABLE_SKAT`.
  - **Qué simula:** solo las bazas (`decideLaBase` fuera de la fase de bazas).
  - **Reconstrucción:** las manos ajenas y el Skat (si el asiento no lo conoce) salen al azar de las cartas que no se ven, respetando los fallos. La mano ouvert del solista es la que se ve.
  - **Valoración:** lo que suma o resta el solista, con signo contrario para los defensores.
  - Valores de partida: `reconstrucciones` 20 y `presupuesto` 100.

### 7. Cliente
- **`MesaSkat.svelte`:** sobre `MesaBazas` con 3 jugadores.
  - **Información:** el estado de la subasta («Mittelhand puja 20 a Vorhand»), y después el solista, el juego y los anuncios, los puntos de cada bando y la partida.
  - **Acciones:**
    - los botones de la subasta («18», «Sí», «Paso»);
    - «Coger el Skat» y, para jugar de mano, el selector de anuncio y los botones de cada juego;
    - el descarte, tocando la carta y la mesa;
    - los botones de cada juego al declarar, con «Nulo ouvert».
  - **Ouvert:** la mano del solista se muestra en la barra de información, con su nombre, porque el asiento de la mesa común solo enseña una carta.
- **`ResumenSkat.svelte`:** el resumen de la mano como dice la spec.
- **Opciones:** el número de rondas.

## Risks / Trade-offs

- **[Subasta sin saltos]** → Cada puja es el siguiente valor. Pujar alto lleva varias acciones, pero el resultado es el mismo, y la IA y la interfaz son más sencillas.
- **[El Nulo y la puja]** → Si el solista declara Nulo con una puja mayor que su valor, pierde por pasarse con el valor del Nulo. La IA no lo hace.
- **[La IA normal y el Nulo]** → La valoración del Nulo es muy prudente: lo juega pocas veces.
