## Context

El Tarot es el primer juego de la suite con una baraja que no es ni española ni francesa:
- tiene 21 triunfos numerados y la Excusa, que no tienen palo;
- los palos franceses llevan un Caballo entre la Sota y la Dama.

El resto se parece a juegos que ya hay:
- la subasta de un contrato contra los demás, como el Tute subastado y el Skat;
- el perro, como el *skat* del Skat;
- la pareja secreta de 5 jugadores, como la carta llamada de la Cuatrola;
- las bazas para 3, 4 o 5, en la mesa de bazas compartida.

## Goals / Non-Goals

**Goals:**
- La baraja de Tarot en el motor y su dibujo en el cliente.
- Tarot de 3, 4 o 5 con los cuatro contratos, el perro, la llamada al Rey con 5, el *petit au bout*, las *poignées* y una ronda en la que cada uno reparte dos veces.
- IA normal por reglas y difícil que simula el carteo.

**Non-Goals:**
- El chelem, la *misère* y las variantes sin perro.

## Decisions

### 1. Baraja (`baraja/cartas.ts`)
- **Identificadores:**
  - `IdCarta` admite además `triunfo-${n}` (del 1 al 21) y `'excusa'`;
  - el Caballo es `${palo}-14` con palo francés;
  - `cartaDeId` acepta el valor 14 en los palos franceses, y devuelve `null` para los triunfos y la Excusa (como con los comodines). La baraja francesa de 52 no cambia.
- **Funciones nuevas:**
  - `BARAJA_TAROT` (las 78);
  - `esTriunfoTarot(id)`, `numeroTriunfo(id)` y `esExcusa(id)`.
- **Test:** el test de identidad que daba `picas-14` por inválido pasa a probar `picas-15`.

### 2. Cartas del juego (`juegos/tarot.ts`)
- **Fuerza:**
  - un triunfo vale 100 + su número;
  - una carta de palo, su rango: 1–10, Sota 11, Caballo 12, Dama 13 y Rey 14;
  - la Excusa, 0.
- **Valores:** en medios puntos, para no usar decimales: *oudlers* y Reyes 9, Damas 7, Caballos 5, Sotas 3, el resto 1. En total suman 182.

### 3. Estado
- **Config:** `{ jugadores: 3 | 4 | 5 }`.
- **Cartas:** `manos`, `perro`, `descarte` (las cartas descartadas por el preneur), `mesa` y `bazas` (quién salió, las cartas y quién ganó).
- **Turno:** `fase` (`'subasta'`, `'llamada'`, `'descarte'` o `'bazas'`), `turno` y `repartidor`.
- **Subasta:** `dichos` (por asiento: `null`, `'pasa'` o el contrato), `contrato` y `preneur`.
- **Pareja:**
  - `llamada` (la carta llamada, con 5);
  - `pareja` (quién la tiene, o `null` si está en el perro);
  - `parejaDescubierta` (si ya se ha jugado).
- **Poignées:** `poignees`: quién, el nivel y las cartas enseñadas.
- **Puntos:** `puntos` (marcador), `resultadosManos` y `manosJugadas`.
- **Otros:** `azar`.

### 4. Acciones
- **Subasta:**
  - `pujar { contrato }` y `pasar`;
  - al hablar todos, si nadie ha pedido nada, la mano es nula (un resultado con valor 0) y se reparte la siguiente;
  - si no, con 5 se pasa a `'llamada'` y, si no, al perro.
- **Llamada:** `llamar { carta }`, una de las cartas que puede llamar.
- **Perro:**
  - en la Petite y la Garde se añade a la mano del preneur y empieza `'descarte'`;
  - en las otras, empiezan las bazas.
- **Descarte:** `descartar { carta }`, una a una, con las restricciones de la spec. Al completarse, empiezan las bazas.
- **Bazas:**
  - `poignee { nivel }` en el primer turno del jugador, antes de jugar;
  - `jugar { carta }` con las obligaciones de la spec. Cuando se juega la carta llamada, `parejaDescubierta` pasa a cierto.
- **Fin de mano:** al acabar la última baza, `puntuarManoTarot` calcula el resultado; si es la última mano de la ronda, termina la partida.
- **Reparto:** se baraja de nuevo, con el mismo azar, mientras alguien tenga el Petit seco.

### 5. Puntos
`puntuarManoTarot(estado)` devuelve el `ResultadoManoTarot`:
- `contrato`, `preneur` y `pareja`;
- `oudlers`, `puntosAtaque` (en medios puntos) y `necesarios`;
- `gana`, `diferencia`, `petitAuBout` (`'ataque'`, `'defensa'` o `null`) y `poignees`;
- `valor` (para el preneur, como en la spec) y `cambio` (por jugador).

Reglas del recuento:
- **La Excusa:** cuenta para el bando de quien la jugó. Si la baza la gana el otro bando, el dueño se queda 8 medios puntos y el ganador 1.
- **El perro:**
  - en la Petite y la Garde, el descarte cuenta para el ataque;
  - en la Garde sans, el perro cuenta para el ataque;
  - en la Garde contre, para la defensa.

### 6. Vista
- **Visible:**
  - su mano y `cartasEnMano`;
  - `dichos`, `contrato`, `preneur` y `llamada`;
  - `pareja`, solo si está descubierta o es el propio jugador;
  - `perro`, solo mientras se enseña: en la Petite y la Garde, desde el fin de la subasta (o de la llamada) hasta el fin del descarte;
  - `descarte`: el completo solo para el preneur; para los demás, los triunfos descartados;
  - `poignees`, `mesa`, `bazas`, `puntos`, `resultadosManos`, la mano de la ronda y el número de manos.
- **Bandos:** por asiento, `'ataque'`, `'defensa'` o `null`, como en el Doppelkopf: con 3 o 4 se saben todos; con 5, la pareja hasta que se descubre solo la sabe ella.

### 7. IAs
- **Normal (`ia/tarot-basica.ts`):** las reglas de la spec.
  - **Valor de la mano:** 21 de triunfo 10; Excusa 8; Petit 8 con 5 triunfos o más, y 5 si no; cada triunfo 2 (y 1 más si es del 16 al 20); Rey 6; Dama 3; Caballo 2.
  - **Umbrales con 4:** Petite 40, Garde 56, Garde sans 71, Garde contre 81. Con 3 se multiplican por 1,25 y con 5 por 0,85.
- **Difícil (`ia/reconstruir/tarot.ts`):** `SIMULABLE_TAROT`.
  - **Qué decide la normal:** la subasta, la llamada y el descarte (`decideLaBase` fuera de las bazas) y la *poignée* (con `candidatas`, como los anuncios del Doppelkopf).
  - **Qué simula:** las cartas hasta el final de la mano, con la valoración del cambio de su asiento en la mano.
  - **Reconstrucción:** reparte las cartas que no se ven con `repartirConPermitidos`, con las restricciones de la spec niveles-ia. Las cartas de una *poignée* que aún no se han jugado se dejan fijas en su mano.
    - Los huecos son las manos ajenas, el descarte oculto y el perro oculto.
    - El perro enseñado solo puede ir a la mano del preneur o a su descarte.
  - **Valores:** `reconstrucciones` 10 y `presupuesto` 60, sin `horizonte`. Valora el cambio de su asiento en la mano dividido entre 25. Con 4 jugadores, uno contra tres normales, gana 88 de 200 partidas (le corresponderían unas 50) y decide en 104 ms como máximo. La normal gana 193 de 200 a tres jugadores al azar.

### 8. Cliente
- **Cartas:** `Carta.svelte` dibuja:
  - el triunfo con un marco de color, su número grande en el centro y pequeño en las esquinas;
  - la Excusa con una estrella y su nombre;
  - el Caballo con la figura `caballo` que ya existe;
  - `nombreCarta` da «Triunfo N», «Excusa» y «Caballo de …».
- **`MesaTarot.svelte`:** sobre `MesaBazas`.
  - **Botones:** `contrato-{c}` y `pasar` en la subasta, `llamar-{carta}` con 5 y `poignee` en el primer turno.
  - **El perro:** mientras se enseña, en la barra de información (`perro`).
  - **Descarte:** las cartas de la mano que se pueden descartar se marcan como jugables; al tocarlas se descartan.
- **Opciones:** el número de jugadores (3, 4 o 5).
- **`ResumenTarot.svelte`:** el resumen de la mano.
- **Fin:** el Tarot entra en la lista de juegos sin parejas fijas de `Fin.svelte`.
- **Manos grandes en la mesa compartida:** con más de 12 cartas, la mesa compartida se compacta para que todo quepa en 360 px. Con 12 o menos no cambia nada, así que los juegos que ya había se ven igual.
  - `ManoPropia` junta las cartas sin hueco y deja ver solo la esquina (22 % de la carta).
  - `AsientoRival` solapa más los dorsos para que ocupen lo mismo que 12.

## Risks / Trade-offs

- **[Manos de 24 cartas con 3 jugadores]** → La mano propia ya solapa las cartas (como en el Pinacle). Hay que comprobarlo a 360 px.
- **[Cambiar la baraja francesa]** → Admitir el valor 14 podría colarse en otros juegos. `crearBaraja('francesa52')` no lo genera y ningún juego lo usa, pero el test de identidad lo vigila.
- **[Bandos secretos con 5]** → Como en el Doppelkopf, la vista calcula lo que cada asiento sabe, y la reconstrucción no pone la carta llamada en la mano del preneur.
