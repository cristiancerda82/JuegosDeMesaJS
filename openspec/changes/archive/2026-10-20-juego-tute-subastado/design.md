## Context

Casi todo existe ya:
- **Cartas y cantes del Tute:** `juegos/tute.ts` tiene el orden y los puntos (los de la Brisca, `VALORES_BRISCA`), las 10 de últimas, `palosCantables` y `tieneTute`, hoy internos.
- **Bazas con obligaciones:** `cartasObligadas(mano, mesa, triunfo, { asiento, montarSobreCompanero: true })` obliga a superar siempre, también al compañero, como en el Julepe. `cartaGanadora` resuelve la baza.
- **Subasta y elección de triunfo:** la Butifarra ya tiene un jugador que elige el triunfo tras ver su mano y una fase previa a las bazas; la Pocha tiene apuestas por turnos.
- **Reconstrucción con fallos:** `repartirConFallos` (reconstrucción de la Butifarra) reparte las cartas ocultas sin dar a nadie un palo que se sabe que no tiene.
- **Cliente:** `MesaBazas` coloca 4 jugadores; `MesaTute` ya pinta cantes y botones de cantar.

Lo nuevo es la subasta de puntos y que los bandos cambien en cada mano.

## Goals / Non-Goals

**Goals:**
- Tute subastado completo de 4 jugadores: subasta, triunfo del pujador, bazas, cantes y tute, cobro en fichas y fin por manos.
- IA en los tres niveles. La difícil gana a la normal en la prueba de fuerza.
- Jugable en red sin tocar el servidor.

**Non-Goals:**
- El capote, la subasta con muestra, las variantes de 2 y 3 jugadores y las pujas de 5 en 5.
- Cerrar la mano antes de tiempo cuando el resultado ya está decidido: se juegan siempre las 10 bazas (salvo tute).
- Refactorizar el Tute: solo se exportan dos ayudas.

## Decisions

### 1. Estado
`EstadoTuteSubastado` guarda:
- **Partida:** `config` (`manos: 4 | 8 | 12`), `azar`, `repartidor`, `numeroMano` (manos que cuentan) y `fichas: number[]`.
- **Mano:** `manos`, `fase: 'subasta' | 'triunfo' | 'bazas'` y `turno`.
- **Subasta:** `pujas: (number | 'paso' | null)[]` (lo último que dijo cada uno; `null` es que aún no habló), `puja: number | null` y `pujador: Asiento | null`.
- **Triunfo:** `triunfo: PaloEspanol | null`, que es `null` hasta que lo elige el pujador.
- **Bazas:** `mesa`, `bazasMano` (las cartas de cada baza, para los fallos conocidos y la última baza), `puntos` y `bazas` por asiento.
- **Cantes:** `cantes` y `puedeCantar`, como en el Tute.
- **Historial:** `resultadosManos` y `ultimaBaza`, que persiste entre manos como en la Butifarra.

Acciones:
- `pujar{puntos}` y `pasar`;
- `triunfo{palo}`;
- `jugar{carta}`, `cantar{palo}` y `cantarTute`, como en el Tute.

Flujo:
- **Subasta:** el turno salta a los que han pasado. Tras una puja o un pase, si queda un único jugador sin pasar y hay puja, ese es el pujador y se pasa a la fase `triunfo`. Si pasan los cuatro sin puja, se reparte de nuevo con el siguiente repartidor sin sumar `numeroMano`. Las pujas legales son de `max(60, puja + 10)` a 230, de 10 en 10.
- **Triunfo:** solo el pujador tiene acciones (los cuatro palos). Al elegir, la fase pasa a `bazas` y el turno es suyo.
- **Bazas:** como en el Tute de 4 sin `cartaTriunfo` ni cambio del 7. Los cantes usan `palosCantables` y `tieneTute`, que se exportan desde `tute.ts`.
- **Bandos:** el pujador contra los otros tres. `bandoDe` de `motor/bazas.ts` (pares contra impares) no sirve; aquí el bando se calcula con `a === pujador`.
- **Cierre:** `valor = puja / 10`. Si cumple, el pujador suma `3 × valor` y cada rival resta `valor`; si falla, al revés. La partida termina cuando `numeroMano` llega a `config.manos`.

**Por qué no reutilizar `EstadoTute`:** el Tute supone bandos fijos, muestra o carta de triunfo y partida a manos ganadas. Adaptarlo llenaría `tute.ts` de casos; un archivo propio de unas 350 líneas, que importa las ayudas, es más claro.

### 2. Vista
La vista muestra lo público de la spec: pujas y pases, `puja`, `pujador`, `triunfo`, `bazasMano` (todas las cartas jugadas, baza a baza), `puntos` y `bazas` por asiento, cantes, `puedeCantar`, fichas y resultados. `cartasEnMano` da el número de cartas de los demás.

Que `bazasMano` vaya en la vista no revela nada: todas las cartas jugadas se ven al jugarlas, y la reconstrucción las necesita para los fallos.

### 3. IA básica (`ia/tute-subastado-basica.ts`)
- **Estimación por palo** (`estimarPuntos(mano, palo)`):
  - puntos seguros: Ases (11 + lo que suele caer en su baza) y Treses guardados por su As o con triunfos;
  - triunfos: cada triunfo vale según su rango y su número (con 5 o más, los bajos también ganan bazas);
  - cantes: 40 si tiene rey y caballo del palo, 20 por cada otra pareja;
  - las constantes se ajustan con partidas entre IAs.
- **Puja:** si la mejor estimación llega a la puja mínima posible, puja esa mínima; si no, pasa. Así sube de 10 en 10 sin saltar.
- **Triunfo:** el palo con la mejor estimación.
- **Cantes:** siempre que se pueda: el tute primero, después las 40 y luego las 20.
- **Cartas:** usa `bazas-heuristica.ts` (`cartaParaSalir`, `cartaParaResponder`) sabiendo quién es compañero: como defensor, si la baza la va ganando otro defensor y el pujador ya ha jugado, le carga la carta de más puntos que pueda. El pujador juega para sí. Para eso `SituacionBaza` recibe una función `companero(a)` opcional; por defecto sigue siendo `bandoDe`, así que los demás juegos no cambian.

### 4. Niveles y reconstrucción
- **Fácil:** `conErrores` sobre la básica, como el resto.
- **Reconstrucción** (`ia/reconstruir/tute-subastado.ts`):
  - las cartas ocultas son las manos ajenas;
  - `fallosSubastado(bazasMano, triunfo)`: quien no siguió el palo no lo tiene, y si además no jugó triunfo, no tiene triunfos (en este juego se falla siempre que se puede, no hay excepción del compañero);
  - reparte con `repartirConFallos`.
- **Difícil:** `SIMULABLE_TUTE_SUBASTADO` simula la elección del triunfo, los cantes y las cartas. En la subasta, `candidatas` devuelve solo la acción de la base. Durante la subasta y el triunfo, aún no se ha jugado ninguna carta, así que la reconstrucción no tiene fallos.
- **Valoración:** las fichas que gana el asiento en la mano simulada, más el bono de partida. Si el horizonte corta antes del final, se usa la diferencia de puntos del bando del asiento frente a lo que necesita (puja para el pujador, 131 − puja para los defensores) dividida entre 10.
- **Presupuesto inicial:** 8 reconstrucciones, presupuesto 40, sin horizonte (la mano tiene 40 cartas como mucho). Se ajusta en la prueba de fuerza, que pide que la difícil gane más de 1 de cada 4 partidas a tres normales y decida en menos de 250 ms.

### 5. Cliente
- `MesaTuteSubastado.svelte` envuelve `MesaBazas`, como `MesaJulepe`:
  - **Subasta:** el panel muestra lo último que dijo cada jugador junto a su asiento. En su turno, el jugador ve «Paso» y una rejilla con las pujas posibles. Las 18 pujas de 60 a 230 caben en 360 px en filas de 6.
  - **Triunfo:** cuatro botones con el palo.
  - **Bazas:** se reutilizan los botones de cantar de `MesaTute`. El marcador muestra «Pujador: X · 80» y la barra de puntos que lleva frente a la puja.
- `ResumenTuteSubastado.svelte`: una tabla como la del Julepe, con el pujador marcado, «Cumple»/«Falla» y las fichas.
- **Fin:** clasificación por fichas, como en el Julepe.
- Pausa de la IA: la misma que en el Tute.

## Risks / Trade-offs

- **[La IA puja mal y el difícil no gana a la normal]** → como el difícil puja igual que la normal, su ventaja está en el triunfo y en las cartas. Si no basta, se sube el presupuesto en las primeras bazas, donde más pesa.
- **[Defensores que se pisan los puntos]** → superar es obligatorio, así que un defensor a veces tiene que ganar la baza a otro defensor. La IA lo acepta; solo elige mejor cuando puede.
- **[Pujas muy altas sin sentido]** → la básica no pasa de su estimación, y la estimación nunca supera 130 sin cantes.
- **[Empates en la clasificación]** → la pantalla de fin ya muestra varios ganadores en el Julepe y el Burro; se reutiliza.
