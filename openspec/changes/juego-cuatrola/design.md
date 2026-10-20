## Context

La Cuatrola se parece al Tute subastado en su forma (subasta por turnos, el ganador elige el triunfo, cobro en fichas, partida a manos), pero sus cartas no:
- **Orden:** los matadores pertenecen al triunfo aunque sean de otro palo (la espadilla y el basto), y oros y copas se ordenan al revés fuera del triunfo. `ValoresBazas` y `cartaGanadora`/`cartasObligadas` de `motor/bazas.ts` suponen que el palo de una carta es fijo y que el orden solo depende del valor, así que no sirven.
- **Obligaciones:** solo seguir el palo, con el privilegio de los matadores.
- **Compañero secreto:** la vista no puede decir quién es el compañero hasta que juega la carta llamada.

Se reutilizan:
- `MesaBazas` de 4, el panel de subasta y el resumen en fichas del Tute subastado;
- `repartirConFallos` para la reconstrucción.

## Goals / Non-Goals

**Goals:**
- Cuatrola completa: subasta con rey o solo, triunfo y carta llamada, compañero oculto, orden del Tresillo, privilegio de los matadores, cobro con bola y fin por manos.
- IA en los tres niveles. La difícil gana a la normal en la prueba de fuerza.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- Codillo, vuelta, bola anunciada, cobros por matadores y el Tresillo de 3.
- Generalizar `motor/bazas.ts` para palos variables: la Cuatrola tiene su propio orden en su archivo.

## Decisions

### 1. Orden y palo efectivo
En `juegos/cuatrola.ts`:
- `esMatador(carta, triunfo)`: la espadilla, la malilla del triunfo, el basto y, con triunfo rojo, el punto.
- `paloCuatrola(carta, triunfo)`: el triunfo si la carta es matador; si no, su palo. El As de espadas y el de bastos son siempre del triunfo, porque son siempre matadores.
- `rangoCuatrola(carta, triunfo)`: un número, mayor cuanto más alta es la carta dentro de su palo efectivo. Se calcula con tablas:
  - **Triunfo:** espadilla 100, malilla 99, basto 98, punto 97, y después R, C, S y los números según el color.
  - **Palo no triunfo:** rojo R, C, S, As, 2…7; negro R, C, S, 7…2.
- `ganadoraCuatrola(mesa, triunfo)`: gana el triunfo de mayor rango; si no hay triunfo, la de mayor rango del palo de salida.
- `jugablesCuatrola(mano, mesa, triunfo)`:
  - con la baza vacía, cualquier carta;
  - si la salida es triunfo, las cartas obligadas son los triunfos de la mano menos los matadores de rango mayor que la salida. Si no queda ninguna, cualquier carta; si queda alguna, esas más los matadores privilegiados;
  - si la salida no es triunfo, las de ese palo si tiene; si no, cualquier carta.

### 2. Estado
`EstadoCuatrola` guarda:
- **Partida:** `config` (`manos: 4 | 8 | 12`), `azar`, `repartidor`, `numeroMano` y `fichas`.
- **Mano:** `manos`, `fase: 'subasta' | 'triunfo' | 'bazas'` y `turno`.
- **Subasta:** `dichos: ('rey' | 'solo' | 'paso' | null)[]`, `modalidad: 'rey' | 'solo' | null`, `jugador` y `todosPasaron`.
- **Triunfo y llamada:** `triunfo`, `llamada: IdCarta | null` y `companero: Asiento | null`. Este último se fija al elegir la llamada, buscando quién la tiene; con solo, es `null`.
- **Bazas:** `mesa`, `bazasMano`, `bazas` por asiento y `ultimaBaza`.
- **Historial:** `resultadosManos`.

Acciones:
- `pujar{modalidad}` y `pasar`;
- `elegir{triunfo, llamada}`: con rey, cada palo por cada rey (o caballo) que no tenga; con solo, `llamada: null`. Elegir triunfo y llamada en una sola acción da como mucho 16 opciones y simplifica la simulación;
- `jugar{carta}`.

La subasta es la del Tute subastado con dos pujas posibles. «Solo» la cierra en el acto.

### 3. Compañero oculto
La vista lleva `companero`:
- para el propio compañero, siempre;
- para el resto, solo cuando la carta llamada ya está en `bazasMano` o en la `mesa`;
- para un espectador, cuando se ha jugado.

El estado conserva `companero` desde el principio. `cartasOcultas` del contrato no cambia, pero se añade un test de que la vista de un defensor no revela al compañero.

### 4. Cobro
`valor = modalidad === 'rey' ? 1 : 2`, y se dobla con bola. Con `gana` = bazas del bando ≥ 6:
- **Rey gana:** jugador y compañero `+2·valor`, defensores `−2·valor`.
- **Rey pierde:** jugador `−4·valor`, defensores `+2·valor`, compañero 0.
- **Solo:** jugador `±3·valor`, cada rival `∓valor`.

La suma es siempre 0. La bola dobla el cobro del bando que gana con las 10 bazas, sea el del jugador o el de los defensores.

El jugador nunca se llama a sí mismo: la llamada excluye sus cartas. Si tiene los 4 reyes, se ofrecen los caballos que no tenga; si tiene también los 4 caballos (cabe en 10 cartas), las sotas que no tenga. Con 10 cartas no puede tener las 12 figuras, así que siempre hay alguna carta que llamar.

### 5. IA básica (`ia/cuatrola-basica.ts`)
- **`bazasEsperadas(mano, triunfo)`:**
  - matadores: espadilla, malilla y basto 0,95; punto 0,85;
  - otros triunfos según su rango y cuántos tenga (con 5 o más, los bajos también cuentan);
  - reyes de otros palos 0,6 y caballos guardados 0,3.
- **Puja:** si la mejor estimación es ≥ 6, solo; si es ≥ 3,5, con rey (si aún se puede). Con 4, pasaban los cuatro en el 28 % de los repartos; con 3,5, en el 7 %, y el jugador gana el 79 % de las manos; si no, pasa. Las constantes se ajustan con partidas entre IAs.
- **Elegir:** el palo de mejor estimación y el rey del palo, no triunfo, con menos cartas en la mano (si hay empate, el del palo en que no tiene el caballo).
- **Cartas:**
  - `companeros(vista)`: el jugador conoce a su compañero cuando se descubre; el compañero conoce al jugador; los defensores se conocen entre sí cuando se descubre el compañero (antes, el defensor solo sabe que el jugador es rival);
  - responde como la heurística común: si la baza es del compañero, la más baja; si no, la más baja que la gane, o la más baja;
  - el jugador sale de triunfo mientras tenga el triunfo más alto que queda y queden triunfos fuera.

### 6. Niveles y reconstrucción
- **Fácil:** `conErrores`.
- **Reconstrucción** (`ia/reconstruir/cuatrola.ts`):
  - las cartas ocultas son las manos ajenas;
  - `fallosCuatrola(bazasMano, triunfo)`: quien no siguió el palo de salida no lo tiene. Con salida de triunfo, solo se marca que no tiene triunfos que no sean matadores privilegiados, y los matadores más altos que la salida siguen siendo posibles;
  - la carta llamada, si no se ha jugado y no es mía, va primero a uno de los otros asientos que no son el jugador, al azar según su hueco; el resto, con `repartirConFallos`. El `companero` del estado reconstruido es quien recibe esa carta.
- **Restricción de matadores en `repartirConFallos`:** como los fallos van por palo y los matadores cambian de palo efectivo, la reconstrucción trabaja con el palo natural: si un asiento no tiene triunfos, tampoco tiene la espadilla ni el basto (se excluyen a mano antes de repartir).
- **Difícil:** `SIMULABLE_CUATROLA` decide como la normal en la fase `subasta` y simula `elegir` y `jugar`. Valoración: las fichas de la mano simulada más el bono de partida y un término fino de bazas del bando (bazas − 5,5) / 4.
- **Presupuesto inicial:** 24 reconstrucciones y 160 simulaciones, que se ajustan en la prueba de fuerza (1 de cada 4, en menos de 250 ms).

### 7. Cliente
- `MesaCuatrola.svelte` sobre `MesaBazas`:
  - **Subasta:** un panel como el del Tute subastado con tu mano en miniatura, lo que dijo cada uno y tres botones: «Paso», «Con rey» y «Solo».
  - **Elegir:** cuatro botones de palo y, si se juega con rey, las cartas que se pueden llamar, pintadas en miniatura y elegibles tras el palo.
  - **Marcador:** «Juega X con rey · triunfo oros · llama al Rey de copas», el compañero cuando se sabe («Compañero: Rival 2», o «Eres el compañero») y las bazas por bando.
- `ResumenCuatrola.svelte`: una tabla con el cambio de fichas y el total, como en el Tute subastado.
- La guía usa un ejemplo nuevo, `matadores`, con las cuatro cartas de los matadores con triunfo de oros.

## Risks / Trade-offs

- **[El orden propio confunde a la IA común]** → la IA de la Cuatrola usa `rangoCuatrola` y no `bazas-heuristica.ts`, que supone `ValoresBazas`.
- **[Fallos mal inferidos por el privilegio]** → la inferencia es conservadora: ante una salida de triunfo, nunca descarta matadores más altos que la salida. Un test reparte miles de estados y comprueba que la reconstrucción es coherente.
- **[Compañero filtrado en la vista]** → un test recorre partidas al azar y comprueba que, mientras no se juega la carta llamada, `companero` es `null` en las vistas de los demás.
- **[Pocas manos jugadas porque todos pasan]** → la básica entra con rey desde 3,5 bazas esperadas: entre IAs, solo el 7 % de los repartos acaba con los cuatro pasando.
