## Context

El Doppelkopf junta cosas que la suite ya tiene por separado:
- dos copias de cada carta, como en el Bezique y el Spite and Malice;
- bazas entre cuatro, como en el Whist y las Picas.

Lo nuevo son las parejas secretas: cada jugador sabe su bando, pero no el de los demás hasta que se descubren por las cartas, los anuncios o las reservas. Por eso el Doppelkopf no es un juego por bandos fijos en el cliente ni en la IA.

## Goals / Non-Goals

**Goals:**
- Doppelkopf de 4 con 48 cartas, boda, solos de Damas, de Jotas y de triunfo, Re/Contra con bajadas y una ronda de 8 manos.
- IA normal por reglas y difícil que simula el carteo.
- La mesa de bazas compartida para cuatro, con el tipo de juego, los anuncios y los bandos conocidos.

**Non-Goals:**
- Los solos de palo, el solo sin triunfos, los solos obligatorios, la boda silenciosa y las reglas de la casa.

## Decisions

### 1. Cartas
- **Baraja:** `BARAJA_DOPPELKOPF`, dos veces A, 10, K, Q, J y 9 de cada palo. Las copias comparten `IdCarta`, así que las manos son multiconjuntos (como en el Bezique).
- **Orden:** una función `fuerzaDoppelkopf(carta, juego)` da un número por carta según el tipo de juego (`'normal'`, `'boda'`, `'damas'`, `'jotas'` o `'triunfo'`) y dice si es triunfo. El palo de una carta para seguir es `'triunfo'` o su palo francés.

### 2. Estado (`juegos/doppelkopf.ts`)
- **Config:** `{ manos: 8 }`.
- **Cartas:** `manos` (4 multiconjuntos), `mesa` (la baza en curso, con quién salió) y `bazas` (las bazas jugadas en la mano: quién salió, las 4 cartas y quién ganó).
- **Turno:** `fase` (`'reservas'` o `'bazas'`), `turno`, `salida` (el que sale en la mano) y `repartidor`.
- **Juego:** `reservas` (lo que dijo cada uno), `juego` (el tipo), `solista` (el del solo o la boda) y `pareja` (en la boda, cuando se sabe; `null` mientras no).
- **Bandos:** `re` (los asientos del bando Re, calculados al acabar las reservas o al saberse la pareja de la boda).
- **Anuncios:** `anuncios`, el nivel de cada bando (0 nada, 1 Re/Contra, 2 no 90… 5 negro) y quién hizo cada uno.
- **Puntos:** `puntos` (marcador por jugador), `resultadosManos` y `manoNumero`.
- **Otros:** `azar`.

### 3. Acciones
- **`reservar { reserva }`:** `'sano'`, `'boda'`, `'damas'`, `'jotas'` o `'triunfo'`. Cuando han hablado los cuatro, se fija el juego (el primer solo; si no hay, la boda; si no, el normal) y empiezan las bazas.
- **`anunciar`:** sube un nivel el anuncio de su bando. Solo en su turno de bazas y antes de jugar, si cumple el plazo:
  - el plazo es `12 − nivel` cartas en la mano o más;
  - en la boda, el plazo baja en las bazas jugadas hasta saberse la pareja, y no se puede anunciar mientras no se sepa.
- **`jugar { carta }`:** una carta legal. Al completar la baza:
  - gana la más fuerte, y con dos iguales la primera;
  - en la boda, dentro de las tres primeras bazas, si la gana otro jugador pasa a ser la pareja; si tras la tercera no la hay, el solista juega solo.
- Al acabar la duodécima baza se puntúa la mano. Si es la octava, termina la partida; si no, pasa el repartidor y se reparte.

### 4. Puntos de la mano
`puntuarManoDoppelkopf(estado)` devuelve el `ResultadoManoDoppelkopf`:
- `re` (los asientos), `cartasRe` y `cartasContra` (los puntos de las cartas);
- `ganador` (`'re'`, `'contra'` o `null`);
- `conceptos` (la lista de lo que se suma, con su bando y sus puntos, para el resumen);
- `valor` (para Re) y `cambio` (lo que suma cada jugador).

Reglas:
- **Mínimos:** Re necesita 121, o 120 si Contra anunció y Re no.
- **Bajadas:** el bando que anunció una bajada necesita que el rival quede por debajo.
- **Puntos especiales:** se cuentan baza a baza con `bazas`. El zorro y Carlitos miran quién jugó cada carta.

### 5. Vista
- **Visible:**
  - su mano y su bando;
  - `cartasEnMano` de cada uno, `reservas`, `juego`, `solista`, `pareja` y `anuncios`;
  - `mesa` y `bazas`;
  - `bandos`: por asiento, `'re'`, `'contra'` o `null` si aún no se sabe. Un jugador se sabe de Re si jugó una Q de tréboles en el juego normal o la boda, si anunció por Re, o si es el solista o la pareja. Se sabe de Contra si anunció por Contra, o si se sabe que los dos de Re son otros.
  - `puntos`, `resultadosManos` y `manoNumero`.
- **Oculto:** las manos ajenas y el bando de quien no se ha descubierto.

### 6. IAs
- **Normal (`ia/doppelkopf-basica.ts`):** las reglas de la spec. Para saber quién es de su bando usa `bandos` de la vista.
- **Difícil (`ia/reconstruir/doppelkopf.ts`):** `SIMULABLE_DOPPELKOPF`.
  - **Qué decide la normal:** las reservas (`decideLaBase` en la fase `'reservas'`) y los anuncios: con `candidatas`, si la normal anuncia se anuncia, y si no, se simulan solo las cartas.
  - **Qué simula:** las cartas, con `horizonte` hasta el final de la mano, con la valoración de lo que gana o pierde en la mano su asiento.
  - **Reconstrucción:** reparte las cartas que no se ven con `repartirConPermitidos`:
    - quien no siguió un palo no recibe cartas de ese palo;
    - en el juego normal, quien se sabe de Re y no ha jugado una Q de tréboles recibe una primero;
    - quien se sabe de Contra no recibe ninguna;
    - las dos Q de tréboles quedan en manos distintas.
  - **Valores:** `reconstrucciones` 10 y `presupuesto` 60, sin `horizonte` (se simula hasta el final de la mano). Valora lo que gana o pierde en la mano, más la diferencia de puntos de cartas como desempate. Jugando uno contra tres normales gana 92 de 200 partidas (de 2 manos; le corresponderían unas 50) y decide en 50 ms como máximo.

### 7. Cliente
- **`MesaDoppelkopf.svelte`:** sobre `MesaBazas` con cuatro asientos.
  - **Reservas:** botones `reserva-{tipo}`.
  - **Anuncio:** botón `anunciar` con el nombre del siguiente anuncio.
  - **Información:** el tipo de juego, el número de mano (`mano-ronda`) y, en cada rival, su bando cuando se sabe y sus anuncios.
- **`ResumenDoppelkopf.svelte`:** el resumen de la mano: bandos, puntos de cartas, conceptos y cambio de cada jugador.
- **Fin:** el Doppelkopf entra en la lista de juegos sin parejas fijas de `Fin.svelte` y muestra el marcador por jugador.

## Risks / Trade-offs

- **[Parejas secretas en la reconstrucción]** → Si se repartiera sin las restricciones de las Q de tréboles, la simulación vería bandos imposibles. Las restricciones van en el orden de `repartirConPermitidos`, y si no se pueden cumplir se reparte sin ellas.
- **[Plazos en la boda]** → Los plazos de los anuncios en la boda dependen de cuándo se sabe la pareja. Se guarda el número de la baza en la que se supo.
- **[Partidas largas]** → Una ronda de 8 manos de 12 bazas. Los tests de partidas completas usan IAs rápidas, y la suite del contrato limita los pasos.
