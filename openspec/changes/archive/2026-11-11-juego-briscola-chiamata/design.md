## Context

La Briscola Chiamata es la Brisca para 5 con subasta y compañero oculto. Se reaprovechan:
- la baraja `espanola40` y el orden y los puntos de la Brisca;
- la mesa de bazas compartida (`MesaBazas`), que ya admite 5 jugadores (como el Julepe);
- la carta llamada de la Cuatrola, en el motor (compañero oculto hasta que sale) y en la vista;
- la reconstrucción con `repartirConPermitidos`;
- el registro del menú por familias y del modo asistido, que funcionan con cualquier juego con IA.

## Goals / Non-Goals

**Goals:**
- Briscola Chiamata para 5 a 5 manos, con subasta por carta y por puntos, jugar solo al llamar una carta propia y los puntos de partida ±2/±1/∓1 (±4 solo), con la IA de los tres niveles, en red y con su mesa.

**Non-Goals:**
- El cappotto, las señas y las variantes para 4 o 6 jugadores.

## Decisions

### 1. Cartas (`juegos/briscola-chiamata.ts`)
- **Baraja:** `crearBaraja('espanola40')`, 8 cartas a cada uno.
- **Rango y puntos:** los de la Brisca (As, 3, Rey, Caballo, Sota, 7…2; 11, 10, 4, 3 y 2). Si la Brisca no los exporta, se exportan desde allí en lugar de copiarlos.
- **Ganadora:** `ganadoraBriscolaChiamata(mesa, triunfo)`: el triunfo más alto o, si no hay, la más alta del palo de salida.

### 2. Subasta
- **Niveles:** una puja es un `nivel` entero:
  - 0 a 9 son las cartas As, 3, Rey, Caballo, Sota, 7, 6, 5, 4 y 2 (61 puntos);
  - de 10 a 68 son «2 con N», con N = nivel + 52 (de 62 a 120).
  
  `cartaDeNivel(n)` da el valor de la carta (el 2 desde el 9) y `puntosDeNivel(n)` los puntos que pide.
- **Acciones:** `pujar { nivel }` (cualquier nivel mayor que el último pujado) y `pasar`.
- **Obligación del que reparte:** si los cuatro primeros pasan, `pasar` no es legal para el que reparte y su única puja legal es el nivel 0. Así cada mano se juega y la partida dura siempre 5 manos.
- La subasta acaba cuando todos menos uno han pasado tras una puja; ese jugador es el llamador.

### 3. Llamada, compañero y bazas
- **Fases:** `'subasta' | 'llamada' | 'bazas'`.
- **`llamar { palo }`:** la carta llamada es `cartaDeNivel(nivel)` de ese palo y el triunfo es ese palo. El compañero es quien la tiene; si es el llamador, `solo: true`.
- **`descubierto`:** pasa a `true` al jugarse la carta llamada.
- **Bazas:** `jugarCarta { carta }`, cualquier carta de la mano. Sale el siguiente al que reparte.

### 4. Puntuación y partida
- **Puntos de la mano:** por asiento (`puntosMano`), con las cartas de cada baza ganada.
- **`ResultadoManoBriscolaChiamata`:** `repartidor`, `llamador`, `nivel`, `objetivo` (61 o los pujados), `llamada`, `companero`, `solo`, `puntosBando`, `ganada`, `cambio` (puntos de partida por asiento) y `marcadorTras`.
- **Marcador:** por asiento, con los cambios de la spec (suman 0).
- **Fin:** tras `manos` manos (5 por defecto); `Fin.puntos` es el marcador y ganan los que más tienen. **Config:** `{ manos: number }`; las pruebas usan 1.

### 5. Estado y vista
- **Estado:**
  - `repartidor`, `manos`, `fase`, `turno`;
  - `pujas` por asiento (`number | 'paso' | null`), `nivel`, `llamador`, `llamada`, `triunfo`, `companero`, `solo`, `descubierto`;
  - `mesa`, `ultimaBaza`, `puntosMano`, `manosJugadas`, `marcador`, `resultadosManos`, `azar`.
- **Vista:** todo lo público; la mano propia y cuántas tiene cada uno. `companero` solo si `descubierto`, si el jugador es el compañero, o si es el llamador jugando solo; si no, `null`. `soyCompanero` para el que tiene la carta llamada.

### 6. IAs
- **Normal (`ia/briscola-chiamata-basica.ts`):** las reglas de la spec, con `fuerzaBriscolaChiamata(mano)` y `nivelMaximoBriscolaChiamata(mano)`.
- **Difícil (`ia/reconstruir/briscola-chiamata.ts`):** `SIMULABLE_BRISCOLA_CHIAMATA`.
  - **Reconstrucción:** las manos ajenas con `repartirConPermitidos` entre las cartas que no se ven. Para el estado reconstruido, el compañero es quien tenga la carta llamada (y `solo` si la tiene el llamador).
  - **`decideLaBase`:** fuera de las bazas (subasta y llamada).
  - **Valoración:** el cambio de su marcador en la mano, más `bonoPartida`.
  - **Valores:** `reconstrucciones` y `presupuesto` como en el Twenty-Nine; se ajustan para que gane a la normal sin pasar de 500 ms.

### 7. Cliente
- **`MesaBriscolaChiamata.svelte`:** sobre `MesaBazas` con 5 jugadores, a partir de `MesaTwentyNine`.
  - **Subasta:** un botón por cada carta que se puede pujar y, cuando ya se puede pujar por puntos, un selector con − y + y «Pujar 2 con N»; «Paso» si es legal.
  - **Llamada:** un botón por palo con el nombre de la carta («Rey de oros»).
  - **Información:** la puja y quién pujó, la carta llamada y el triunfo, el compañero («Compañero: tú», el nombre o «sin descubrir»), los puntos de cada jugador en la mano y los puntos de partida.
- **`ResumenBriscolaChiamata.svelte`:** la puja, la carta llamada, el compañero (o «Solo»), los puntos del bando, «Ganada» o «Perdida» y una fila por jugador con su cambio y su marcador.
- **Menú y modo asistido:** entrada en `CATALOGO` (familia `bazasContrato`, baraja española), consejo en `CONSEJOS_JUEGO`; la cuenta de juegos con IA de `contexto.test.ts` pasa de 68 a 69 y la de la familia de 15 a 16.
- **Fin:** juego individual de 5 jugadores, con los puntos de partida de cada uno.

## Risks / Trade-offs

- **69 pujas posibles** → la subasta la decide la base, y la mesa muestra los puntos con un selector en vez de 59 botones.
- **Un defensor no sabe quién es su compañero** → la IA básica solo cuenta como rival al llamador hasta que se descubre; la difícil lo resuelve simulando.
- **El que reparte obligado a pujar** → es una regla de la casa para que cada mano se juegue; si no, la partida de 5 manos podría no acabar.
