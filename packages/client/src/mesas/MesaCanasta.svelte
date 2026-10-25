<script lang="ts">
  import {
    basePinacle,
    esCanasta,
    esCanastaLimpia,
    esComodinCanasta,
    esTresNegro,
    firmaCanasta,
    puntosCanasta,
    type AccionCanasta,
    type Asiento,
    type CartaCanasta,
    type CombinacionCanasta,
    type ConfigCanasta,
    type EstadoCanasta,
    type VistaCanasta,
  } from '@juegos/engine';
  import Carta from '../cartas/Carta.svelte';
  import { nombreCarta } from '../cartas/dibujo';
  import { bandoDe, type SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import AsientoRival from './bazas/AsientoRival.svelte';
  import { lado, nombreAsiento } from './bazas/asientos';
  import ResumenCanasta from './ResumenCanasta.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCanasta, EstadoCanasta, AccionCanasta, VistaCanasta>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);
  const legales = $derived(sesion.legales);
  const n = 4;
  const yo = $derived(sesion.asiento);
  /** Bando del jugador; las combinaciones, los puntos y el resumen se ven desde él. */
  const mio = $derived(bandoDe(yo) as 0 | 1);
  const rivales = $derived([1, 2, 3].map((k) => (yo + k) % n));
  const nombre = (asiento: Asiento) => nombreAsiento(asiento, n, yo, sesion.red);
  const lados = [T.brisca.nosotros, T.brisca.ellos];

  const miTurno = $derived(vista.turno === yo && sesion.fin === null);
  const nombreDe = (c: CartaCanasta) => nombreCarta(basePinacle(c)).toLowerCase();

  // ── Selección ──────────────────────────────────────────────────────────────

  let seleccion: CartaCanasta[] = $state([]);
  // La selección se vacía al cambiar de turno, de fase o de mano.
  $effect(() => {
    void vista.turno;
    void vista.fase;
    void vista.numeroMano;
    seleccion = [];
  });

  function tocarCarta(c: CartaCanasta) {
    if (!miTurno) return;
    seleccion = seleccion.includes(c) ? seleccion.filter((x) => x !== c) : [...seleccion, c];
  }

  function jugar(accion: AccionCanasta | undefined) {
    if (!accion) return;
    seleccion = [];
    sesion.jugar(accion);
  }

  // Los palos no cuentan: cada jugada se busca por su firma (valor, naturales, jokers y doses).
  const firma = $derived(firmaCanasta(seleccion));
  const conFirma = (a: AccionCanasta) =>
    (a.tipo === 'bajar' || a.tipo === 'anadir' || a.tipo === 'tomarPozo') && firmaCanasta(a.cartas) === firma;

  const robar = $derived(legales.find((a) => a.tipo === 'robar'));
  const cogerPozo = $derived(legales.find((a) => a.tipo === 'tomarPozo' && conFirma(a)));
  const bajar = $derived(seleccion.length >= 3 ? legales.find((a) => a.tipo === 'bajar' && conFirma(a)) : undefined);
  const anadirA = (c: CombinacionCanasta) =>
    seleccion.length > 0
      ? legales.find((a) => a.tipo === 'anadir' && a.combinacion === c.id && conFirma(a))
      : undefined;
  const descartar = $derived(
    seleccion.length === 1
      ? legales.find((a) => a.tipo === 'descartar' && basePinacle(a.carta) === basePinacle(seleccion[0]!))
      : undefined,
  );
  const deshacer = $derived(legales.find((a) => a.tipo === 'deshacer'));
  const acabar = $derived(legales.find((a) => a.tipo === 'acabar'));
  const puedePozo = $derived(legales.some((a) => a.tipo === 'tomarPozo'));

  // ── Pozo y estado ──────────────────────────────────────────────────────────

  const arriba = $derived(vista.pozo.at(-1) ?? null);
  const tapado = $derived(arriba !== null && (esTresNegro(arriba) || esComodinCanasta(arriba)));
  const estadoPozo = $derived.by(() => {
    if (tapado) return T.canasta.tapado;
    if (vista.congelado) return T.canasta.congelado;
    if (!vista.abierto[mio]) return T.canasta.congeladoParaTi;
    return '';
  });

  const valorDe = (cartas: readonly CartaCanasta[]) => cartas.reduce((s, c) => s + puntosCanasta(c), 0);
  const propias = $derived(vista.combinaciones.filter((c) => c.bando === mio));
  const ajenas = $derived(vista.combinaciones.filter((c) => c.bando !== mio));
  const bajadoTurno = $derived(propias.reduce((s, c) => s + valorDe(c.cartas), 0));

  const turno = $derived.by(() => {
    if (sesion.fin !== null || vista.turno === null) return '';
    if (sesion.pensando !== null) {
      return `${T.brisca.turnoDe(nombre(sesion.pensando))} · ${T.brisca.pensando}`;
    }
    if (vista.turno !== yo) return T.brisca.turnoDe(nombre(vista.turno));
    if (vista.fase === 'robar') return puedePozo ? T.canasta.faseRobarPozo : T.canasta.faseRobar;
    if (vista.apertura !== null) return T.canasta.faltaMinimo(vista.minimos[mio]! - bajadoTurno);
    return T.canasta.faseBajar;
  });

  const avisoRival = $derived.by(() => {
    const u = vista.ultimaAccion;
    if (u === null || u.asiento === yo) return null;
    const quien = nombre(u.asiento);
    const a = u.accion;
    if (a.tipo === 'robar') return T.canasta.roba(quien);
    if (a.tipo === 'tomarPozo') return T.canasta.seLleva(quien);
    if (a.tipo === 'bajar') return T.canasta.baja(quien);
    if (a.tipo === 'anadir') return T.canasta.anade(quien);
    if (a.tipo === 'deshacer') return T.canasta.deshace(quien);
    if (a.tipo === 'acabar') return T.canasta.acaba(quien);
    return T.canasta.descarta(quien, nombreDe(a.carta));
  });

  const NUMEROS: Record<number, string> = { 1: 'A', 3: '3', 11: 'J', 12: 'Q', 13: 'K' };
  const numero = (v: number) => NUMEROS[v] ?? String(v);

  // ── Resumen al terminar cada mano ──────────────────────────────────────────

  let resumen = $state(false);
  /** Manos terminadas ya vistas; `null` hasta la primera lectura (al retomar una partida). */
  let manosVistas: number | null = null;
  $effect(() => {
    const total = vista.resultadosManos.length;
    if (manosVistas !== null && total > manosVistas && sesion.fin === null) {
      resumen = true;
      sesion.pausar();
    }
    manosVistas = total;
  });

  function siguienteMano() {
    resumen = false;
    sesion.reanudar();
  }
</script>

{#snippet combinacion(c: CombinacionCanasta, propia: boolean)}
  {@const anadir = propia ? anadirA(c) : undefined}
  <div
    class="combi"
    class:canasta={esCanasta(c)}
    class:limpia={esCanastaLimpia(c)}
    class:tocable={anadir !== undefined}
    data-testid="combi-{c.id}"
    data-valor={c.valor}
    role="button"
    tabindex="-1"
    aria-label={T.canasta.combinacion(numero(c.valor), c.cartas.length)}
    onclick={() => jugar(anadir)}
    onkeydown={() => {}}
  >
    <div class="cartas-combi">
      {#each c.cartas.slice(0, 4) as carta (carta)}
        <div class="mini"><Carta id={basePinacle(carta)} /></div>
      {/each}
    </div>
    <span class="cuenta-combi">
      {c.cartas.length}{#if esCanasta(c)}
        · {esCanastaLimpia(c) ? T.canasta.limpia : T.canasta.sucia}{/if}
    </span>
  </div>
{/snippet}

<div class="canasta-mesa">
  <div class="info">
    {#each [0, 1] as k (k)}
      {@const b = k === 0 ? mio : 1 - mio}
      <span data-testid="puntos-bando-{k}">{lados[k]}: {T.canasta.puntos(vista.puntos[b] ?? 0)}</span>
    {/each}
    <span>{T.canasta.mano(vista.numeroMano)}</span>
    {#if !vista.abierto[mio]}
      <span class="minimo" data-testid="minimo">{T.canasta.minimo(vista.minimos[mio]!)}</span>
    {/if}
  </div>

  {#each rivales as asiento (asiento)}
    <AsientoRival
      {asiento}
      lado={lado(asiento, n, yo)}
      nombre={nombre(asiento)}
      detalle={T.canasta.cartas(vista.cartasEnMano[asiento] ?? 0)}
      cartas={Math.min(vista.cartasEnMano[asiento] ?? 0, 11)}
      activo={vista.turno === asiento && sesion.fin === null}
    />
  {/each}

  <div class="centro">
    <div class="pilas">
      <div
        class="pila"
        class:robable={robar !== undefined}
        data-testid="mazo"
        role="button"
        tabindex="-1"
        aria-label={T.canasta.robar}
        onclick={() => jugar(robar)}
        onkeydown={() => {}}
      >
        {#if vista.cartasEnMazo > 0}<Carta />{/if}
        <span class="cuenta" aria-hidden="true">{vista.cartasEnMazo}</span>
      </div>
      <div class="pila" class:robable={cogerPozo !== undefined} class:congelado={vista.congelado} data-testid="pozo">
        {#if arriba}
          {#if vista.pozo.length > 1}<div class="debajo" data-carta={vista.pozo.at(-2)}><Carta id={basePinacle(vista.pozo.at(-2)!)} /></div>{/if}
          <div class="arriba" data-carta={arriba}><Carta id={basePinacle(arriba)} /></div>
          <span class="cuenta" aria-hidden="true" data-testid="cartas-pozo">{vista.pozo.length}</span>
        {/if}
      </div>
    </div>
    {#if estadoPozo}<p class="estado-pozo" data-testid="estado-pozo">{estadoPozo}</p>{/if}
    {#if avisoRival}<p class="aviso" role="status" data-testid="aviso">{avisoRival}</p>{/if}
  </div>

  <section class="mesa-combis">
    {#each [mio, 1 - mio] as b, k (b)}
      <div class="bloque" data-testid={k === 0 ? 'combis-propias' : 'combis-ajenas'}>
        <h3>
          {lados[k]}
          {#if vista.treses[b]!.length > 0}
            <span class="treses" data-testid="treses-{k}">· {T.canasta.treses(vista.treses[b]!.length)}</span>
          {/if}
        </h3>
        {#each k === 0 ? propias : ajenas as c (c.id)}
          {@render combinacion(c, k === 0)}
        {:else}
          <p class="vacio">{T.canasta.sinCombinaciones}</p>
        {/each}
      </div>
    {/each}
  </section>

  <div class="propio" class:activo={miTurno}>
    <div class="estado">
      <span class="nombre">{T.brisca.tu}</span>
      <span class="turno" role="status" data-testid="turno">{turno}</span>
    </div>
    {#if miTurno}
      <div class="botones">
        {#if vista.fase === 'robar'}
          {#if robar}
            <button class="principal" data-testid="robar" onclick={() => jugar(robar)}>{T.canasta.robar}</button>
          {/if}
          {#if puedePozo}
            <button data-testid="coger-pozo" disabled={!cogerPozo} onclick={() => jugar(cogerPozo)}>
              {T.canasta.cogerPozo}
            </button>
          {/if}
          {#if acabar}
            <button data-testid="acabar" onclick={() => jugar(acabar)}>{T.canasta.acabar}</button>
          {/if}
        {:else}
          <button class="principal" data-testid="bajar" disabled={!bajar} onclick={() => jugar(bajar)}>
            {T.canasta.bajar}
          </button>
          <button data-testid="descartar" disabled={!descartar} onclick={() => jugar(descartar)}>
            {T.canasta.descartar}
          </button>
          {#if deshacer}
            <button data-testid="deshacer" onclick={() => jugar(deshacer)}>{T.canasta.deshacer}</button>
          {/if}
        {/if}
        {#if seleccion.length > 0}
          <button data-testid="limpiar" onclick={() => (seleccion = [])}>{T.canasta.limpiar}</button>
        {/if}
      </div>
    {/if}
    <div class="mano" data-testid="mano">
      {#each vista.miMano ?? [] as c (c)}
        <button
          class="carta-mano"
          class:seleccionada={seleccion.includes(c)}
          class:bloqueada={vista.apertura?.bloqueadas.includes(c)}
          data-testid="mano-{c}"
          data-carta={c}
          aria-pressed={seleccion.includes(c)}
          disabled={!miTurno}
          onclick={() => tocarCarta(c)}
        >
          <Carta id={basePinacle(c)} />
        </button>
      {/each}
    </div>
  </div>
</div>

{#if resumen && vista.resultadosManos.at(-1)}
  {@const u = vista.resultadosManos.at(-1)!}
  <div class="velo">
    <div class="dialogo" role="dialog" aria-modal="true" aria-labelledby="fin-mano" data-testid="panel-mano">
      <h2 id="fin-mano">{T.canasta.finMano(u.numero)}</h2>
      <p>{u.cierra === null ? T.canasta.mazoAgotado : T.canasta.cierra(nombre(u.cierra))}</p>
      <ResumenCanasta resultado={u} lados={[lados[0]!, lados[1]!]} bando={mio} />
      <button class="principal" onclick={siguienteMano} data-testid="siguiente-mano">
        {T.canasta.siguienteMano}
      </button>
    </div>
  </div>
{/if}

<style>
  .canasta-mesa {
    --ancho-carta: min(15vw, 9dvh, 70px);
    --alto-carta: calc(var(--ancho-carta) * 1.4);
    --ancho-rival: min(8vw, 5dvh, 40px);
    --ancho-mini: min(7vw, 4.4dvh, 32px);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'info info info'
      'arriba arriba arriba'
      'izquierda centro derecha'
      'combis combis combis'
      'abajo abajo abajo';
    gap: 6px;
    width: min(100%, 900px);
    min-height: calc(100dvh - 60px);
    margin: 0 auto;
    padding: 0 8px 12px;
    user-select: none;
    -webkit-user-select: none;
  }

  .info {
    grid-area: info;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px 14px;
    color: var(--texto-suave);
    font-size: 0.88rem;
  }

  .minimo {
    color: var(--acento);
    font-weight: 600;
  }

  .centro {
    grid-area: centro;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .pilas {
    display: flex;
    gap: clamp(14px, 6vw, 40px);
  }

  .pila {
    position: relative;
    width: var(--ancho-carta);
    height: var(--alto-carta);
    border-radius: 7%;
    outline: 2px dashed rgb(255 255 255 / 0.2);
    outline-offset: -2px;
  }

  .pila.robable {
    cursor: pointer;
    outline: 3px solid rgb(255 224 102 / 0.7);
    outline-offset: 2px;
  }

  .debajo,
  .arriba {
    position: absolute;
    inset: 0;
  }

  /* Un comodín en el pozo lo congela: la de debajo asoma girada. */
  .pila.congelado .debajo {
    rotate: 90deg;
  }

  .cuenta {
    position: absolute;
    right: 3px;
    bottom: 3px;
    padding: 0 5px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    background: rgb(0 0 0 / 0.55);
  }

  .estado-pozo {
    margin: 0;
    font-size: 0.82rem;
    color: #9fd3ff;
  }

  .aviso {
    margin: 0;
    padding: 4px 12px;
    border-radius: 14px;
    font-size: 0.9rem;
    text-align: center;
    background: rgb(0 0 0 / 0.35);
  }

  .mesa-combis {
    grid-area: combis;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    max-height: 30dvh;
    overflow-y: auto;
  }

  .bloque {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px 10px;
    min-width: 0;
    padding: 6px;
    border-radius: 10px;
    background: rgb(0 0 0 / 0.15);
  }

  .bloque h3 {
    flex-basis: 100%;
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--texto-suave);
  }

  .treses {
    color: #ff9a9a;
  }

  .vacio {
    margin: 0;
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .combi {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 2px;
    border-radius: 6px;
  }

  .cartas-combi {
    display: flex;
    padding-right: calc(var(--ancho-mini) * 0.55);
  }

  .cartas-combi .mini {
    margin-right: calc(var(--ancho-mini) * -0.55);
  }

  .mini {
    width: var(--ancho-mini);
    height: calc(var(--ancho-mini) * 1.4);
    flex-shrink: 0;
  }

  .cuenta-combi {
    font-size: 0.72rem;
    color: var(--texto-suave);
  }

  .combi.canasta {
    background: rgb(255 224 102 / 0.15);
  }

  .combi.limpia {
    background: rgb(255 154 154 / 0.2);
  }

  .combi.tocable {
    cursor: pointer;
    outline: 2px solid rgb(255 224 102 / 0.7);
    outline-offset: 2px;
  }

  .propio {
    grid-area: abajo;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .estado,
  .botones {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 6px 10px;
  }

  .estado {
    min-height: 36px;
  }

  .nombre {
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
    background: rgb(0 0 0 / 0.2);
  }

  .activo .nombre {
    background: var(--acento);
    color: #2b2005;
  }

  .turno {
    font-weight: 600;
    text-align: center;
  }

  /* La mano se reparte en filas; cada carta tapa parte de la anterior y deja ver su índice. */
  .mano {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 6px;
    width: 100%;
    padding: 10px calc(var(--ancho-carta) * 0.55) 0 0;
  }

  .carta-mano {
    position: relative;
    width: calc(var(--ancho-carta) * 0.45);
    height: var(--alto-carta);
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    transition: translate 120ms;
  }

  .carta-mano:disabled {
    opacity: 1;
    cursor: default;
  }

  .carta-mano :global(.carta) {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--ancho-carta);
    height: var(--alto-carta);
  }

  .carta-mano.seleccionada {
    translate: 0 -10px;
  }

  .carta-mano.seleccionada :global(.carta) {
    outline: 3px solid var(--resalte);
    border-radius: 7%;
  }

  .carta-mano.bloqueada :global(.carta) {
    filter: brightness(0.75);
  }

  .velo {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 16px;
    background: rgb(0 0 0 / 0.5);
    z-index: 1500;
  }

  .dialogo {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(100%, 460px);
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: 18px;
    border-radius: 16px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.2);
    box-shadow: var(--sombra-alta);
  }

  .dialogo h2 {
    font-size: 1.2rem;
    margin: 0;
  }

  .dialogo p {
    margin: 0;
  }
</style>
