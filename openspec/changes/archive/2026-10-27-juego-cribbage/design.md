## Context

El Cribbage tiene tres fases en cada mano:
- echar al *crib*, en la que los dos jugadores deciden a la vez;
- jugar las cartas (*pegging*), con sus puntos y el «go»;
- el recuento, sin decisiones.

Además, la partida puede terminar a mitad de mano. El contrato del motor es por turnos: hay que ordenar las decisiones simultáneas y hacer el recuento de forma automática.

## Goals / Non-Goals

**Goals:**
- Cribbage de 2 a 121 con *crib*, corte, *pegging* completo con el go y recuento automático desglosado.
- Pocas acciones legales y canónicas.
- IA normal por reglas y difícil por simulación del *pegging* que le gane.

**Non-Goals:**
- 3 jugadores, *muggins*, partida a 61 y *skunk*.

## Decisions

### 1. Cartas y puntos (`juegos/cribbage.ts`)
- **Número:** `rangoCribbage(c)` va del 1 (As) al 13 (K).
- **Valor para contar:** `valorCribbage(c)` es el mínimo del número y 10.
- **`puntosRecuento(cartas, starter, esCrib)`:** el desglose `{ quinces, parejas, escaleras, color, nobs, total }`.
  - **quinces:** los subconjuntos de las 5 cartas que suman 15;
  - **parejas:** las parejas de cartas del mismo número;
  - **escaleras:** las de longitud máxima por tramo de números seguidos, multiplicadas por las veces que aparece cada número;
  - **color** y **nobs:** según las reglas.
- **`puntosJugada(secuencia, cuenta)`:** los puntos de la última carta jugada al *pegging*: quince, 31, parejas por las últimas cartas iguales y la escalera más larga entre las últimas cartas.

### 2. Fases y turnos
- **`descarte`:**
  - le toca primero al que no reparte, que echa 2 cartas (`echar { cartas }`), y después al repartidor;
  - con las dos hechas, se corta el *starter* (y suma 2 el repartidor si es una J) y se pasa a `juego`;
  - el primero que se descarta no ve lo que echó el otro, ni el otro lo suyo.
- **`juego`:** turno, `cuenta`, `secuencia` (desde la última vuelta a 0), `pasaron` (los que dijeron go) y `ultimoEnJugar`.
  - **Acciones:** `jugar { carta }` con las cartas que caben, o `go` si no cabe ninguna.
  - **Tras jugar:**
    - si la cuenta llega a 31, vuelve a 0 y sale el otro;
    - si no, le toca al otro salvo que haya dicho go o no tenga cartas, y entonces sigue el mismo;
    - si ninguno tiene cartas, la última carta suma 1 (salvo 31) y se pasa al recuento.
  - **Tras un go:** si el otro puede seguir (no dijo go y tiene cartas), le toca. Si no, el último en jugar suma 1, la cuenta vuelve a 0 y sale el otro (o el mismo, si el otro no tiene cartas).
  - **Turno sin cartas:** a un jugador sin cartas nunca le toca, así que no hay go forzados.
- **Recuento:**
  - automático, en orden: mano del que no reparte, mano del repartidor y *crib*;
  - se apunta en `resultadosManos` con las cartas, el *starter*, el desglose de cada recuento y los puntos del *pegging* de cada uno;
  - después se reparte otra mano con el otro repartidor.
- **Fin:** cada vez que se suman puntos se mira si alguien llega a 121; si llega, la partida termina allí. Si es en el recuento, no se cuentan los siguientes, y el resultado de la mano se guarda igual, marcando lo que se llegó a contar.

### 3. Estado
- **Cartas:** `manos` (las que quedan por jugar), `guardadas` (las 4 de cada uno para el recuento), `crib`, `echadas` (las 2 que echó cada uno), `mazo` y `starter`.
- **Turno y fase:** `repartidor`, `fase` y `turno`.
- **Juego de las cartas:** `cuenta`, `secuencia`, `jugadasMano`, `pasaron` y `ultimoEnJugar`.
- **Partida:** `puntos`, `puntosJuego` (lo que lleva cada uno en el *pegging* de la mano), `resultadosManos`, `ultimaAccion` (`{ asiento, accion, puntos, motivos }`) y `azar`.

### 4. Vista
- **Públicas:**
  - el *starter*, la cuenta, la secuencia y las jugadas de la mano;
  - los go, los puntos y la última acción con sus puntos;
  - los resultados con las manos descubiertas.
- **Propias:** la mano y las `echadas`.
- **Ocultas:** la mano del otro, sus `echadas` y el mazo.

### 5. IAs
- **Normal (`ia/cribbage-basica.ts`):**
  - **Echar:** para cada una de las 15 parejas posibles, la media de `puntosRecuento` de las 4 que quedan con cada *starter* posible (de las 46 cartas que no ve), más (o menos, si el *crib* es del otro) un valor rápido de las 2 que echa: 2 por quince, 2 por pareja y 1 por cada 5.
  - **Jugar:** los puntos inmediatos × 10, menos 3 si deja la cuenta en 5 o 21, más el valor de la carta / 10 para soltar antes las altas.
- **Difícil (`ia/reconstruir/cribbage.ts`):** `SIMULABLE_CRIBBAGE`.
  - **Qué simula:** solo el *pegging* (`decideLaBase` al echar), hasta el final de la mano.
  - **Reconstrucción:** la mano del otro, sus `echadas` y el mazo salen al azar de las cartas que no se ven. Sus `guardadas` son su mano más las que ya jugó, que constan en `jugadasMano`.
  - **Valoración:** sus puntos ganados en la mano menos los del otro, más el bono de partida.
  - Valores: `reconstrucciones` 40 y `presupuesto` 300. Con 20 y 100 ganaba a la normal 112 de 200; con estos, 121, y cada decisión tarda como mucho unos 30 ms.

### 6. Cliente
- **`MesaCribbage.svelte`:**
  - el tablero con dos barras hasta 121 y los puntos;
  - el rival y quién reparte;
  - el mazo con el *starter*, el *crib* (boca abajo, o con las propias echadas si es suyo) y la cuenta con la secuencia;
  - el aviso de puntos y la mano.
- **Jugar:**
  - **echar:** marcar 2 cartas y «Al crib»;
  - **juego:** tocar una carta y la mesa, o «Go».
- **`ResumenCribbage.svelte`:** los tres recuentos con sus cartas, el *starter* y el desglose, los puntos del *pegging* y los totales.

## Risks / Trade-offs

- **[La IA normal echa con 15 × 46 recuentos]** → Unos 700 recuentos de 5 cartas, rápido. La difícil no lo simula: usa la normal.
- **[El fin a mitad del recuento]** → El resumen de la última mano puede quedar a medias. Se marca con `contados` (cuántos recuentos se hicieron) y la pantalla de fin muestra solo esos.
