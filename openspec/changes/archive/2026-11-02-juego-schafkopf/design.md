## Context

El Schafkopf comparte con el Doppelkopf los triunfos fijos (las damas y las jotas por encima del palo de triunfo), los puntos de las cartas (120 en total) y las parejas que no se conocen hasta que sale una carta; y con el Skat, la baraja francesa de 32 cartas y el Wenz (el Grand del Skat, con solo las jotas). Se reaprovechan el modelo de los dos: el motor de bazas, la reconstrucción con palos no seguidos y la mesa de bazas compartida.

## Goals / Non-Goals

**Goals:**
- Schafkopf de 4 con Rufspiel, Wenz y Solo, fichas y partida de 12 manos, con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El Geier, el Farbwenz, el Ramsch, el Hochzeit, el Kontra y el Re, el Davonlaufen y volver a anunciar tras ser superado.

## Decisions

### 1. Cartas (`juegos/schafkopf.ts`)
- **Baraja:** `BARAJA_SCHAFKOPF`: la francesa de 52 con A, 7, 8, 9, 10, J, Q y K, como la del Skat.
- **Puntos:** `puntosCartaSchafkopf`: A 11, 10 10, K 4, Q 3 y J 2.
- **Triunfos:** `triunfosSchafkopf(contrato)` da la lista de triunfos de mayor a menor (damas, jotas y el palo, o solo las jotas en el Wenz). `esTriunfo` y `fuerza` (posición en esa lista, o el rango en su palo) salen de ella.
- **Palo efectivo:** `paloEfectivo(carta, contrato)` es `'triunfo'` para los triunfos y su palo para el resto; con él se calculan seguir el palo, la ganadora y los fallos.

### 2. Estado
- **Config:** `{ jugadores: 4, manos: 12 }`. Las manos van en la config para que las pruebas usen partidas más cortas; el cliente juega siempre 12.
- **Anuncio:** `fase` (`'anuncio'` o `'bazas'`), `anuncios` (lo que dijo cada uno, en orden), `contrato` y `jugador` (el más alto hasta ahora).
- **Rufspiel:** `companero` (el dueño del As llamado, fijado al empezar las bazas) y `companeroVisto` (se ha echado el As).
- **Bazas:** `manos`, `turno`, `mesa`, `ultimaBaza`, `bazas` y `puntosMano` por jugador, `jugadasPor` (las cartas que ha echado cada jugador en la mano, que son públicas) y `fallos` con el palo efectivo.
- **Laufende:** se cuentan al cerrar la mano con `jugadasPor`, que entonces tiene las 32 cartas: así no hace falta guardar en el estado nada que dependa de las manos ocultas.
- **Partida:** `manoNumero`, `fichas` (por jugador) y `resultadosManos` (el contrato o que nadie jugó, los puntos del lado del que juega, Schneider, Schwarz, Laufende, tarifa, fichas de la mano y fichas tras ella).
- **Otros:** `azar` y `repartidor`.

### 3. Acciones
- `pasar`, `anunciar { contrato }` (con el palo del As o del Solo) y `jugar { carta }`.
- **Anuncios legales:** los contratos de rango mayor que el actual; en el Rufspiel, solo los Ases que se pueden llamar.
- **Cartas legales:** las del palo efectivo de salida si tiene; con las reglas del As llamado aplicadas encima.
- **Fin del anuncio:** tras el cuarto, si nadie anunció se cierra la mano sin fichas; si no, empiezan las bazas con el siguiente al repartidor.
- **Fin de la mano:** tras la octava baza se calculan el lado ganador, la tarifa y las fichas.
- **Fin de la partida:** tras la mano 12. `resultado` como en el Barbu: ganan los de más fichas, y con los cuatro empatados, empate.

### 4. Vista
- La mano propia, el anuncio, el contrato, `jugador`, el As llamado y `companero` (solo si `companeroVisto` o si el asiento es el compañero).
- Las bazas, `puntosMano`, `jugadasPor` y `fallos` de cada jugador, la mano de las 12 y las fichas.

### 5. IAs
- **Normal (`ia/schafkopf-basica.ts`):** las reglas de la spec. El compañero conocido es: el que juega, para el dueño del As; el dueño del As, para el que juega cuando se descubre; y los otros dos defensores entre sí cuando se sabe quién es el compañero (o en el Wenz y el Solo).
- **Difícil (`ia/reconstruir/schafkopf.ts`):** `SIMULABLE_SCHAFKOPF`.
  - **Reconstrucción:** con `repartirConPermitidos`, como la del Doppelkopf: los palos efectivos no seguidos, y el As llamado sin echar en la mano de uno de los que pueden tenerlo (ni el que juega ni quien ya echó otra carta de su palo en la baza en curso).
  - **Anuncio:** `decideLaBase` en la fase de anuncio: anuncia como la normal, sin simular.
  - **Valoración:** las fichas de la mano del asiento, entre 10, más los puntos de cartas de su lado frente a los del otro, entre 120, más `bonoPartida`.
  - **Valores:** `reconstrucciones` 12 y `presupuesto` 80. La difícil, en un asiento contra tres normales, gana 69 de 200 partidas (le corresponderían 50) y decide en 100 ms como máximo; la normal gana 191 de 200 contra tres jugadores que juegan al azar.

### 6. Cliente
- **`MesaSchafkopf.svelte`:** sobre `MesaBazas`, como `MesaDoppelkopf`.
  - **Anuncio:** un panel con «Pasar», los 3 Ases que se pueden llamar, «Wenz» y los 4 palos del Solo, en dos filas para que quepa en móvil; los que no se pueden anunciar, desactivados.
  - **Información:** el contrato y quién juega, el triunfo, el As llamado, el compañero si se conoce, la mano de las 12 y las fichas.
- **`ResumenSchafkopf.svelte`:** el contrato, los puntos de cada lado, Schneider, Schwarz, Laufende, la tarifa y las fichas de cada jugador con su total; o que nadie jugó.
- **Fin:** juego sin parejas fijas: entra en la lista de juegos sin parejas de `Fin.svelte`, con los nombres numerados y las fichas.

## Risks / Trade-offs

- **[Sin volver a anunciar]** → En el Schafkopf real, quien es superado puede subir su contrato; aquí cada uno habla una vez. Es más sencillo para la IA y para la mesa, y la ronda sigue decidiendo quién juega el contrato más alto.
- **[Alianza oculta en la simulación]** → La difícil reconstruye quién tiene el As llamado; si la ventaja sobre la normal es pequeña, se suben las simulaciones dentro del límite de 500 ms.
